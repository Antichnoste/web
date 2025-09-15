package ru.itmo.se.web.fastcgi.exception;

/**
 * Класс ошибки валидации данных
 */
public class ValidationException extends Exception {
    public ValidationException(String message) {
        super(message);
    }
}
