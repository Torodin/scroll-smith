import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const base = { speciesId: 1, backgroundId: 1, classId: 1 };

test("character CRUD", async () => {
  const app = createApp(createDb(":memory:"));

  const created = await app.request("/characters", json("POST", { name: "Aria", ...base }));
  expect(created.status).toBe(201);
  expect(await created.json()).toMatchObject({ id: 1, name: "Aria", level: 1, str: 10, ...base });

  expect(await (await app.request("/characters")).json()).toHaveLength(1);
  expect((await app.request("/characters/1")).status).toBe(200);

  const patched = await app.request("/characters/1", json("PATCH", { level: 3, classId: 2 }));
  expect(await patched.json()).toMatchObject({ name: "Aria", level: 3, dex: 10, classId: 2 });

  expect((await app.request("/characters/1", { method: "DELETE" })).status).toBe(204);
  expect((await app.request("/characters/1")).status).toBe(404);
  expect((await app.request("/characters/1", { method: "DELETE" })).status).toBe(404);
});

test("validation and foreign keys", async () => {
  const app = createApp(createDb(":memory:"));
  const post = (body: unknown) => app.request("/characters", json("POST", body));
  expect((await post({ name: "", ...base })).status).toBe(400);
  expect((await post({ name: "A", ...base, level: 21 })).status).toBe(400);
  expect((await app.request("/characters/abc")).status).toBe(400);
  expect((await post({ name: "A" })).status).toBe(400);
  expect((await post({ name: "A", speciesId: 1, backgroundId: 1 })).status).toBe(400);
  expect((await post({ name: "A", ...base, classId: null })).status).toBe(400);
  expect((await post({ name: "A", ...base, classId: 99 })).status).toBe(400);
  await post({ name: "B", ...base });
  expect((await app.request("/characters/1", json("PATCH", {}))).status).toBe(400);
  expect((await app.request("/characters/1", json("PATCH", { speciesId: null }))).status).toBe(400);
  expect((await app.request("/characters/1", json("PATCH", { classId: 99 }))).status).toBe(400);
  expect((await app.request("/characters/99", json("PATCH", { name: "x" }))).status).toBe(404);
});
