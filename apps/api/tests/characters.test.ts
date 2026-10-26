import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

test("character CRUD", async () => {
  const app = createApp(createDb(":memory:"));

  const created = await app.request("/characters", json("POST", { name: "Aria" }));
  expect(created.status).toBe(201);
  const character = await created.json();
  expect(character).toMatchObject({ id: 1, name: "Aria", level: 1, str: 10 });

  expect(await (await app.request("/characters")).json()).toHaveLength(1);
  expect((await app.request("/characters/1")).status).toBe(200);

  const patched = await app.request("/characters/1", json("PATCH", { level: 3 }));
  expect(await patched.json()).toMatchObject({ name: "Aria", level: 3, dex: 10 });

  expect((await app.request("/characters/1", { method: "DELETE" })).status).toBe(204);
  expect((await app.request("/characters/1")).status).toBe(404);
  expect((await app.request("/characters/1", { method: "DELETE" })).status).toBe(404);
});

test("validation and foreign keys", async () => {
  const app = createApp(createDb(":memory:"));
  expect((await app.request("/characters", json("POST", { name: "" }))).status).toBe(400);
  expect((await app.request("/characters", json("POST", { name: "A", level: 21 }))).status).toBe(
    400,
  );
  expect((await app.request("/characters/abc")).status).toBe(400);
  const fk = await app.request("/characters", json("POST", { name: "A", classId: 99 }));
  expect(fk.status).toBe(400);
  await app.request("/characters", json("POST", { name: "B" }));
  expect((await app.request("/characters/1", json("PATCH", {}))).status).toBe(400);
  expect((await app.request("/characters/99", json("PATCH", { name: "x" }))).status).toBe(404);
});
