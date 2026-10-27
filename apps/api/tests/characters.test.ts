import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";
import { speciesChoiceGroups, speciesChoiceOptions } from "../src/db/schema.ts";

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const ids = { speciesId: 7, backgroundId: 1, classId: 1 };
const acolyteChoices = {
  abilityIncreases: { mode: "split", plusTwo: "Wisdom", plusOne: "Intelligence" },
  equipment: "package",
};
const barbarianChoices = {
  skills: ["Nature", "Perception"],
  weaponMasteries: ["Greataxe", "Handaxe"],
  equipment: "A",
};
const base = { ...ids, backgroundChoices: acolyteChoices, classChoices: barbarianChoices };

async function spellIds(app: ReturnType<typeof createApp>, classId: number, names: string[]) {
  const list = (await (await app.request(`/spells?classId=${classId}`)).json()) as {
    id: number;
    name: string;
  }[];
  return names.map((name) => list.find((spell) => spell.name === name)!.id);
}

test("character CRUD", async () => {
  const app = createApp(createDb(":memory:"));

  const created = await app.request("/characters", json("POST", { name: "Aria", ...base }));
  expect(created.status).toBe(201);
  expect(await created.json()).toMatchObject({ id: 1, name: "Aria", level: 1, str: 10, ...ids });

  expect(await (await app.request("/characters")).json()).toHaveLength(1);
  expect((await app.request("/characters/1")).status).toBe(200);

  const patched = await app.request(
    "/characters/1",
    json("PATCH", {
      level: 3,
      classId: 2,
      classChoices: {
        skills: ["Arcana", "Deception", "History"],
        tools: ["Lute", "Drum", "Flute"],
        expertise: [],
        cantrips: await spellIds(app, 2, ["Vicious Mockery", "Minor Illusion"]),
        preparedSpells: await spellIds(app, 2, [
          "Healing Word",
          "Dissonant Whispers",
          "Faerie Fire",
          "Sleep",
        ]),
        equipment: "gold",
      },
    }),
  );
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

test("background choices are validated, applied and persisted", async () => {
  const app = createApp(createDb(":memory:"));
  const post = (body: Record<string, unknown>) =>
    app.request(
      "/characters",
      json("POST", {
        name: "Aria",
        speciesId: 7,
        classId: 1,
        classChoices: barbarianChoices,
        ...body,
      }),
    );

  expect((await post({ backgroundId: 1 })).status).toBe(400);
  expect(
    (
      await post({
        backgroundId: 1,
        backgroundChoices: {
          ...acolyteChoices,
          abilityIncreases: { mode: "split", plusTwo: "Strength", plusOne: "Wisdom" },
        },
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await post({
        backgroundId: 1,
        backgroundChoices: {
          ...acolyteChoices,
          abilityIncreases: { mode: "split", plusTwo: "Wisdom", plusOne: "Wisdom" },
        },
      })
    ).status,
  ).toBe(400);
  expect((await post({ backgroundId: 1, wis: 19, backgroundChoices: acolyteChoices })).status).toBe(
    400,
  );
  expect((await post({ backgroundId: 4, backgroundChoices: acolyteChoices })).status).toBe(400);
  expect(await (await app.request("/characters")).json()).toHaveLength(0);

  const acolyte = await post({ backgroundId: 1, backgroundChoices: acolyteChoices });
  expect(acolyte.status).toBe(201);
  expect(await acolyte.json()).toMatchObject({
    str: 10,
    int: 11,
    wis: 12,
    cha: 10,
    gold: 23,
    backgroundChoices: {
      abilityMode: "split",
      plusTwo: "Wisdom",
      plusOne: "Intelligence",
      equipmentOption: "package",
      goldGranted: 8,
    },
    feats: ["Magic Initiate (Cleric)"],
    skillProficiencies: ["Insight", "Nature", "Perception", "Religion"],
    toolProficiencies: ["Calligrapher's Supplies"],
    inventory: expect.arrayContaining([
      expect.objectContaining({ name: "Parchment", quantity: 10, source: "background" }),
      expect.objectContaining({ name: "Holy Symbol", quantity: 1 }),
    ]),
  });

  const soldier = await post({
    backgroundId: 4,
    backgroundChoices: {
      abilityIncreases: { mode: "even" },
      equipment: "gold",
      toolChoice: "Dice Set",
    },
  });
  expect(soldier.status).toBe(201);
  expect(await soldier.json()).toMatchObject({
    str: 11,
    dex: 11,
    con: 11,
    int: 10,
    gold: 65,
    toolProficiencies: ["Dice Set"],
    feats: ["Savage Attacker"],
    inventory: expect.not.arrayContaining([expect.objectContaining({ source: "background" })]),
  });
  const missingTool = {
    backgroundId: 4,
    backgroundChoices: { abilityIncreases: { mode: "even" }, equipment: "package" },
  };
  expect((await post(missingTool)).status).toBe(400);
  expect(
    (
      await post({
        ...missingTool,
        backgroundChoices: { ...missingTool.backgroundChoices, toolChoice: "Lute" },
      })
    ).status,
  ).toBe(400);
  const soldierPackage = await post({
    backgroundId: 4,
    backgroundChoices: { ...missingTool.backgroundChoices, toolChoice: "Playing Card Set" },
  });
  expect(await soldierPackage.json()).toMatchObject({
    gold: 29,
    inventory: expect.arrayContaining([
      expect.objectContaining({ name: "Playing Card Set", quantity: 1 }),
      expect.objectContaining({ name: "Arrow", quantity: 20 }),
    ]),
  });
});

test("changing a background requires new choices and replaces the old benefits", async () => {
  const app = createApp(createDb(":memory:"));
  await app.request(
    "/characters",
    json("POST", {
      name: "Aria",
      speciesId: 7,
      classId: 1,
      backgroundId: 1,
      backgroundChoices: acolyteChoices,
      classChoices: barbarianChoices,
    }),
  );
  const patch = (body: unknown) => app.request("/characters/1", json("PATCH", body));

  expect((await patch({ backgroundId: 2 })).status).toBe(400);
  expect((await patch({ level: 2, backgroundChoices: acolyteChoices })).status).toBe(400);

  const criminalChoices = { abilityIncreases: { mode: "even" }, equipment: "gold" };
  const changed = await patch({ backgroundId: 2, backgroundChoices: criminalChoices });
  expect(changed.status).toBe(200);
  expect(await changed.json()).toMatchObject({
    backgroundId: 2,
    wis: 12,
    int: 12,
    dex: 11,
    con: 11,
    gold: 65,
    feats: ["Alert"],
    skillProficiencies: ["Nature", "Perception", "Sleight of Hand", "Stealth"],
    toolProficiencies: ["Thieves' Tools"],
    inventory: expect.not.arrayContaining([expect.objectContaining({ source: "background" })]),
    backgroundChoices: { abilityMode: "even", equipmentOption: "gold", goldGranted: 50 },
  });

  expect((await app.request("/characters/1", { method: "DELETE" })).status).toBe(204);
});

test("class choices are validated, recorded and replaced when the class changes", async () => {
  const app = createApp(createDb(":memory:"));
  const post = (classChoices?: unknown, classId = 1) =>
    app.request(
      "/characters",
      json("POST", {
        name: "Aria",
        speciesId: 7,
        backgroundId: 1,
        backgroundChoices: acolyteChoices,
        classId,
        classChoices,
      }),
    );

  expect((await post()).status).toBe(400);
  expect((await post({ ...barbarianChoices, skills: ["Nature"] })).status).toBe(400);
  expect((await post({ ...barbarianChoices, skills: ["Nature", "Arcana"] })).status).toBe(400);
  expect((await post({ ...barbarianChoices, skills: ["Nature", "Nature"] })).status).toBe(400);
  expect((await post({ ...barbarianChoices, weaponMasteries: ["Greataxe"] })).status).toBe(400);
  expect((await post({ ...barbarianChoices, equipment: "C" })).status).toBe(400);
  expect((await post({ ...barbarianChoices, cantrips: [1] })).status).toBe(400);
  expect(await (await app.request("/characters")).json()).toHaveLength(0);

  const barbarian = await post(barbarianChoices);
  expect(await barbarian.json()).toMatchObject({
    gold: 23,
    classChoices: {
      equipmentOption: "A",
      goldGranted: 15,
      skills: ["Nature", "Perception"],
      weaponMasteries: ["Greataxe", "Handaxe"],
      featureChoices: [],
    },
    inventory: expect.arrayContaining([
      expect.objectContaining({ name: "Greataxe", quantity: 1, source: "class" }),
      expect.objectContaining({ name: "Handaxe", quantity: 4, source: "class" }),
    ]),
  });

  // Fighter (id 5) requires a Fighting Style and three masteries
  const fighterChoices = {
    skills: ["Athletics", "Perception"],
    weaponMasteries: ["Greatsword", "Flail", "Javelin"],
    equipment: "B",
  };
  expect((await post(fighterChoices, 5)).status).toBe(400);
  const style = { choiceGroupId: 1, choiceOptionId: 1 };
  expect((await post({ ...fighterChoices, featureChoices: [style] }, 5)).status).toBe(400);
  const detail = (await (await app.request("/classes/5")).json()) as {
    choiceGroups: { id: number; options: { id: number }[] }[];
  };
  const group = detail.choiceGroups[0]!;
  const fighter = await post(
    {
      ...fighterChoices,
      featureChoices: [{ choiceGroupId: group.id, choiceOptionId: group.options[1].id }],
    },
    5,
  );
  expect(fighter.status).toBe(201);
  expect(await fighter.json()).toMatchObject({
    gold: 19,
    classChoices: { equipmentOption: "B", featureChoices: [{ choiceGroupId: group.id }] },
    inventory: expect.arrayContaining([
      expect.objectContaining({ name: "Longbow", source: "class" }),
    ]),
  });

  // Rogue (id 9): expertise from known proficiencies, and background skills can't repeat
  const rogueChoices = {
    skills: ["Stealth", "Perception", "Deception", "Acrobatics"],
    expertise: ["Stealth", "Thieves' Tools"],
    weaponMasteries: ["Dagger", "Shortsword"],
    equipment: "gold",
  };
  expect((await post({ ...rogueChoices, expertise: ["Arcana", "Stealth"] }, 9)).status).toBe(400);
  expect(
    (
      await post(
        { ...rogueChoices, skills: ["Insight", "Perception", "Deception", "Acrobatics"] },
        9,
      )
    ).status,
  ).toBe(400);
  const rogue = await post(rogueChoices, 9);
  expect(rogue.status).toBe(201);

  // Switch the Barbarian (id 1) to a Wizard (id 12)
  const wizardChoices = {
    skills: ["Arcana", "History"],
    cantrips: await spellIds(app, 12, ["Light", "Mage Hand", "Fire Bolt"]),
    spellbook: await spellIds(app, 12, [
      "Shield",
      "Magic Missile",
      "Sleep",
      "Detect Magic",
      "Mage Armor",
      "Identify",
    ]),
    preparedSpells: await spellIds(app, 12, ["Shield", "Magic Missile", "Sleep", "Detect Magic"]),
    equipment: "A",
  };
  const patch = (body: unknown) => app.request("/characters/1", json("PATCH", body));
  expect((await patch({ classId: 12 })).status).toBe(400);
  const [fireball] = await spellIds(app, 12, ["Fireball"]);
  expect(
    (
      await patch({
        classId: 12,
        classChoices: {
          ...wizardChoices,
          spellbook: [...wizardChoices.spellbook.slice(1), fireball],
        },
      })
    ).status,
  ).toBe(400);
  expect(
    (await patch({ classId: 12, classChoices: { ...wizardChoices, spellbook: [] } })).status,
  ).toBe(400);
  const changed = await patch({ classId: 12, classChoices: wizardChoices });
  expect(changed.status).toBe(200);
  const body = (await changed.json()) as {
    inventory: { name: string }[];
    skillProficiencies: string[];
    spells: { name: string; prepared: boolean }[];
  };
  expect(body).toMatchObject({
    classId: 12,
    gold: 13,
    classChoices: { equipmentOption: "A" },
  });
  expect(body.spells).toHaveLength(9);
  expect(body.spells.find((spell) => spell.name === "Identify")?.prepared).toBe(false);
  expect(body.spells.find((spell) => spell.name === "Shield")?.prepared).toBe(true);
  expect(body.inventory.some((i) => i.name === "Greataxe")).toBe(false);
  expect(body.skillProficiencies).not.toContain("Nature");

  // Changing the background to one overlapping the class skills requires new choices
  expect(
    (
      await patch({
        backgroundId: 3,
        backgroundChoices: { abilityIncreases: { mode: "even" }, equipment: "gold" },
      })
    ).status,
  ).toBe(400);

  expect((await app.request("/characters/1", { method: "DELETE" })).status).toBe(204);
});
