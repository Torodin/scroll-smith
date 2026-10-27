import { useEffect, useState } from "react";
import type { ClassChoicesInput, ClassDetail, DashboardData } from "../core/types";

export type ClassSelection = {
  classId: string;
  skills: string[];
  tools: string[];
  expertise: string[];
  weaponMasteries: string[];
  cantrips: string[];
  preparedSpells: string[];
  equipment: string;
  featureChoices: Record<number, number>;
};

export const emptyClassSelection: ClassSelection = {
  classId: "",
  skills: [],
  tools: [],
  expertise: [],
  weaponMasteries: [],
  cantrips: [],
  preparedSpells: [],
  equipment: "",
  featureChoices: {},
};

const toolOptions: Record<string, string[]> = {
  "Musical Instrument": [
    "Bagpipes",
    "Drum",
    "Dulcimer",
    "Flute",
    "Horn",
    "Lute",
    "Lyre",
    "Pan Flute",
    "Shawm",
    "Viol",
  ],
};

const weaponOptions = [
  "Club",
  "Dagger",
  "Greatclub",
  "Handaxe",
  "Javelin",
  "Light Hammer",
  "Mace",
  "Quarterstaff",
  "Sickle",
  "Spear",
  "Dart",
  "Light Crossbow",
  "Shortbow",
  "Sling",
  "Battleaxe",
  "Flail",
  "Glaive",
  "Greataxe",
  "Greatsword",
  "Halberd",
  "Lance",
  "Longsword",
  "Maul",
  "Morningstar",
  "Pike",
  "Rapier",
  "Scimitar",
  "Shortsword",
  "Trident",
  "War Pick",
  "Warhammer",
  "Whip",
  "Hand Crossbow",
  "Heavy Crossbow",
  "Longbow",
  "Musket",
  "Pistol",
];

function levelOneCount(detail: ClassDetail, column: string): number {
  return Number(detail.levels[0]?.columns[column] ?? 0) || 0;
}

export function cantripCount(detail: ClassDetail, selection: ClassSelection): number {
  const extra = detail.choiceGroups.reduce((total, group) => {
    const option = group.options.find((o) => o.id === selection.featureChoices[group.id]);
    return total + (option?.extraCantrips ?? 0);
  }, 0);
  return levelOneCount(detail, "Cantrips") + extra;
}

export function validateClassSelection(
  detail: ClassDetail | null,
  selection: ClassSelection,
  backgroundSkills: string[],
): string | null {
  if (!detail) return "Choose a class to continue.";
  if (selection.skills.length !== detail.skillChoiceCount) {
    return `Choose ${detail.skillChoiceCount} class skills.`;
  }
  if (detail.toolChoice && selection.tools.length !== detail.toolChoice.count) {
    return `Choose ${detail.toolChoice.count} ${detail.toolChoice.category} proficiencies.`;
  }
  if (selection.expertise.length !== detail.expertiseCount) {
    return `Choose ${detail.expertiseCount} proficiencies for Expertise.`;
  }
  if (selection.weaponMasteries.length !== detail.weaponMasteryCount) {
    return `Choose ${detail.weaponMasteryCount} weapons for Weapon Mastery.`;
  }
  const missingGroup = detail.choiceGroups.find(
    (group) => selection.featureChoices[group.id] === undefined,
  );
  if (missingGroup) return `Choose an option for ${missingGroup.name}.`;
  const cantrips = cantripCount(detail, selection);
  const filled = (values: string[], count: number) =>
    values.slice(0, count).filter((value) => value.trim()).length === count &&
    new Set(values.slice(0, count).map((value) => value.trim().toLowerCase())).size === count;
  if (!filled(selection.cantrips, cantrips)) return `Name ${cantrips} different cantrips.`;
  const prepared = levelOneCount(detail, "Prepared Spells");
  if (!filled(selection.preparedSpells, prepared)) {
    return `Name ${prepared} different prepared spells.`;
  }
  if (!selection.equipment) return "Choose a starting equipment option.";
  if (selection.skills.some((skill) => backgroundSkills.includes(skill))) {
    return "Class skills cannot repeat your background skills.";
  }
  return null;
}

export function buildClassChoices(
  detail: ClassDetail,
  selection: ClassSelection,
): ClassChoicesInput {
  const cantrips = cantripCount(detail, selection);
  const prepared = levelOneCount(detail, "Prepared Spells");
  return {
    skills: selection.skills,
    tools: selection.tools,
    expertise: selection.expertise,
    weaponMasteries: selection.weaponMasteries,
    cantrips: selection.cantrips.slice(0, cantrips).map((spell) => spell.trim()),
    preparedSpells: selection.preparedSpells.slice(0, prepared).map((spell) => spell.trim()),
    equipment: selection.equipment,
    featureChoices: detail.choiceGroups.map((group) => ({
      choiceGroupId: group.id,
      choiceOptionId: selection.featureChoices[group.id]!,
    })),
  };
}

function PickList({
  legend,
  options,
  value,
  count,
  disabled = [],
  onChange,
}: {
  legend: string;
  options: string[];
  value: string[];
  count: number;
  disabled?: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="species-choice-group">
      <legend className="species-choice-legend">
        {legend} · choose {count}
      </legend>
      <ul className="class-pick-list">
        {options.map((option) => {
          const checked = value.includes(option);
          const blocked = disabled.includes(option) || (!checked && value.length >= count);
          return (
            <li key={option}>
              <label className={`class-pick ${checked ? "class-pick-selected" : ""}`}>
                <input
                  checked={checked}
                  disabled={blocked}
                  onChange={(event) =>
                    onChange(
                      event.target.checked ? [...value, option] : value.filter((v) => v !== option),
                    )
                  }
                  type="checkbox"
                />
                <span>{option}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="species-choice-status" aria-live="polite">
        {value.length} of {count} selected
      </p>
    </fieldset>
  );
}

function NameInputs({
  legend,
  count,
  value,
  onChange,
}: {
  legend: string;
  count: number;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  if (count === 0) return null;
  return (
    <fieldset className="species-choice-group">
      <legend className="species-choice-legend">
        {legend} · name {count}
      </legend>
      <div className="class-name-inputs">
        {Array.from({ length: count }, (_, index) => (
          <input
            aria-label={`${legend} ${index + 1}`}
            key={index}
            maxLength={100}
            onChange={(event) => {
              const next = Array.from({ length: count }, (_, i) => value[i] ?? "");
              next[index] = event.target.value;
              onChange(next);
            }}
            value={value[index] ?? ""}
          />
        ))}
      </div>
    </fieldset>
  );
}

function ClassStep({
  classes,
  loadClass,
  selection,
  backgroundSkills,
  onChange,
  onDetail,
}: {
  classes: DashboardData["classes"];
  loadClass: (id: number) => Promise<ClassDetail>;
  selection: ClassSelection;
  backgroundSkills: string[];
  onChange: (next: ClassSelection) => void;
  onDetail: (detail: ClassDetail | null) => void;
}) {
  const [cache, setCache] = useState<Record<string, ClassDetail>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const detail = cache[selection.classId] ?? null;

  useEffect(() => {
    onDetail(detail);
  }, [detail, onDetail]);

  useEffect(() => {
    if (!selection.classId || cache[selection.classId]) return;
    let active = true;
    const id = selection.classId;
    setLoadError(null);
    loadClass(Number(id))
      .then((result) => {
        if (active) setCache((current) => ({ ...current, [id]: result }));
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load class.");
      });
    return () => {
      active = false;
    };
  }, [selection.classId, cache, loadClass]);

  const update = (patch: Partial<ClassSelection>) => onChange({ ...selection, ...patch });
  const expertiseOptions = detail
    ? [...new Set([...backgroundSkills, ...selection.skills, ...detail.toolProficiencies])]
    : [];

  return (
    <fieldset className="species-options">
      <legend className="species-legend">Available classes</legend>
      <div className="species-grid">
        {classes.map((characterClass) => (
          <label
            className={`species-card ${selection.classId === String(characterClass.id) ? "species-card-selected" : ""}`}
            key={characterClass.id}
          >
            <input
              aria-label={characterClass.name}
              checked={selection.classId === String(characterClass.id)}
              name="class"
              onChange={(event) =>
                onChange({ ...emptyClassSelection, classId: event.target.value })
              }
              required
              type="radio"
              value={characterClass.id}
            />
            <span className="species-card-content">
              <strong className="species-card-name">{characterClass.name}</strong>
              <span className="species-card-summary">
                d{characterClass.hitPointDie} · {characterClass.primaryAbility}
                {characterClass.spellcastingAbility ? " · Spellcaster" : ""}
              </span>
            </span>
          </label>
        ))}
      </div>

      {!selection.classId ? (
        <p className="species-overview-prompt" aria-live="polite">
          Choose a class to read its details.
        </p>
      ) : loadError ? (
        <p className="form-error" role="alert">
          {loadError}
        </p>
      ) : !detail ? (
        <p className="species-overview-prompt" aria-live="polite">
          Loading class details...
        </p>
      ) : (
        <section
          className="species-overview"
          aria-live="polite"
          aria-labelledby="class-overview-title"
        >
          <p className="eyebrow">Class overview</p>
          <h3 id="class-overview-title">{detail.name}</h3>
          <p className="species-overview-intro">{detail.description}</p>
          <div className="species-overview-sections">
            <div className="species-overview-section">
              <h4>Core traits</h4>
              <dl className="class-facts">
                <dt>Hit Point Die</dt>
                <dd>d{detail.hitPointDie}</dd>
                <dt>Primary ability</dt>
                <dd>{detail.primaryAbility}</dd>
                <dt>Saving throws</dt>
                <dd>{detail.savingThrows.join(", ")}</dd>
                <dt>Armor training</dt>
                <dd>{detail.armorTraining.join(", ") || "None"}</dd>
                <dt>Weapons</dt>
                <dd>{detail.weaponProficiencies.join(", ")}</dd>
                {detail.toolProficiencies.length > 0 ? (
                  <>
                    <dt>Tools</dt>
                    <dd>{detail.toolProficiencies.join(", ")}</dd>
                  </>
                ) : null}
                {detail.spellcastingAbility ? (
                  <>
                    <dt>Spellcasting</dt>
                    <dd>{detail.spellcastingAbility}</dd>
                  </>
                ) : null}
              </dl>
            </div>

            <div className="species-overview-section">
              <h4>Level 1 features</h4>
              <ul className="species-trait-list">
                {detail.features
                  .filter((feature) => feature.level === 1)
                  .map((feature) => (
                    <li className="species-trait" key={feature.id}>
                      <strong>{feature.name}</strong>
                      <span>{feature.description}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="species-overview-section">
              <h4>Progression</h4>
              <div className="class-table-wrap">
                <table className="class-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Prof.</th>
                      {Object.keys(detail.levels[0]?.columns ?? {}).map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                      <th>Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.levels.map((level) => (
                      <tr key={level.level}>
                        <td>{level.level}</td>
                        <td>+{level.proficiencyBonus}</td>
                        {Object.keys(detail.levels[0]?.columns ?? {}).map((column) => (
                          <td key={column}>{level.columns[column] ?? "-"}</td>
                        ))}
                        <td>
                          {detail.features
                            .filter((feature) => feature.level === level.level)
                            .map((feature) => feature.name)
                            .join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detail.subclasses.map((subclass) => (
              <div className="species-overview-section" key={subclass.id}>
                <h4>Subclass: {subclass.name}</h4>
                <p className="species-group-description">{subclass.description}</p>
                <ul className="species-trait-list">
                  {subclass.features.map((feature) => (
                    <li className="species-trait" key={feature.id}>
                      <strong>
                        {feature.name} (level {feature.level})
                      </strong>
                      <span>{feature.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="species-overview-section class-choices">
              <h4>Your choices</h4>
              <PickList
                legend="Skills"
                options={detail.skillChoiceOptions}
                value={selection.skills}
                count={detail.skillChoiceCount}
                disabled={backgroundSkills}
                onChange={(skills) =>
                  update({
                    skills,
                    expertise: selection.expertise.filter(
                      (entry) =>
                        backgroundSkills.includes(entry) ||
                        skills.includes(entry) ||
                        detail.toolProficiencies.includes(entry),
                    ),
                  })
                }
              />
              {detail.toolChoice ? (
                <PickList
                  legend={detail.toolChoice.category}
                  options={toolOptions[detail.toolChoice.category] ?? []}
                  value={selection.tools}
                  count={detail.toolChoice.count}
                  onChange={(tools) => update({ tools })}
                />
              ) : null}
              {detail.expertiseCount > 0 ? (
                <PickList
                  legend="Expertise"
                  options={expertiseOptions}
                  value={selection.expertise}
                  count={detail.expertiseCount}
                  onChange={(expertise) => update({ expertise })}
                />
              ) : null}
              {detail.weaponMasteryCount > 0 ? (
                <PickList
                  legend="Weapon Mastery"
                  options={weaponOptions}
                  value={selection.weaponMasteries}
                  count={detail.weaponMasteryCount}
                  onChange={(weaponMasteries) => update({ weaponMasteries })}
                />
              ) : null}
              {detail.choiceGroups.map((group) => (
                <fieldset className="species-choice-group" key={group.id}>
                  <legend className="species-choice-legend">{group.name} · choose 1</legend>
                  <p className="species-group-description">{group.description}</p>
                  <ul className="species-choice-list">
                    {group.options.map((option) => (
                      <li className="species-choice-item" key={option.id}>
                        <label className="species-choice-control">
                          <input
                            checked={selection.featureChoices[group.id] === option.id}
                            className="species-choice-input"
                            name={`class-choice-${group.id}`}
                            onChange={() =>
                              update({
                                featureChoices: {
                                  ...selection.featureChoices,
                                  [group.id]: option.id,
                                },
                              })
                            }
                            type="radio"
                          />
                          <span className="species-choice-option">
                            <strong>{option.name}</strong>
                            <span>{option.description}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              ))}
              <NameInputs
                legend="Cantrip"
                count={cantripCount(detail, selection)}
                value={selection.cantrips}
                onChange={(cantrips) => update({ cantrips })}
              />
              <NameInputs
                legend="Prepared spell"
                count={levelOneCount(detail, "Prepared Spells")}
                value={selection.preparedSpells}
                onChange={(preparedSpells) => update({ preparedSpells })}
              />
              <fieldset className="species-choice-group">
                <legend className="species-choice-legend">Starting equipment</legend>
                <ul className="species-choice-list">
                  {Object.entries(detail.startingEquipment.packages).map(([key, pack]) => (
                    <li className="species-choice-item" key={key}>
                      <label className="species-choice-control">
                        <input
                          checked={selection.equipment === key}
                          className="species-choice-input"
                          name="class-equipment"
                          onChange={() => update({ equipment: key })}
                          type="radio"
                        />
                        <span className="species-choice-option">
                          <strong>Option {key}</strong>
                          <span>
                            {pack.items
                              .map((i) => (i.quantity > 1 ? `${i.item} ×${i.quantity}` : i.item))
                              .join(", ")}
                            ; {pack.gold} GP
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                  <li className="species-choice-item">
                    <label className="species-choice-control">
                      <input
                        checked={selection.equipment === "gold"}
                        className="species-choice-input"
                        name="class-equipment"
                        onChange={() => update({ equipment: "gold" })}
                        type="radio"
                      />
                      <span className="species-choice-option">
                        <strong>Gold</strong>
                        <span>{detail.startingEquipment.goldAlternative} GP</span>
                      </span>
                    </label>
                  </li>
                </ul>
              </fieldset>
            </div>
          </div>
        </section>
      )}
    </fieldset>
  );
}

export default ClassStep;
