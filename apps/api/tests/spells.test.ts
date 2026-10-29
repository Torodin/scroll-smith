import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

type Spell = { name: string; level: number; classes: string[]; components: string[] };

test("lists seeded SRD spells with details and class lists", async () => {
  const app = createApp(createDb(":memory:"));
  const all = (await (await app.request("/spells")).json()) as Spell[];
  expect(all.length).toBeGreaterThan(300);

  const wizardCantrips = (await (
    await app.request("/spells?classId=12&maxLevel=0")
  ).json()) as Spell[];
  expect(wizardCantrips.length).toBeGreaterThan(0);
  expect(wizardCantrips.every((spell) => spell.level === 0)).toBe(true);
  expect(wizardCantrips.every((spell) => spell.classes.includes("Wizard"))).toBe(true);

  const fireBolt = all.find((spell) => spell.name === "Fire Bolt");
  expect(fireBolt).toMatchObject({ components: ["V", "S"], school: "Evocation" });
  expect((await app.request("/spells?classId=abc")).status).toBe(400);
});

test("creates, reads, updates and deletes a spell", async () => {
  const app = createApp(createDb(":memory:"));
  const json = (method: string, body: unknown) => ({
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const res = await app.request(
    "/spells",
    json("POST", {
      name: "Test Bolt",
      description: "Zap.",
      level: 1,
      school: "Evocation",
      components: ["V", "S"],
      classIds: [12],
    }),
  );
  expect(res.status).toBe(201);
  const created = (await res.json()) as Spell & { id: number };
  expect(created.classes).toEqual(["Wizard"]);

  expect(((await (await app.request(`/spells/${created.id}`)).json()) as Spell).name).toBe(
    "Test Bolt",
  );

  const patched = (await (
    await app.request(`/spells/${created.id}`, json("PATCH", { level: 2, classIds: [] }))
  ).json()) as Spell;
  expect(patched).toMatchObject({ level: 2, classes: [] });

  expect((await app.request("/spells", json("POST", { name: "x" }))).status).toBe(400);
  expect((await app.request(`/spells/${created.id}`, json("PATCH", {}))).status).toBe(400);
  expect(
    (await app.request("/spells", json("POST", { ...created, classIds: [9999] }))).status,
  ).toBe(409);

  expect((await app.request(`/spells/${created.id}`, { method: "DELETE" })).status).toBe(204);
  expect((await app.request(`/spells/${created.id}`)).status).toBe(404);
  expect((await app.request(`/spells/${created.id}`, { method: "DELETE" })).status).toBe(404);
});
