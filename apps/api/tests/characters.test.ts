import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";
import { speciesChoiceGroups, speciesChoiceOptions } from "../src/db/schema.ts";

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const base = { speciesId: 7, backgroundId: 1, classId: 1 };

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
  expect((await post({ name: "A", speciesId: 7, backgroundId: 1 })).status).toBe(400);
  expect((await post({ name: "A", ...base, classId: null })).status).toBe(400);
  expect((await post({ name: "A", ...base, classId: 99 })).status).toBe(400);
  await post({ name: "B", ...base });
  expect((await app.request("/characters/1", json("PATCH", {}))).status).toBe(400);
  expect((await app.request("/characters/1", json("PATCH", { speciesId: null }))).status).toBe(400);
  expect((await app.request("/characters/1", json("PATCH", { classId: 99 }))).status).toBe(400);
  expect((await app.request("/characters/99", json("PATCH", { name: "x" }))).status).toBe(404);
});

test("characters require and persist valid species choices", async () => {
  const db = createDb(":memory:");
  const app = createApp(db);
  const addChoice = (speciesId: number, name: string) => {
    const choiceGroupId = Number(
      db
        .insert(speciesChoiceGroups)
        .values({ speciesId, name: `${name} choice`, description: `Choose ${name}.` })
        .run().lastInsertRowid,
    );
    const choiceOptionId = Number(
      db
        .insert(speciesChoiceOptions)
        .values({ choiceGroupId, name, description: `${name} option.` })
        .run().lastInsertRowid,
    );
    return { choiceGroupId, choiceOptionId };
  };
  const firstSpeciesChoice = addChoice(7, "First choice");
  const secondSpeciesChoice = addChoice(2, "Second choice");
  const create = (speciesChoices?: (typeof firstSpeciesChoice)[]) =>
    app.request(
      "/characters",
      json("POST", {
        name: "Aria",
        ...base,
        ...(speciesChoices === undefined ? {} : { speciesChoices }),
      }),
    );

  expect((await create()).status).toBe(400);
  expect(
    (await create([{ ...firstSpeciesChoice, choiceOptionId: secondSpeciesChoice.choiceOptionId }]))
      .status,
  ).toBe(400);

  const created = await create([firstSpeciesChoice]);
  expect(created.status).toBe(201);
  expect(await created.json()).toMatchObject({
    speciesId: 7,
    speciesChoices: [firstSpeciesChoice],
  });

  const preserved = await app.request("/characters/1", json("PATCH", { level: 2 }));
  expect(await preserved.json()).toMatchObject({ speciesChoices: [firstSpeciesChoice] });

  const changedSpecies = await app.request(
    "/characters/1",
    json("PATCH", { speciesId: 2, speciesChoices: [secondSpeciesChoice] }),
  );
  expect(changedSpecies.status).toBe(200);
  expect(await changedSpecies.json()).toMatchObject({
    speciesId: 2,
    speciesChoices: [secondSpeciesChoice],
  });

  expect((await app.request("/characters/1", json("PATCH", { speciesId: 7 }))).status).toBe(400);

  const rejectedChange = await app.request(
    "/characters/1",
    json("PATCH", { speciesId: 7, speciesChoices: [secondSpeciesChoice] }),
  );
  expect(rejectedChange.status).toBe(400);
  expect(await (await app.request("/characters/1")).json()).toMatchObject({
    speciesId: 2,
    speciesChoices: [secondSpeciesChoice],
  });
});

test("characters require the configured number of options for multi-choice species groups", async () => {
  const db = createDb(":memory:");
  const app = createApp(db);
  const choiceGroupId = Number(
    db
      .insert(speciesChoiceGroups)
      .values({
        speciesId: 7,
        name: "Skill training",
        description: "Choose two skills.",
        choiceCount: 2,
      })
      .run().lastInsertRowid,
  );
  const choices = ["Perception", "Stealth", "Survival"].map((name) => {
    const choiceOptionId = Number(
      db
        .insert(speciesChoiceOptions)
        .values({ choiceGroupId, name, description: `${name} proficiency.` })
        .run().lastInsertRowid,
    );
    return { choiceGroupId, choiceOptionId };
  });
  const create = (speciesChoices: typeof choices) =>
    app.request("/characters", json("POST", { name: "Aria", ...base, speciesChoices }));

  expect((await create(choices.slice(0, 1))).status).toBe(400);

  const created = await create(choices.slice(0, 2));
  expect(created.status).toBe(201);
  expect(await created.json()).toMatchObject({ speciesChoices: choices.slice(0, 2) });

  expect((await create(choices)).status).toBe(400);
});
