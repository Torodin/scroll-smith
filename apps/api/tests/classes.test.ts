import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";
import type { ClassesService } from "../src/modules/classes/classes.service.ts";

type ClassDetail = ReturnType<ClassesService["get"]>;
type ClassSummary = ReturnType<ClassesService["list"]>;

test("classes", async () => {
  const app = createApp(createDb(":memory:"));
  const list = (await (await app.request("/classes")).json()) as ClassSummary;
  expect(list).toHaveLength(12);
  expect(list[0]).toMatchObject({ name: "Barbarian", savingThrows: ["Strength", "Constitution"] });
  expect((await app.request("/classes/1")).status).toBe(200);
  expect((await app.request("/classes/999")).status).toBe(404);
  expect((await app.request("/classes/abc")).status).toBe(400);
});

test("every class exposes levels, features, a subclass and creation data", async () => {
  const app = createApp(createDb(":memory:"));
  for (let id = 1; id <= 12; id++) {
    const cls = (await (await app.request(`/classes/${id}`)).json()) as ClassDetail;
    expect(cls.levels).toHaveLength(20);
    expect(cls.levels[0]).toMatchObject({ level: 1, proficiencyBonus: 2 });
    expect(cls.levels[19]).toMatchObject({ level: 20, proficiencyBonus: 6 });
    expect(cls.features.some((f: { level: number }) => f.level === 1)).toBe(true);
    expect(cls.features.some((f: { name: string }) => f.name === "Epic Boon")).toBe(true);
    expect(cls.subclasses).toHaveLength(1);
    expect(cls.subclasses[0].features.length).toBeGreaterThan(0);
    expect(cls.skillChoiceCount).toBeGreaterThan(0);
    expect(cls.startingEquipment.goldAlternative).toBeGreaterThan(0);
  }
  const fighter = (await (await app.request("/classes/5")).json()) as ClassDetail;
  expect(fighter.choiceGroups[0]).toMatchObject({ name: "Fighting Style" });
  expect(fighter.choiceGroups[0].options).toHaveLength(4);
});

const json = (body: unknown) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

test("class CRUD", async () => {
  const app = createApp(createDb(":memory:"));
  const payload = {
    name: "Artificer",
    description: "Inventor",
    hitPointDie: 8,
    savingThrows: ["Constitution", "Intelligence"],
    levels: [{ level: 1, proficiencyBonus: 2, columns: { Features: "Spellcasting" } }],
    features: [{ level: 1, name: "Tinker", description: "Tinkering" }],
    subclasses: [
      {
        name: "Alchemist",
        description: "Potions",
        features: [{ level: 3, name: "Elixir", description: "x" }],
      },
    ],
    choiceGroups: [{ name: "Style", description: "d", options: [{ name: "A", description: "a" }] }],
  };

  expect((await app.request("/classes", json({ name: "" }))).status).toBe(400);
  const res = await app.request("/classes", json(payload));
  expect(res.status).toBe(201);
  const created = (await res.json()) as ClassDetail;
  expect(created).toMatchObject({ name: "Artificer", hitPointDie: 8 });
  expect(created.levels).toHaveLength(1);
  expect(created.features).toHaveLength(1);
  expect(created.subclasses[0].features).toHaveLength(1);
  expect(created.choiceGroups[0].options).toHaveLength(1);

  const patch = (body: unknown) =>
    app.request(`/classes/${created.id}`, { ...json(body), method: "PATCH" });
  expect((await patch({})).status).toBe(400);
  const updated = (await (await patch({ name: "Tinker", subclasses: [] })).json()) as ClassDetail;
  expect(updated.name).toBe("Tinker");
  expect(updated.subclasses).toHaveLength(0);
  expect(updated.features).toHaveLength(1);
  expect(updated.levels).toHaveLength(1);
  expect(
    (await app.request("/classes/999", { ...json({ name: "x" }), method: "PATCH" })).status,
  ).toBe(404);

  expect((await app.request(`/classes/${created.id}`, { method: "DELETE" })).status).toBe(204);
  expect((await app.request(`/classes/${created.id}`)).status).toBe(404);
  expect((await app.request(`/classes/${created.id}`, { method: "DELETE" })).status).toBe(404);
  // Seeded classes are referenced by spells
  expect((await app.request("/classes/12", { method: "DELETE" })).status).toBe(409);
});
