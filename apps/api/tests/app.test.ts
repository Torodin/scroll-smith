import { expect, test } from "vite-plus/test";
import { app } from "../src/app.ts";

test("GET /health", async () => {
  const res = await app.request("/health");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});
