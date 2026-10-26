import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

test("classes", async () => {
  const app = createApp(createDb(":memory:"));
  expect(await (await app.request("/classes")).json()).toHaveLength(12);
  expect((await app.request("/classes/1")).status).toBe(200);
  expect((await app.request("/classes/999")).status).toBe(404);
  expect((await app.request("/classes/abc")).status).toBe(400);
});
