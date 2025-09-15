package ru.itmo.se.web.fastcgi.model;

import ru.itmo.se.web.fastcgi.exception.ValidationException;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

/**
 * Класс получения и обработки запроса
 */
public class Request {
    private final float x;
    private final float y;
    private final float r;

    public Request(float x, float y, float r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    public float getX() { return x; }
    public float getY() { return y; }
    public float getR() { return r; }

    public static Request fromQuery(String query) throws ValidationException {
        if (query == null || query.isEmpty()) {
            throw new ValidationException("Missing query string");
        }
        Map<String, String> params = Arrays.stream(query.split("&"))
                .map(pair -> pair.split("="))
                .collect(Collectors.toMap(
                        pair -> URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                        pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8),
                        (a, b) -> b,
                        HashMap::new
                ));
        try {
            float x = Float.parseFloat(params.get("x"));
            float y = Float.parseFloat(params.get("y"));
            float r = Float.parseFloat(params.get("r"));
            return new Request(x, y, r);
        } catch (Exception e) {
            throw new ValidationException("Некорректные параметры! Вводите числа!");
        }
    }
}
