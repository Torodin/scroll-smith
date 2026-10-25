import { Hono } from "hono";
import type { Db } from "./db/client.ts";
import { healthRoutes } from "./modules/health/health.routes.ts";

// `db` will be passed to feature services as modules are added
export function createApp(_db: Db) {
  return new Hono().get("/", (c) => c.text("scroll-smith api")).route("/health", healthRoutes);
}

export type AppType = ReturnType<typeof createApp>;
