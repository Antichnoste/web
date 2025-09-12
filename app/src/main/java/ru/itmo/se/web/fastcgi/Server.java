package ru.itmo.se.web.fastcgi;

import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class Server {
    private static final String HTTP_RESPONSE = """
            HTTP/1.1 200 OK
            Content-Type: application/json
            Content-Length: %d
            
            %s
            """;
    private static final String HTTP_ERROR = """
            HTTP/1.1 400 Bad Request
            Content-Type: application/json
            Content-Length: %d
            
            %s
            """;
    private static final String RESULT_JSON = """
            {
                "time": "%s",
                "now": "%s",
                "result": %b
            }
            """;
    private static final String ERROR_JSON = """
            {
                "now": "%s",
                "reason": "%s"
            }
            """;


    public static void main(String[] args) {
        var fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            try {
                var props = System.getProperties();
                var requestMethod = props.getProperty("REQUEST_METHOD", "");
                String rawQuery;

                if ("POST".equalsIgnoreCase(requestMethod)) {
                    var contentType = props.getProperty("CONTENT_TYPE", "");
                    var contentLengthStr = props.getProperty("CONTENT_LENGTH", "0");
                    int contentLength;
                    try {
                        contentLength = Integer.parseInt(contentLengthStr);
                    } catch (NumberFormatException e) {
                        contentLength = 0;
                    }

                    if (contentLength <= 0 || !contentType.startsWith("application/x-www-form-urlencoded")) {
                        throw new ValidationException("Missing query string");
                    }

                    var bodyBytes = System.in.readNBytes(contentLength);
                    rawQuery = new String(bodyBytes, StandardCharsets.UTF_8);
                } else {
                    rawQuery = props.getProperty("QUERY_STRING");
                }

                var params = new Params(rawQuery);

                var startTime = Instant.now();
                var result = calculate(params.getX(), params.getY(), params.getR());
                var endTime = Instant.now();

                var json = String.format(RESULT_JSON, ChronoUnit.NANOS.between(startTime, endTime), LocalDateTime.now(), result);
                var response = String.format(HTTP_RESPONSE, json.getBytes(StandardCharsets.UTF_8).length + 2, json);
                System.out.println(response);
            } catch (ValidationException e) {
                var json = String.format(ERROR_JSON, LocalDateTime.now(), e.getMessage());
                var response = String.format(HTTP_ERROR, json.getBytes(StandardCharsets.UTF_8).length + 2, json);
                System.out.println(response);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private static boolean calculate(float  x, float y, float r) {
        if (x >= 0 && y >= 0 && x <= r && y <= r) {
            return true;
        }

        if (x <= 0 && y >= 0 && Math.abs(x) + y <= r) {
            return true;
        }

        if (x <= 0 && y <= 0 && x * x + y * y <= r * r) {
            return true;
        }

        return false;
    }
}