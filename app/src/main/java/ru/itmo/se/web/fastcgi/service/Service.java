package ru.itmo.se.web.fastcgi.service;

import ru.itmo.se.web.fastcgi.exception.ValidationException;
import ru.itmo.se.web.fastcgi.model.AttemptResult;
import ru.itmo.se.web.fastcgi.model.Request;
import ru.itmo.se.web.fastcgi.model.Response;
import ru.itmo.se.web.fastcgi.model.repository.Repository;
import ru.itmo.se.web.fastcgi.validation.Validator;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Основная логика
 */
public class    Service {
    private final Repository repository = new Repository();
    private final Validator validator = new Validator();

    public Response process(Request request) throws ValidationException {
        validator.validate(request);

        Instant start = Instant.now();
        boolean result = calculate(request.getX(), request.getY(), request.getR());
        Instant end = Instant.now();

        AttemptResult attempt = new AttemptResult(
                request.getX(), request.getY(), request.getR(),
                ChronoUnit.NANOS.between(start, end),
                LocalDateTime.now(),
                result
        );

        repository.save(attempt); // потом это будет связано с бд

        return Response.fromAttempt(attempt);
    }

    private boolean calculate(float x, float y, float r) {
        if (x >= 0 && y >= 0 && x <= r && y <= r) return true;
        if (x <= 0 && y >= 0 && Math.abs(x) + y <= r) return true;
        if (x <= 0 && y <= 0 && x * x + y * y <= r * r) return true;
        return false;
    }
}
