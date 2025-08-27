package org.simucorps.slopify.server;
import io.javalin.Javalin;
import org.simucorps.slopify.server.records.*;

public class Main {
    public static void main(String[] args) {
        var app = Javalin.create()
                .get("/", ctx -> ctx.json(new TestingRecord("Hello", "World!")))
                .start(7070);
    }
}