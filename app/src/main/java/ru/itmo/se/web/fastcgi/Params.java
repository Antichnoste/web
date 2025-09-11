package ru.itmo.se.web.fastcgi;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

class Params {
    private final float x;
    private final int y;
    private final int r;

    public Params(String query) throws ValidationException {
        if (query == null || query.isEmpty()) {
            throw new ValidationException("Missing query string");
        }
        var params = splitQuery(query);
        validateParams(params);
        this.x = Float.parseFloat(params.get("x"));
        this.y = Integer.parseInt(params.get("y"));
        this.r = Integer.parseInt(params.get("r"));
    }

    private static Map<String, String> splitQuery(String query) {
        return Arrays.stream(query.split("&"))
                .map(pair -> pair.split("="))
                .collect(
                        Collectors.toMap(
                                pairParts -> URLDecoder.decode(pairParts[0], StandardCharsets.UTF_8),
                                pairParts -> URLDecoder.decode(pairParts[1], StandardCharsets.UTF_8),
                                (a, b) -> b,
                                HashMap::new
                        )
                );
    }


    private static void validateParams(Map<String, String> params) throws ValidationException {
        var x = params.get("x");
        if (x == null || x.isEmpty()) {
            throw new ValidationException("x is invalid");
        }

        try {
            var xx = Float.parseFloat(x);
            if (xx < -2 || xx > 2) {
                throw new ValidationException("x has forbidden value");
            }
        } catch (NumberFormatException e) {
            throw new ValidationException("x is not a number");
        }

        var y = params.get("y");
        if (y == null || y.isEmpty()) {
            throw new ValidationException("y is invalid");
        }

        try {
            var yy = Integer.parseInt(y);
            if (yy < -3 || yy > 5) {
                throw new ValidationException("y has forbidden value");
            }
        } catch (NumberFormatException e) {
            throw new ValidationException("y is not a number");
        }

        var r = params.get("r");
        if (r == null || r.isEmpty()) {
            throw new ValidationException("r is invalid");
        }

        try {
            var rr = Integer.parseInt(r);
            if (rr < 1 || rr > 4) {
                throw new ValidationException("r has forbidden value");
            }
        } catch (NumberFormatException e) {
            throw new ValidationException("r is not a number");
        }
    }


    public float getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getR() {
        return r;
    }
}