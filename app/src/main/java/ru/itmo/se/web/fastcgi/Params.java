package ru.itmo.se.web.fastcgi;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

class Params {
    private final float x;
    private final float y;
    private final float r;

    public Params(String query) throws ValidationException {
        if (query == null || query.isEmpty()) {
            throw new ValidationException("Missing query string");
        }
        var params = splitQuery(query);
        validateParams(params);
        this.x = Float.parseFloat(params.get("x"));
        this.y = Float.parseFloat(params.get("y"));
        this.r = Float.parseFloat(params.get("r"));
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
        var errors = new ArrayList<String>();

        var x = params.get("x");
        if (x == null || x.isEmpty()) {
            errors.add("x может быть пустым");
        } else {
            try {
                ArrayList<Float> validateX = new ArrayList<Float>(Arrays.asList(-2.0f, -1.5f, -1.0f, -0.5f, 0.0f, 0.5f, 1.0f, 1.5f, 2.0f));
                var xx = Float.parseFloat(x);
                if (!validateX.contains(xx)) {
                    errors.add("x не может принимать такие значения");
                }
            } catch (NumberFormatException e) {
                errors.add("x не число");
            }
        }

        var y = params.get("y");
        if (y == null || y.isEmpty()) {
            errors.add("y не может быть пустым");
        } else {
            try {
                var yy = Float.parseFloat(y);
                if (yy < -3 || yy > 5) {
                    errors.add("y не может принимать такие значения");
                }
            } catch (NumberFormatException e) {
                errors.add("y не число");
            }
        }

        var r = params.get("r");
        if (r == null || r.isEmpty()) {
            errors.add("r не может быть пустым");
        } else {
            try {
                var rr = Float.parseFloat(r);
                if (rr < 1 || rr > 4) {
                    errors.add("r не может принимать такие значения");
                }
            } catch (NumberFormatException e) {
                errors.add("r не число");
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(String.join("<br>", errors));
        }
    }


    public float getX() {
        return x;
    }

    public float getY() {
        return y;
    }

    public float getR() {
        return r;
    }
}