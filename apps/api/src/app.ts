import { Hono } from "hono";

export const app = new Hono();

app.get("/", (c) => c.text("scroll-smith api"));
app.get("/health", (c) => c.json({ status: "ok" }));
