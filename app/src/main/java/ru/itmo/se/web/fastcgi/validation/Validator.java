package ru.itmo.se.web.fastcgi.validation;

import ru.itmo.se.web.fastcgi.exception.ValidationException;
import ru.itmo.se.web.fastcgi.model.Request;

import java.util.Arrays;
import java.util.List;

public class Validator {
    private static final List<Float> VALID_X = Arrays.asList(-2.0f, -1.5f, -1.0f, -0.5f, 0.0f, 0.5f, 1.0f, 1.5f, 2.0f);

    public void validate(Request req) throws ValidationException {
        StringBuilder errors = new StringBuilder();

        if (!VALID_X.contains(req.getX())) {
            errors.append("x не может принимать такие значения<br>");
        }
        if (req.getY() < -3 || req.getY() > 5) {
            errors.append("y не может принимать такие значения<br>");
        }
        if (req.getR() < 1 || req.getR() > 4) {
            errors.append("r не может принимать такие значения<br>");
        }

        if (errors.length() > 0) {
            throw new ValidationException(errors.toString());
        }
    }
}
