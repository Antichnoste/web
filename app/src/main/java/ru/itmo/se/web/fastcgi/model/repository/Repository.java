package ru.itmo.se.web.fastcgi.model.repository;

import ru.itmo.se.web.fastcgi.model.AttemptResult;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Класс для базы данных, пока не нужен, но пусть будет
 */
public class Repository {
    private final List<AttemptResult> attempts = new ArrayList<>();

    public void save(AttemptResult attempt) {
        attempts.add(attempt);
    }
}
