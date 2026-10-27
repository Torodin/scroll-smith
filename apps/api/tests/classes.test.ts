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
