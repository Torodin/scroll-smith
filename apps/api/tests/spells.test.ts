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
