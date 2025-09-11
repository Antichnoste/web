package ru.itmo.se.web.fastcgi;

import java.util.Arrays;
import java.util.Properties;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class SimpleFormUrlencodedParser {
    public Properties parseInput(String input) {
        var props = new Properties();
        if (input == null || input.isEmpty()) {
            return props;
        }
        Arrays.stream(input.split("&"))
            .map(kv -> kv.split("=", 2))
            .forEach(parts -> {
                var key = parts.length > 0 ? URLDecoder.decode(parts[0], StandardCharsets.UTF_8) : "";
                var value = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
                props.setProperty(key, value);
            });
        return props;
    }
}
