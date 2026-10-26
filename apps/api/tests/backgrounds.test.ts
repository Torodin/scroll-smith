import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

test("backgrounds", async () => {
  const app = createApp(createDb(":memory:"));
  expect(await (await app.request("/backgrounds")).json()).toHaveLength(4);
  expect((await app.request("/backgrounds/1")).status).toBe(200);
  expect((await app.request("/backgrounds/999")).status).toBe(404);
  expect((await app.request("/backgrounds/abc")).status).toBe(400);
});
