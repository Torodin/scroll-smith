import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";
import { characters } from "../src/db/schema.ts";

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const backgroundProperties = {
  abilityScores: ["Strength", "Wisdom", "Charisma"],
  feat: "Magic Initiate (Druid)",
  skillProficiencies: ["Animal Handling", "Nature"],
  toolProficiency: { type: "choice", category: "Artisan's Tools" },
  equipment: {
    package: { items: [{ item: "Herbalism Kit", quantity: 1 }], gold: 10 },
    alternative: { amount: 50, currency: "GP" },
  },
};

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

test("background CRUD", async () => {
  const app = createApp(createDb(":memory:"));
  const created = await app.request(
    "/backgrounds",
    json("POST", {
      name: "  Hermit ",
      description: "  A secluded life. ",
      properties: backgroundProperties,
    }),
  );
  expect(created.status).toBe(201);
  expect(await created.json()).toMatchObject({
    id: 5,
    name: "Hermit",
    description: "A secluded life.",
    properties: backgroundProperties,
  });
  expect(await (await app.request("/backgrounds")).json()).toHaveLength(5);

  const patched = await app.request(
    "/backgrounds/5",
    json("PATCH", { name: "Wanderer", description: "A life on the road." }),
  );
  expect(await patched.json()).toMatchObject({
    name: "Wanderer",
    description: "A life on the road.",
    properties: backgroundProperties,
  });

  const cleared = await app.request("/backgrounds/5", json("PATCH", { properties: null }));
  expect(await cleared.json()).toMatchObject({ name: "Wanderer", properties: null });
  expect((await app.request("/backgrounds/5", { method: "DELETE" })).status).toBe(204);
  expect((await app.request("/backgrounds/5")).status).toBe(404);
  expect((await app.request("/backgrounds/5", { method: "DELETE" })).status).toBe(404);
});

test("background CRUD validation and referenced deletion", async () => {
  const db = createDb(":memory:");
  const app = createApp(db);
  const post = (body: unknown) => app.request("/backgrounds", json("POST", body));
  expect((await post({ name: "", description: "Description" })).status).toBe(400);
  expect((await post({ name: "Valid" })).status).toBe(400);
  expect((await app.request("/backgrounds/abc", json("PATCH", { name: "Valid" }))).status).toBe(
    400,
  );
  expect((await app.request("/backgrounds/1", json("PATCH", {}))).status).toBe(400);
  expect((await app.request("/backgrounds/999", json("PATCH", { name: "Missing" }))).status).toBe(
    404,
  );

  db.insert(characters)
    .values({ name: "Test character", speciesId: 7, backgroundId: 1, classId: 1 })
    .run();
  expect((await app.request("/backgrounds/1", { method: "DELETE" })).status).toBe(409);
  expect((await app.request("/backgrounds/1")).status).toBe(200);
});
