import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

test("species", async () => {
  const app = createApp(createDb(":memory:"));
  expect(await (await app.request("/species")).json()).toHaveLength(9);
  expect((await app.request("/species/1")).status).toBe(200);
  expect((await app.request("/species/999")).status).toBe(404);
  expect((await app.request("/species/abc")).status).toBe(400);
});
