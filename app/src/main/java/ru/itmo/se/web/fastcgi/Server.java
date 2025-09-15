package ru.itmo.se.web.fastcgi;

import ru.itmo.se.web.fastcgi.controller.Controller;

/**
 * Главный класс веб-сервера
 */
public class Server {
    public static void main(String[] args) {
        new Controller().run();
    }
}