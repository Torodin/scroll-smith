import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AbilityName, ClassDetail, ClassSummary } from "../core/types";

const abilities: AbilityName[] = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

type FeatureDraft = { level: number; name: string; description: string };

type ClassForm = {
  name: string;
  description: string;
  hitPointDie: number;
  primaryAbility: string;
  savingThrows: AbilityName[];
  spellcastingAbility: AbilityName | "";
  armorTraining: string;
  weaponProficiencies: string;
  toolProficiencies: string;
  toolChoice: { count: number; category: string } | null;
  skillChoiceCount: number;
  skillChoiceOptions: string;
  expertiseCount: number;
  weaponMasteryCount: number;
  spellbookCount: number;
  packages: { key: string; gold: number; items: { item: string; quantity: number }[] }[];
  goldAlternative: number;
  levels: { level: number; proficiencyBonus: number; columns: string; spellSlots: string }[];
  features: FeatureDraft[];
  subclasses: { name: string; description: string; features: FeatureDraft[] }[];
  choiceGroups: {
    level: number;
    name: string;
    description: string;
    choiceCount: number;
    options: { name: string; description: string; extraCantrips: number }[];
  }[];
};

const lines = (values: string[]) => values.join("\n");
const parseLines = (text: string) =>
  text
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

function columnsToText(columns: Record<string, string | number>) {
  return Object.entries(columns)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function parseColumns(text: string) {
  const columns: Record<string, string | number> = {};
  for (const line of parseLines(text)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) columns[key] = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
  }
  return columns;
}

function parseSlots(text: string) {
  const values = text
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  return values.length === 0 ? null : values;
}

function detailToForm(detail: ClassDetail): ClassForm {
  return {
    name: detail.name,
    description: detail.description,
    hitPointDie: detail.hitPointDie,
    primaryAbility: detail.primaryAbility,
    savingThrows: detail.savingThrows,
    spellcastingAbility: detail.spellcastingAbility ?? "",
    armorTraining: lines(detail.armorTraining),
    weaponProficiencies: lines(detail.weaponProficiencies),
    toolProficiencies: lines(detail.toolProficiencies),
    toolChoice: detail.toolChoice ? { ...detail.toolChoice } : null,
    skillChoiceCount: detail.skillChoiceCount,
    skillChoiceOptions: lines(detail.skillChoiceOptions),
    expertiseCount: detail.expertiseCount,
    weaponMasteryCount: detail.weaponMasteryCount,
    spellbookCount: detail.spellbookCount,
    packages: Object.entries(detail.startingEquipment.packages).map(([key, value]) => ({
      key,
      gold: value.gold,
      items: value.items.map((item) => ({ ...item })),
    })),
    goldAlternative: detail.startingEquipment.goldAlternative,
    levels: detail.levels.map((item) => ({
      level: item.level,
      proficiencyBonus: item.proficiencyBonus,
      columns: columnsToText(item.columns),
      spellSlots: item.spellSlots?.join(", ") ?? "",
    })),
    features: detail.features.map(({ level, name, description }) => ({ level, name, description })),
    subclasses: detail.subclasses.map((subclass) => ({
      name: subclass.name,
      description: subclass.description,
      features: subclass.features.map(({ level, name, description }) => ({
        level,
        name,
        description,
      })),
    })),
    choiceGroups: detail.choiceGroups.map((group) => ({
      level: group.level,
      name: group.name,
      description: group.description,
      choiceCount: group.choiceCount,
      options: group.options.map(({ name, description, extraCantrips }) => ({
        name,
        description,
        extraCantrips,
      })),
    })),
  };
}

function formToInput(form: ClassForm) {
  const packages: Record<string, { items: { item: string; quantity: number }[]; gold: number }> =
    {};
  for (const item of form.packages) {
    packages[item.key.trim()] = {
      gold: item.gold,
      items: item.items.filter((entry) => entry.item.trim()),
    };
  }

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    hitPointDie: form.hitPointDie,
    primaryAbility: form.primaryAbility.trim(),
    savingThrows: form.savingThrows,
    spellcastingAbility: form.spellcastingAbility || null,
    armorTraining: parseLines(form.armorTraining),
    weaponProficiencies: parseLines(form.weaponProficiencies),
    toolProficiencies: parseLines(form.toolProficiencies),
    toolChoice: form.toolChoice
      ? { count: form.toolChoice.count, category: form.toolChoice.category.trim() }
      : null,
    skillChoiceCount: form.skillChoiceCount,
    skillChoiceOptions: parseLines(form.skillChoiceOptions),
    expertiseCount: form.expertiseCount,
    weaponMasteryCount: form.weaponMasteryCount,
    spellbookCount: form.spellbookCount,
    startingEquipment: { packages, goldAlternative: form.goldAlternative },
    levels: form.levels.map((item) => ({
      level: item.level,
      proficiencyBonus: item.proficiencyBonus,
      columns: parseColumns(item.columns),
      spellSlots: parseSlots(item.spellSlots),
    })),
    features: form.features,
    subclasses: form.subclasses,
    choiceGroups: form.choiceGroups,
  };
}

export type ClassUpdateInput = ReturnType<typeof formToInput>;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function replaceAt<T>(list: T[], index: number, value: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...value } : item));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <label className="field">
      {label}
      <input
        min={min}
        type="number"
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) => onChange(event.target.valueAsNumber)}
      />
    </label>
  );
}

function FeatureList({
  features,
  onChange,
}: {
  features: FeatureDraft[];
  onChange: (features: FeatureDraft[]) => void;
}) {
  return (
    <div className="class-editor-stack">
      {features.map((feature, index) => (
        <div className="class-editor-card" key={index}>
          <div className="class-editor-row">
            <NumberField
              label="Level"
              min={1}
              value={feature.level}
              onChange={(level) => onChange(replaceAt(features, index, { level }))}
            />
            <label className="field class-editor-grow">
              Name
              <input
                value={feature.name}
                onChange={(event) =>
                  onChange(replaceAt(features, index, { name: event.target.value }))
                }
              />
            </label>
            <button
              className="text-button"
              type="button"
              onClick={() => onChange(removeAt(features, index))}
            >
              Remove
            </button>
          </div>
          <label className="field">
            Description
            <textarea
              rows={3}
              value={feature.description}
              onChange={(event) =>
                onChange(replaceAt(features, index, { description: event.target.value }))
              }
            />
          </label>
        </div>
      ))}
      <button
        className="button button-secondary class-editor-add"
        type="button"
        onClick={() => onChange([...features, { level: 1, name: "", description: "" }])}
      >
        Add feature
      </button>
    </div>
  );
}

function ClassEditor({
  classes,
  loadClass,
  updateClass,
  onSaved,
}: {
  classes: ClassSummary[];
  loadClass: (id: number) => Promise<ClassDetail>;
  updateClass: (id: number, input: ClassUpdateInput) => Promise<ClassDetail>;
  onSaved: (detail: ClassDetail) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<ClassForm | null>(null);
  const [query, setQuery] = useState("");
  const [casterFilter, setCasterFilter] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === null) return;
    let active = true;
    void loadClass(selectedId)
      .then((detail) => {
        if (active) setForm(detailToForm(detail));
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });

    return () => {
      active = false;
    };
  }, [loadClass, selectedId]);

  const visibleClasses = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return classes.filter((item) => {
      const matchesName = !needle || item.name.toLocaleLowerCase().includes(needle);
      const isCaster = item.spellcastingAbility !== null;
      const matchesCaster =
        casterFilter === "" || (casterFilter === "caster" ? isCaster : !isCaster);
      return matchesName && matchesCaster;
    });
  }, [casterFilter, classes, query]);

  const selectedClass = classes.find((item) => item.id === selectedId) ?? null;

  const patch = (value: Partial<ClassForm>) =>
    setForm((current) => (current ? { ...current, ...value } : current));

  const selectClass = (item: ClassSummary) => {
    if (item.id === selectedId) return;
    setSelectedId(item.id);
    setForm(null);
    setLoadingDetail(true);
    setError(null);
    setNotice(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedId === null || !form) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await updateClass(selectedId, formToInput(form));
      setForm(detailToForm(saved));
      onSaved(saved);
      setNotice(`“${saved.name}” saved.`);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="spell-editor-page">
      <div className="page-heading spell-editor-heading">
        <div>
          <p className="eyebrow">Rules library</p>
          <h1>Manage classes</h1>
          <p className="heading-copy">Search and update every detail of your classes.</p>
        </div>
      </div>

      <div className="spell-editor-layout">
        <aside className="spell-library" aria-label="Class catalog">
          <div className="spell-library-heading">
            <h2>Classes</h2>
            <span className="count-pill">{visibleClasses.length}</span>
          </div>
          <label className="field">
            Search classes
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name"
              type="search"
              value={query}
            />
          </label>
          <label className="field">
            Spellcasting
            <select value={casterFilter} onChange={(event) => setCasterFilter(event.target.value)}>
              <option value="">All classes</option>
              <option value="caster">Spellcasters</option>
              <option value="non-caster">Non-spellcasters</option>
            </select>
          </label>
          <ul className="spell-library-list">
            {visibleClasses.map((item) => (
              <li key={item.id}>
                <button
                  className={`spell-library-item${item.id === selectedId ? " spell-library-item-selected" : ""}`}
                  type="button"
                  disabled={busy}
                  aria-current={item.id === selectedId ? "true" : undefined}
                  onClick={() => selectClass(item)}
                >
                  <span className="spell-library-name">{item.name}</span>
                  <span className="spell-library-meta">
                    d{item.hitPointDie} ·{" "}
                    {item.spellcastingAbility
                      ? `Spellcaster (${item.spellcastingAbility})`
                      : "Non-spellcaster"}
                  </span>
                </button>
              </li>
            ))}
            {visibleClasses.length === 0 ? (
              <li className="spell-list-message">No classes match these filters.</li>
            ) : null}
          </ul>
        </aside>

        {!form ? (
          <div className="spell-edit-form form-panel">
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="spell-list-message" aria-live="polite">
                {loadingDetail ? "Loading class..." : "Select a class to edit its details."}
              </p>
            )}
          </div>
        ) : (
          <form
            aria-labelledby="class-form-title"
            className="spell-edit-form form-panel"
            onSubmit={(event) => void save(event)}
          >
            <div className="spell-form-heading">
              <div>
                <p className="step-kicker">Selected class</p>
                <h2 id="class-form-title">{selectedClass?.name}</h2>
              </div>
            </div>

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="spell-form-notice" role="status">
                {notice}
              </p>
            ) : null}

            <fieldset className="spell-form-grid" disabled={busy}>
              <label className="field spell-field-wide">
                Name
                <input
                  maxLength={100}
                  required
                  value={form.name}
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </label>
              <label className="field spell-field-wide">
                Description
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) => patch({ description: event.target.value })}
                />
              </label>
              <NumberField
                label="Hit point die (sides)"
                min={1}
                value={form.hitPointDie}
                onChange={(hitPointDie) => patch({ hitPointDie })}
              />
              <label className="field">
                Primary ability
                <input
                  value={form.primaryAbility}
                  onChange={(event) => patch({ primaryAbility: event.target.value })}
                />
              </label>
              <label className="field">
                Spellcasting ability
                <select
                  value={form.spellcastingAbility}
                  onChange={(event) =>
                    patch({ spellcastingAbility: event.target.value as AbilityName | "" })
                  }
                >
                  <option value="">None (non-spellcaster)</option>
                  {abilities.map((ability) => (
                    <option key={ability} value={ability}>
                      {ability}
                    </option>
                  ))}
                </select>
              </label>
              <div className="spell-checkboxes">
                <span className="spell-field-label">Saving throws</span>
                <div className="spell-component-options">
                  {abilities.map((ability) => (
                    <label className="class-pick" key={ability}>
                      <input
                        checked={form.savingThrows.includes(ability)}
                        onChange={(event) =>
                          patch({
                            savingThrows: event.target.checked
                              ? [...form.savingThrows, ability]
                              : form.savingThrows.filter((value) => value !== ability),
                          })
                        }
                        type="checkbox"
                      />
                      {ability}
                    </label>
                  ))}
                </div>
              </div>

              <label className="field">
                Armor training (one per line)
                <textarea
                  rows={3}
                  value={form.armorTraining}
                  onChange={(event) => patch({ armorTraining: event.target.value })}
                />
              </label>
              <label className="field">
                Weapon proficiencies (one per line)
                <textarea
                  rows={3}
                  value={form.weaponProficiencies}
                  onChange={(event) => patch({ weaponProficiencies: event.target.value })}
                />
              </label>
              <label className="field">
                Tool proficiencies (one per line)
                <textarea
                  rows={3}
                  value={form.toolProficiencies}
                  onChange={(event) => patch({ toolProficiencies: event.target.value })}
                />
              </label>
              <div className="spell-checkboxes">
                <label className="class-pick">
                  <input
                    checked={form.toolChoice !== null}
                    onChange={(event) =>
                      patch({
                        toolChoice: event.target.checked ? { count: 1, category: "" } : null,
                      })
                    }
                    type="checkbox"
                  />
                  Tool choice
                </label>
                {form.toolChoice ? (
                  <div className="class-editor-row">
                    <NumberField
                      label="Count"
                      min={1}
                      value={form.toolChoice.count}
                      onChange={(count) => patch({ toolChoice: { ...form.toolChoice!, count } })}
                    />
                    <label className="field class-editor-grow">
                      Category
                      <input
                        value={form.toolChoice.category}
                        onChange={(event) =>
                          patch({
                            toolChoice: { ...form.toolChoice!, category: event.target.value },
                          })
                        }
                      />
                    </label>
                  </div>
                ) : null}
              </div>

              <NumberField
                label="Skill choices"
                value={form.skillChoiceCount}
                onChange={(skillChoiceCount) => patch({ skillChoiceCount })}
              />
              <label className="field">
                Skill options (one per line)
                <textarea
                  rows={4}
                  value={form.skillChoiceOptions}
                  onChange={(event) => patch({ skillChoiceOptions: event.target.value })}
                />
              </label>
              <NumberField
                label="Expertise count"
                value={form.expertiseCount}
                onChange={(expertiseCount) => patch({ expertiseCount })}
              />
              <NumberField
                label="Weapon mastery count"
                value={form.weaponMasteryCount}
                onChange={(weaponMasteryCount) => patch({ weaponMasteryCount })}
              />
              <NumberField
                label="Spellbook count"
                value={form.spellbookCount}
                onChange={(spellbookCount) => patch({ spellbookCount })}
              />

              <fieldset className="spell-classes spell-field-wide">
                <legend className="spell-field-label">Starting equipment</legend>
                <div className="class-editor-stack">
                  {form.packages.map((pkg, index) => (
                    <div className="class-editor-card" key={index}>
                      <div className="class-editor-row">
                        <label className="field">
                          Package
                          <input
                            value={pkg.key}
                            onChange={(event) =>
                              patch({
                                packages: replaceAt(form.packages, index, {
                                  key: event.target.value,
                                }),
                              })
                            }
                          />
                        </label>
                        <NumberField
                          label="Gold"
                          value={pkg.gold}
                          onChange={(gold) =>
                            patch({ packages: replaceAt(form.packages, index, { gold }) })
                          }
                        />
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => patch({ packages: removeAt(form.packages, index) })}
                        >
                          Remove
                        </button>
                      </div>
                      {pkg.items.map((entry, itemIndex) => (
                        <div className="class-editor-row" key={itemIndex}>
                          <label className="field class-editor-grow">
                            Item
                            <input
                              value={entry.item}
                              onChange={(event) =>
                                patch({
                                  packages: replaceAt(form.packages, index, {
                                    items: replaceAt(pkg.items, itemIndex, {
                                      item: event.target.value,
                                    }),
                                  }),
                                })
                              }
                            />
                          </label>
                          <NumberField
                            label="Qty"
                            min={1}
                            value={entry.quantity}
                            onChange={(quantity) =>
                              patch({
                                packages: replaceAt(form.packages, index, {
                                  items: replaceAt(pkg.items, itemIndex, { quantity }),
                                }),
                              })
                            }
                          />
                          <button
                            className="text-button"
                            type="button"
                            onClick={() =>
                              patch({
                                packages: replaceAt(form.packages, index, {
                                  items: removeAt(pkg.items, itemIndex),
                                }),
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        className="button button-secondary class-editor-add"
                        type="button"
                        onClick={() =>
                          patch({
                            packages: replaceAt(form.packages, index, {
                              items: [...pkg.items, { item: "", quantity: 1 }],
                            }),
                          })
                        }
                      >
                        Add item
                      </button>
                    </div>
                  ))}
                  <button
                    className="button button-secondary class-editor-add"
                    type="button"
                    onClick={() =>
                      patch({ packages: [...form.packages, { key: "", gold: 0, items: [] }] })
                    }
                  >
                    Add package
                  </button>
                  <NumberField
                    label="Gold alternative"
                    value={form.goldAlternative}
                    onChange={(goldAlternative) => patch({ goldAlternative })}
                  />
                </div>
              </fieldset>

              <fieldset className="spell-classes spell-field-wide">
                <legend className="spell-field-label">Levels</legend>
                <div className="class-editor-stack">
                  {form.levels.map((row, index) => (
                    <div className="class-editor-card" key={index}>
                      <div className="class-editor-row">
                        <NumberField
                          label="Level"
                          min={1}
                          value={row.level}
                          onChange={(level) =>
                            patch({ levels: replaceAt(form.levels, index, { level }) })
                          }
                        />
                        <NumberField
                          label="Proficiency bonus"
                          min={1}
                          value={row.proficiencyBonus}
                          onChange={(proficiencyBonus) =>
                            patch({ levels: replaceAt(form.levels, index, { proficiencyBonus }) })
                          }
                        />
                        <label className="field class-editor-grow">
                          Spell slots (comma-separated)
                          <input
                            value={row.spellSlots}
                            onChange={(event) =>
                              patch({
                                levels: replaceAt(form.levels, index, {
                                  spellSlots: event.target.value,
                                }),
                              })
                            }
                          />
                        </label>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => patch({ levels: removeAt(form.levels, index) })}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="field">
                        Columns (one “Name: value” per line)
                        <textarea
                          rows={3}
                          value={row.columns}
                          onChange={(event) =>
                            patch({
                              levels: replaceAt(form.levels, index, {
                                columns: event.target.value,
                              }),
                            })
                          }
                        />
                      </label>
                    </div>
                  ))}
                  <button
                    className="button button-secondary class-editor-add"
                    type="button"
                    onClick={() =>
                      patch({
                        levels: [
                          ...form.levels,
                          {
                            level: form.levels.length + 1,
                            proficiencyBonus: 2,
                            columns: "",
                            spellSlots: "",
                          },
                        ],
                      })
                    }
                  >
                    Add level
                  </button>
                </div>
              </fieldset>

              <fieldset className="spell-classes spell-field-wide">
                <legend className="spell-field-label">Class features</legend>
                <FeatureList
                  features={form.features}
                  onChange={(features) => patch({ features })}
                />
              </fieldset>

              <fieldset className="spell-classes spell-field-wide">
                <legend className="spell-field-label">Subclasses</legend>
                <div className="class-editor-stack">
                  {form.subclasses.map((subclass, index) => (
                    <div className="class-editor-card" key={index}>
                      <div className="class-editor-row">
                        <label className="field class-editor-grow">
                          Name
                          <input
                            value={subclass.name}
                            onChange={(event) =>
                              patch({
                                subclasses: replaceAt(form.subclasses, index, {
                                  name: event.target.value,
                                }),
                              })
                            }
                          />
                        </label>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => patch({ subclasses: removeAt(form.subclasses, index) })}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="field">
                        Description
                        <textarea
                          rows={3}
                          value={subclass.description}
                          onChange={(event) =>
                            patch({
                              subclasses: replaceAt(form.subclasses, index, {
                                description: event.target.value,
                              }),
                            })
                          }
                        />
                      </label>
                      <span className="spell-field-label">Subclass features</span>
                      <FeatureList
                        features={subclass.features}
                        onChange={(features) =>
                          patch({ subclasses: replaceAt(form.subclasses, index, { features }) })
                        }
                      />
                    </div>
                  ))}
                  <button
                    className="button button-secondary class-editor-add"
                    type="button"
                    onClick={() =>
                      patch({
                        subclasses: [
                          ...form.subclasses,
                          { name: "", description: "", features: [] },
                        ],
                      })
                    }
                  >
                    Add subclass
                  </button>
                </div>
              </fieldset>

              <fieldset className="spell-classes spell-field-wide">
                <legend className="spell-field-label">Choice groups</legend>
                <div className="class-editor-stack">
                  {form.choiceGroups.map((group, index) => (
                    <div className="class-editor-card" key={index}>
                      <div className="class-editor-row">
                        <NumberField
                          label="Level"
                          min={1}
                          value={group.level}
                          onChange={(level) =>
                            patch({ choiceGroups: replaceAt(form.choiceGroups, index, { level }) })
                          }
                        />
                        <label className="field class-editor-grow">
                          Name
                          <input
                            value={group.name}
                            onChange={(event) =>
                              patch({
                                choiceGroups: replaceAt(form.choiceGroups, index, {
                                  name: event.target.value,
                                }),
                              })
                            }
                          />
                        </label>
                        <NumberField
                          label="Choices"
                          min={1}
                          value={group.choiceCount}
                          onChange={(choiceCount) =>
                            patch({
                              choiceGroups: replaceAt(form.choiceGroups, index, { choiceCount }),
                            })
                          }
                        />
                        <button
                          className="text-button"
                          type="button"
                          onClick={() =>
                            patch({ choiceGroups: removeAt(form.choiceGroups, index) })
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <label className="field">
                        Description
                        <textarea
                          rows={3}
                          value={group.description}
                          onChange={(event) =>
                            patch({
                              choiceGroups: replaceAt(form.choiceGroups, index, {
                                description: event.target.value,
                              }),
                            })
                          }
                        />
                      </label>
                      <span className="spell-field-label">Options</span>
                      {group.options.map((option, optionIndex) => {
                        const setOption = (value: Partial<typeof option>) =>
                          patch({
                            choiceGroups: replaceAt(form.choiceGroups, index, {
                              options: replaceAt(group.options, optionIndex, value),
                            }),
                          });
                        return (
                          <div className="class-editor-card" key={optionIndex}>
                            <div className="class-editor-row">
                              <label className="field class-editor-grow">
                                Name
                                <input
                                  value={option.name}
                                  onChange={(event) => setOption({ name: event.target.value })}
                                />
                              </label>
                              <NumberField
                                label="Extra cantrips"
                                value={option.extraCantrips}
                                onChange={(extraCantrips) => setOption({ extraCantrips })}
                              />
                              <button
                                className="text-button"
                                type="button"
                                onClick={() =>
                                  patch({
                                    choiceGroups: replaceAt(form.choiceGroups, index, {
                                      options: removeAt(group.options, optionIndex),
                                    }),
                                  })
                                }
                              >
                                Remove
                              </button>
                            </div>
                            <label className="field">
                              Description
                              <textarea
                                rows={3}
                                value={option.description}
                                onChange={(event) => setOption({ description: event.target.value })}
                              />
                            </label>
                          </div>
                        );
                      })}
                      <button
                        className="button button-secondary class-editor-add"
                        type="button"
                        onClick={() =>
                          patch({
                            choiceGroups: replaceAt(form.choiceGroups, index, {
                              options: [
                                ...group.options,
                                { name: "", description: "", extraCantrips: 0 },
                              ],
                            }),
                          })
                        }
                      >
                        Add option
                      </button>
                    </div>
                  ))}
                  <button
                    className="button button-secondary class-editor-add"
                    type="button"
                    onClick={() =>
                      patch({
                        choiceGroups: [
                          ...form.choiceGroups,
                          { level: 1, name: "", description: "", choiceCount: 1, options: [] },
                        ],
                      })
                    }
                  >
                    Add choice group
                  </button>
                </div>
              </fieldset>
            </fieldset>

            <div className="form-actions spell-form-actions">
              <span className="spell-form-status" aria-live="polite">
                {busy ? "Saving..." : ""}
              </span>
              <button className="button button-primary" disabled={busy} type="submit">
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default ClassEditor;
