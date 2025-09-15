package ru.itmo.se.web.fastcgi.controller;

import com.fastcgi.FCGIInterface;
import ru.itmo.se.web.fastcgi.exception.ValidationException;
import ru.itmo.se.web.fastcgi.model.Request;
import ru.itmo.se.web.fastcgi.model.Response;
import ru.itmo.se.web.fastcgi.service.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Properties;

/**
 * Только маршруты и делегирование
 */
public class Controller {
    private final Service service = new Service();


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

    public void run() {
        var fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            try {
                Properties props = System.getProperties();
                String requestMethod = props.getProperty("REQUEST_METHOD", "");
                String rawQuery;

                if ("POST".equalsIgnoreCase(requestMethod)) {
                    String contentType = props.getProperty("CONTENT_TYPE", "");
                    int contentLength = Integer.parseInt(props.getProperty("CONTENT_LENGTH", "0"));
                    if (contentLength <= 0 || !contentType.startsWith("application/x-www-form-urlencoded")) {
                        throw new ValidationException("Missing query string");
                    }
                    byte[] bodyBytes = System.in.readNBytes(contentLength);
                    rawQuery = new String(bodyBytes, StandardCharsets.UTF_8);
                } else {
                    rawQuery = props.getProperty("QUERY_STRING");
                }

                Request request = Request.fromQuery(rawQuery);
                Response response = service.process(request);

                String json = response.toJson(); // преобразуем наш ответ в json
                String http = String.format(HTTP_RESPONSE, json.getBytes(StandardCharsets.UTF_8).length + 2, json);
                System.out.println(http);
            } catch (ValidationException e) {
                String json = Response.errorJson(LocalDateTime.now(), e.getMessage());
                String http = String.format(HTTP_ERROR, json.getBytes(StandardCharsets.UTF_8).length + 2, json);
                System.out.println(http);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
