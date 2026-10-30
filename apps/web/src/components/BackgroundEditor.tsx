import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AbilityName, BackgroundOption } from "../core/types";

type BackgroundProperties = NonNullable<BackgroundOption["properties"]>;

export type BackgroundMutation = {
  name: string;
  description: string;
  properties: BackgroundProperties;
};

type BackgroundForm = {
  name: string;
  description: string;
  abilityScores: AbilityName[];
  feat: string;
  skillProficiencies: string[];
  toolType: "specific" | "choice";
  toolValue: string;
  items: { item: string; quantity: string }[];
  gold: string;
  alternativeAmount: string;
};

const abilities: AbilityName[] = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

function emptyForm(): BackgroundForm {
  return {
    name: "",
    description: "",
    abilityScores: [],
    feat: "",
    skillProficiencies: [],
    toolType: "specific",
    toolValue: "",
    items: [],
    gold: "0",
    alternativeAmount: "0",
  };
}

function toForm(background: BackgroundOption): BackgroundForm {
  const properties = background.properties;
  if (!properties) {
    return { ...emptyForm(), name: background.name, description: background.description };
  }
  const tool = properties.toolProficiency;
  return {
    name: background.name,
    description: background.description,
    abilityScores: abilities.filter((ability) => properties.abilityScores.includes(ability)),
    feat: properties.feat,
    skillProficiencies: [...properties.skillProficiencies],
    toolType: tool.type,
    toolValue: tool.type === "specific" ? tool.name : tool.category,
    items: properties.equipment.package.items.map((item) => ({
      item: item.item,
      quantity: String(item.quantity),
    })),
    gold: String(properties.equipment.package.gold),
    alternativeAmount: String(properties.equipment.alternative.amount),
  };
}

function toMutation(form: BackgroundForm): BackgroundMutation {
  const toolValue = form.toolValue.trim();
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    properties: {
      abilityScores: form.abilityScores,
      feat: form.feat.trim(),
      skillProficiencies: form.skillProficiencies.map((skill) => skill.trim()),
      toolProficiency:
        form.toolType === "specific"
          ? { type: "specific", name: toolValue }
          : { type: "choice", category: toolValue },
      equipment: {
        package: {
          items: form.items.map((item) => ({
            item: item.item.trim(),
            quantity: Number(item.quantity),
          })),
          gold: Number(form.gold),
        },
        alternative: { amount: Number(form.alternativeAmount), currency: "GP" },
      },
    },
  };
}

function sorted(backgrounds: BackgroundOption[]) {
  return [...backgrounds].sort((a, b) => a.name.localeCompare(b.name));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function BackgroundEditor({
  backgrounds,
  createBackground,
  updateBackground,
  deleteBackground,
  onChange,
}: {
  backgrounds: BackgroundOption[];
  createBackground: (input: BackgroundMutation) => Promise<BackgroundOption>;
  updateBackground: (id: number, input: BackgroundMutation) => Promise<BackgroundOption>;
  deleteBackground: (id: number) => Promise<void>;
  onChange: (backgrounds: BackgroundOption[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<BackgroundForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = backgrounds.find((item) => item.id === selectedId) ?? null;
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return sorted(backgrounds).filter(
      (item) => !needle || item.name.toLocaleLowerCase().includes(needle),
    );
  }, [backgrounds, query]);

  const update = (patch: Partial<BackgroundForm>) =>
    setForm((current) => ({ ...current, ...patch }));

  const select = (background: BackgroundOption) => {
    setSelectedId(background.id);
    setForm(toForm(background));
    setError(null);
    setNotice(null);
  };

  const startNew = () => {
    setSelectedId(null);
    setForm(emptyForm());
    setError(null);
    setNotice(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (form.abilityScores.length === 0) {
      setError("Select at least one ability score.");
      return;
    }
    const numbers = [
      form.gold,
      form.alternativeAmount,
      ...form.items.map((item) => item.quantity),
    ].map(Number);
    if (numbers.some((value) => !Number.isInteger(value) || value < 0)) {
      setError("Quantities and gold must be whole numbers of zero or more.");
      return;
    }
    if (form.items.some((item) => Number(item.quantity) < 1)) {
      setError("Item quantities must be at least 1.");
      return;
    }
    if (
      form.skillProficiencies.some((skill) => !skill.trim()) ||
      form.items.some((item) => !item.item.trim())
    ) {
      setError("Remove or fill in empty skill and item rows.");
      return;
    }

    setBusy(true);
    try {
      const input = toMutation(form);
      const saved =
        selectedId === null
          ? await createBackground(input)
          : await updateBackground(selectedId, input);
      onChange(sorted([...backgrounds.filter((item) => item.id !== saved.id), saved]));
      setSelectedId(saved.id);
      setForm(toForm(saved));
      setNotice(`“${saved.name}” saved.`);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete “${selected.name}”? This cannot be undone.`)) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await deleteBackground(selected.id);
      onChange(backgrounds.filter((item) => item.id !== selected.id));
      startNew();
      setNotice(`“${selected.name}” deleted.`);
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
          <h1>Manage backgrounds</h1>
          <p className="heading-copy">Search and edit every detail of your backgrounds.</p>
        </div>
        <button className="button button-primary" type="button" disabled={busy} onClick={startNew}>
          <span aria-hidden="true">+</span>
          New background
        </button>
      </div>

      <div className="spell-editor-layout">
        <aside className="spell-library" aria-label="Background catalog">
          <div className="spell-library-heading">
            <h2>Backgrounds</h2>
            <span className="count-pill">{visible.length}</span>
          </div>
          <label className="field">
            Search backgrounds
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name"
              type="search"
              value={query}
            />
          </label>
          <ul className="spell-library-list">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  className={`spell-library-item${item.id === selectedId ? " spell-library-item-selected" : ""}`}
                  type="button"
                  disabled={busy}
                  aria-current={item.id === selectedId ? "true" : undefined}
                  onClick={() => select(item)}
                >
                  <span className="spell-library-name">{item.name}</span>
                </button>
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="spell-list-message">No backgrounds match this search.</li>
            ) : null}
          </ul>
        </aside>

        <form
          aria-labelledby="background-form-title"
          className="spell-edit-form form-panel"
          onSubmit={(event) => void save(event)}
        >
          <div className="spell-form-heading">
            <div>
              <p className="step-kicker">
                {selected ? "Selected background" : "Background details"}
              </p>
              <h2 id="background-form-title">{selected ? selected.name : "New background"}</h2>
            </div>
            {selected ? (
              <button
                className="button button-secondary spell-delete-button"
                type="button"
                disabled={busy}
                onClick={() => void remove()}
              >
                Delete
              </button>
            ) : null}
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
                autoComplete="off"
                maxLength={100}
                required
                value={form.name}
                onChange={(event) => update({ name: event.target.value })}
              />
            </label>
            <label className="field spell-field-wide">
              Description
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) => update({ description: event.target.value })}
              />
            </label>

            <fieldset className="spell-classes spell-field-wide">
              <legend className="spell-field-label">Ability scores</legend>
              <div className="spell-class-options">
                {abilities.map((ability) => (
                  <label className="class-pick" key={ability}>
                    <input
                      checked={form.abilityScores.includes(ability)}
                      onChange={(event) =>
                        update({
                          abilityScores: event.target.checked
                            ? [...form.abilityScores, ability]
                            : form.abilityScores.filter((item) => item !== ability),
                        })
                      }
                      type="checkbox"
                    />
                    {ability}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="field spell-field-wide">
              Feat
              <input
                required
                value={form.feat}
                onChange={(event) => update({ feat: event.target.value })}
              />
            </label>

            <fieldset className="spell-classes spell-field-wide">
              <legend className="spell-field-label">Skill proficiencies</legend>
              <div className="class-editor-stack">
                {form.skillProficiencies.map((skill, index) => (
                  <div className="class-editor-row" key={index}>
                    <label className="field class-editor-grow">
                      Skill {index + 1}
                      <input
                        value={skill}
                        onChange={(event) =>
                          update({
                            skillProficiencies: form.skillProficiencies.map((value, i) =>
                              i === index ? event.target.value : value,
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() =>
                        update({
                          skillProficiencies: form.skillProficiencies.filter((_, i) => i !== index),
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
                  onClick={() => update({ skillProficiencies: [...form.skillProficiencies, ""] })}
                >
                  Add skill
                </button>
              </div>
            </fieldset>

            <label className="field">
              Tool proficiency type
              <select
                value={form.toolType}
                onChange={(event) =>
                  update({ toolType: event.target.value as BackgroundForm["toolType"] })
                }
              >
                <option value="specific">Specific tool</option>
                <option value="choice">Choice from category</option>
              </select>
            </label>
            <label className="field">
              {form.toolType === "specific" ? "Tool name" : "Tool category"}
              <input
                required
                value={form.toolValue}
                onChange={(event) => update({ toolValue: event.target.value })}
              />
            </label>

            <fieldset className="spell-classes spell-field-wide">
              <legend className="spell-field-label">Equipment package items</legend>
              <div className="class-editor-stack">
                {form.items.map((entry, index) => (
                  <div className="class-editor-row" key={index}>
                    <label className="field class-editor-grow">
                      Item {index + 1}
                      <input
                        value={entry.item}
                        onChange={(event) =>
                          update({
                            items: form.items.map((value, i) =>
                              i === index ? { ...value, item: event.target.value } : value,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="field">
                      Quantity
                      <input
                        min={1}
                        step={1}
                        type="number"
                        value={entry.quantity}
                        onChange={(event) =>
                          update({
                            items: form.items.map((value, i) =>
                              i === index ? { ...value, quantity: event.target.value } : value,
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => update({ items: form.items.filter((_, i) => i !== index) })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="button button-secondary class-editor-add"
                  type="button"
                  onClick={() => update({ items: [...form.items, { item: "", quantity: "1" }] })}
                >
                  Add item
                </button>
              </div>
            </fieldset>

            <label className="field">
              Package gold (GP)
              <input
                min={0}
                step={1}
                type="number"
                value={form.gold}
                onChange={(event) => update({ gold: event.target.value })}
              />
            </label>
            <label className="field">
              Alternative gold (GP)
              <input
                min={0}
                step={1}
                type="number"
                value={form.alternativeAmount}
                onChange={(event) => update({ alternativeAmount: event.target.value })}
              />
            </label>
          </fieldset>

          <div className="form-actions spell-form-actions">
            <span className="spell-form-status" aria-live="polite">
              {busy ? "Saving..." : ""}
            </span>
            <button className="button button-primary" disabled={busy} type="submit">
              {busy ? "Saving..." : selected ? "Save changes" : "Create background"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default BackgroundEditor;
