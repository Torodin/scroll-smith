import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

test("backgrounds", async () => {
  const app = createApp(createDb(":memory:"));
  const backgrounds = await (await app.request("/backgrounds")).json();
  expect(backgrounds).toHaveLength(4);
  expect(backgrounds).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Acolyte",
        properties: {
          abilityScores: ["Intelligence", "Wisdom", "Charisma"],
          feat: "Magic Initiate (Cleric)",
          skillProficiencies: ["Insight", "Religion"],
          toolProficiency: { type: "specific", name: "Calligrapher's Supplies" },
          equipment: {
            package: {
              items: [
                { item: "Calligrapher's Supplies", quantity: 1 },
                { item: "Book (prayers)", quantity: 1 },
                { item: "Holy Symbol", quantity: 1 },
                { item: "Parchment", quantity: 10 },
                { item: "Robe", quantity: 1 },
              ],
              gold: 8,
            },
            alternative: { amount: 50, currency: "GP" },
          },
        },
      }),
      expect.objectContaining({
        name: "Criminal",
        properties: {
          abilityScores: ["Dexterity", "Constitution", "Intelligence"],
          feat: "Alert",
          skillProficiencies: ["Sleight of Hand", "Stealth"],
          toolProficiency: { type: "specific", name: "Thieves' Tools" },
          equipment: {
            package: {
              items: [
                { item: "Dagger", quantity: 2 },
                { item: "Thieves' Tools", quantity: 1 },
                { item: "Crowbar", quantity: 1 },
                { item: "Pouch", quantity: 2 },
                { item: "Traveler's Clothes", quantity: 1 },
              ],
              gold: 16,
            },
            alternative: { amount: 50, currency: "GP" },
          },
        },
      }),
      expect.objectContaining({
        name: "Sage",
        properties: {
          abilityScores: ["Constitution", "Intelligence", "Wisdom"],
          feat: "Magic Initiate (Wizard)",
          skillProficiencies: ["Arcana", "History"],
          toolProficiency: { type: "specific", name: "Calligrapher's Supplies" },
          equipment: {
            package: {
              items: [
                { item: "Quarterstaff", quantity: 1 },
                { item: "Calligrapher's Supplies", quantity: 1 },
                { item: "Book (history)", quantity: 1 },
                { item: "Parchment", quantity: 8 },
                { item: "Robe", quantity: 1 },
              ],
              gold: 8,
            },
            alternative: { amount: 50, currency: "GP" },
          },
        },
      }),
      expect.objectContaining({
        name: "Soldier",
        properties: {
          abilityScores: ["Strength", "Dexterity", "Constitution"],
          feat: "Savage Attacker",
          skillProficiencies: ["Athletics", "Intimidation"],
          toolProficiency: { type: "choice", category: "Gaming Set" },
          equipment: {
            package: {
              items: [
                { item: "Spear", quantity: 1 },
                { item: "Shortbow", quantity: 1 },
                { item: "Arrow", quantity: 20 },
                { item: "Gaming Set (same as tool proficiency choice)", quantity: 1 },
                { item: "Healer's Kit", quantity: 1 },
                { item: "Quiver", quantity: 1 },
                { item: "Traveler's Clothes", quantity: 1 },
              ],
              gold: 14,
            },
            alternative: { amount: 50, currency: "GP" },
          },
        },
      }),
    ]),
  );
  expect((await app.request("/backgrounds/1")).status).toBe(200);
  expect(await (await app.request("/backgrounds/1")).json()).toMatchObject({
    name: "Acolyte",
    properties: expect.objectContaining({
      abilityScores: ["Intelligence", "Wisdom", "Charisma"],
      equipment: expect.objectContaining({
        alternative: { amount: 50, currency: "GP" },
      }),
    }),
  });
  expect((await app.request("/backgrounds/999")).status).toBe(404);
  expect((await app.request("/backgrounds/abc")).status).toBe(400);
});
