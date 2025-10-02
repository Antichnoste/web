package ru.itmo.se.web.fastcgi.model;

import java.time.LocalDateTime;

/**
 * Класс для хранения попытки
 */
public class AttemptResult {
    private final float x;
    private final float y;
    private final float r;
    private final long execTimeNanos;
    private final LocalDateTime now;
    private final boolean result;

    public AttemptResult(float x, float y, float r, long execTimeNanos, LocalDateTime now, boolean result) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.execTimeNanos = execTimeNanos;
        this.now = now;
        this.result = result;
    }

    public float getX() { return x; }
    public float getY() { return y; }
    public float getR() { return r; }
    public long getExecTimeNanos() { return execTimeNanos; }
    public LocalDateTime getNow() { return now; }
    public boolean isResult() { return result; }

    @Override
    public String toString() {
        return String.format(
                "AttemptResult[x=%.2f, y=%.2f, r=%.2f, execTimeNanos=%d, now=%s, result=%s]",
                x, y, r, execTimeNanos, now, result
        );
    }
}
