package ru.itmo.se.web.fastcgi;

class ValidationException extends Exception {
    public ValidationException(String message) {
        super(message);
    }
}
