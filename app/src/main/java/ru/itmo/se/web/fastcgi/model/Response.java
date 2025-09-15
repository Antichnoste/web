package ru.itmo.se.web.fastcgi.model;

import java.time.LocalDateTime;

/**
 * Класс для формирования ответа
 */
public class Response {
    /**
     * Это время выполнения обработки
     */
    private final long time;
    private final LocalDateTime now;
    private final boolean result;

    public Response(long time, LocalDateTime now, boolean result) {
        this.time = time;
        this.now = now;
        this.result = result;
    }

    public static Response fromAttempt(AttemptResult attempt) {
        return new Response(attempt.getExecTimeNanos(), attempt.getNow(), attempt.isResult());
    }

    public String toJson() {
        return String.format("""
                {
                    "time": "%d",
                    "now": "%s",
                    "result": %b
                }
                """, time, now, result);
    }

    public static String errorJson(LocalDateTime now, String reason) {
        return String.format("""
                {
                    "now": "%s",
                    "reason": "%s"
                }
                """, now, reason.replace("\"", "\\\""));
    }
}
