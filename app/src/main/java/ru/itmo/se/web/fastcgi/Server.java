package ru.itmo.se.web.fastcgi;

import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Properties;

public class Server {
    public static void main(String[] args) throws IOException {
        var fcgiInterface = new FCGIInterface();
        while (fcgiInterface.FCGIaccept() >= 0) {
            var method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            var requestUri = FCGIInterface.request.params.getProperty("REQUEST_URI");

            if (method == null) {
                System.out.println(errorResult("Unsupported HTTP method: null"));
                continue;
            }

            // Обработка статических файлов
            if (method.equals("GET") && requestUri != null) {
                if (requestUri.equals("/style.css")) {
                    System.out.println(serveStaticFile("/front/style.css", "text/css"));
                    continue;
                }
                if (requestUri.equals("/script.js")) {
                    System.out.println(serveStaticFile("/front/script.js", "application/javascript"));
                    continue;
                }
            }

            if (method.equals("GET")) {
                var queryString = FCGIInterface.request.params.getProperty("QUERY_STRING");
                if (queryString != null && queryString.equals("debug=1")) {
                    var paramsDump = FCGIInterface.request
                            .params
                            .entrySet()
                            .stream()
                            .map((entry) -> "%s: %s".formatted(entry.getKey().toString(), entry.getValue().toString()))
                            .reduce("", (acc, el) -> acc + "\n" + el);
                    System.out.println(echoPage(paramsDump));
                } else {
                    System.out.println(serveStaticFile("/front/index.html", "text/html"));
                }
                continue;
            }

            if (method.equals("POST")) {
                var contentType = FCGIInterface.request.params.getProperty("CONTENT_TYPE");
                if (contentType == null) {
                    System.out.println(errorResult("Content-Type is null"));
                    continue;
                }

                if (!contentType.equals("application/x-www-form-urlencoded")) {
                    System.out.println(errorResult("Content-Type is not supported"));
                    continue;
                }

                var requestBody = simpleFormUrlEncodedParsing(readRequestBody());
                var xStr = requestBody.get("x");
                var yStr = requestBody.get("y");
                if (xStr == null || yStr == null) {
                    System.out.println(errorResult("X and Y must be provided as x-www-form-urlencoded params"));
                    continue;
                }

                int x, y;
                try {
                    x = Integer.parseInt(xStr.toString());
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("X must be an integer"));
                    continue;
                }
                try {
                    y = Integer.parseInt(yStr.toString());
                } catch (NumberFormatException e) {
                    System.out.println(errorResult("Y must be an integer"));
                    continue;
                }

                System.out.println(getResultPage(x, y, x + y));
                continue;
            }

            System.out.println(errorResult("Unsupported HTTP method: " + method));
        }
    }

    private static String serveStaticFile(String resourcePath, String contentType) {
        try (InputStream inputStream = Server.class.getResourceAsStream(resourcePath)) {
            if (inputStream == null) {
                return errorResult("File not found: " + resourcePath);
            }

            String content = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            return """
                HTTP/1.1 200 OK
                Content-Type: %s
                Content-Length: %d
                
                %s
                """.formatted(contentType, content.getBytes(StandardCharsets.UTF_8).length, content);
        } catch (IOException e) {
            return errorResult("Error reading file: " + e.getMessage());
        }
    }

    private static String getResultPage(int x, int y, int sum) {
        String content = """
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Результат вычисления</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>Результат вычисления</h1>
                    <div class="result">
                        <p><strong>%d + %d = %d</strong></p>
                    </div>
                    <button class="back-button" onclick="window.location.href='/'">Вернуться назад</button>
                </div>
            </body>
            </html>
            """.formatted(x, y, sum);

        return """
            HTTP/1.1 200 OK
            Content-Type: text/html
            Content-Length: %d
            
            %s
            """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static Properties simpleFormUrlEncodedParsing(String requestBodyStr) {
        var props = new Properties();
        Arrays.stream(requestBodyStr.split("&"))
                .forEach(keyValue -> {
                    String[] parts = keyValue.split("=", 2);
                    if (parts.length == 2) {
                        props.setProperty(parts[0], parts[1]);
                    }
                });
        return props;
    }

    private static String readRequestBody() throws IOException {
        FCGIInterface.request.inStream.fill();
        var contentLength = FCGIInterface.request.inStream.available();
        ByteBuffer buffer = ByteBuffer.allocate(contentLength);
        var readBytes = FCGIInterface.request.inStream.read(buffer.array(), 0, contentLength);
        var requestBodyRaw = new byte[readBytes];
        buffer.get(requestBodyRaw);
        buffer.clear();
        return new String(requestBodyRaw, StandardCharsets.UTF_8);
    }

    private static String errorResult(String error) {
        String content = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ошибка</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    <div class="error">
                        <h1>Ошибка</h1>
                        <p>%s</p>
                        <button class="back-button" onclick="window.location.href='/'">Вернуться назад</button>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(error);

        return """
            HTTP/1.1 400 Bad Request
            Content-Type: text/html
            Content-Length: %d
            
            %s
            """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static String echoPage(String echo) {
        String content = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Debug Info</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>Debug Information</h1>
                    <pre>%s</pre>
                    <button class="back-button" onclick="window.location.href='/'">Вернуться назад</button>
                </div>
            </body>
            </html>
            """.formatted(echo);

        return """
            HTTP/1.1 200 OK
            Content-Type: text/html
            Content-Length: %d
            
            %s
            """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }
}