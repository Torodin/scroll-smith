import { Hono } from "hono";
import { healthRoutes } from "./modules/health/health.routes.ts";

export const app = new Hono();

app.get("/", (c) => c.text("scroll-smith api"));
app.route("/health", healthRoutes);
