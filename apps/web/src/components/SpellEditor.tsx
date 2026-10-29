import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ClassSummary, SpellOption } from "../core/types";

type SpellComponent = "V" | "S" | "M";

type SpellMutation = Omit<SpellOption, "id" | "classes" | "components"> & {
  components: SpellComponent[];
  classIds: number[];
};

type SpellForm = Omit<SpellMutation, "level" | "classIds"> & {
  level: string;
  classIds: number[];
};

const spellComponents: SpellComponent[] = ["V", "S", "M"];

function emptySpell(): SpellForm {
  return {
    name: "",
    level: "0",
    school: "",
    castingTime: "",
    range: "",
    components: [],
    material: null,
    duration: "",
    concentration: false,
    ritual: false,
    description: "",
    higherLevel: null,
    classIds: [],
  };
}

function spellToForm(spell: SpellOption, classes: ClassSummary[]): SpellForm {
  return {
    name: spell.name,
    level: String(spell.level),
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spellComponents.filter((component) => spell.components.includes(component)),
    material: spell.material,
    duration: spell.duration,
    concentration: spell.concentration,
    ritual: spell.ritual,
    description: spell.description,
    higherLevel: spell.higherLevel,
    classIds: classes.filter((item) => spell.classes.includes(item.name)).map((item) => item.id),
  };
}

function sortedSpells(spells: SpellOption[]) {
  return [...spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function SpellEditor({
  classes,
  loadSpells,
  createSpell,
  updateSpell,
  deleteSpell,
}: {
  classes: ClassSummary[];
  loadSpells: () => Promise<SpellOption[]>;
  createSpell: (input: SpellMutation) => Promise<SpellOption>;
  updateSpell: (id: number, input: SpellMutation) => Promise<SpellOption>;
  deleteSpell: (id: number) => Promise<void>;
}) {
  const [spells, setSpells] = useState<SpellOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<SpellForm>(emptySpell);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    void loadSpells()
      .then((result) => {
        if (active) setSpells(sortedSpells(result));
      })
      .catch((reason: unknown) => {
        if (active) setLoadError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadSpells, reloadKey]);

  const selectedSpell = spells.find((spell) => spell.id === selectedId) ?? null;
  const visibleSpells = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return spells.filter((spell) => {
      const matchesQuery =
        !needle ||
        [spell.name, spell.school, spell.description].some((value) =>
          value.toLocaleLowerCase().includes(needle),
        );
      const matchesLevel = levelFilter === "" || spell.level === Number(levelFilter);
      const matchesClass = classFilter === "" || spell.classes.includes(classFilter);
      return matchesQuery && matchesLevel && matchesClass;
    });
  }, [classFilter, levelFilter, query, spells]);

  const selectSpell = (spell: SpellOption) => {
    setSelectedId(spell.id);
    setForm(spellToForm(spell, classes));
    setError(null);
    setNotice(null);
  };

  const startNewSpell = () => {
    setSelectedId(null);
    setForm(emptySpell());
    setError(null);
    setNotice(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const input: SpellMutation = {
      ...form,
      name: form.name.trim(),
      level: Number(form.level),
      school: form.school.trim(),
      castingTime: form.castingTime.trim(),
      range: form.range.trim(),
      material: form.material?.trim() || null,
      duration: form.duration.trim(),
      description: form.description.trim(),
      higherLevel: form.higherLevel?.trim() || null,
    };

    try {
      const saved =
        selectedId === null ? await createSpell(input) : await updateSpell(selectedId, input);
      setSpells((current) =>
        sortedSpells([...current.filter((spell) => spell.id !== saved.id), saved]),
      );
      setLoadError(null);
      setSelectedId(saved.id);
      setForm(spellToForm(saved, classes));
      setNotice(`“${saved.name}” saved.`);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selectedSpell) return;
    if (!window.confirm(`Delete “${selectedSpell.name}”? This cannot be undone.`)) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await deleteSpell(selectedSpell.id);
      setSpells((current) => current.filter((spell) => spell.id !== selectedSpell.id));
      setLoadError(null);
      startNewSpell();
      setNotice(`“${selectedSpell.name}” deleted.`);
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
          <h1>Manage spells</h1>
          <p className="heading-copy">Search, update, and organize the spells in your catalog.</p>
        </div>
        <button
          className="button button-primary"
          type="button"
          disabled={busy}
          onClick={startNewSpell}
        >
          <span aria-hidden="true">+</span>
          New spell
        </button>
      </div>

      <div className="spell-editor-layout">
        <aside className="spell-library" aria-label="Spell catalog">
          <div className="spell-library-heading">
            <h2>Spells</h2>
            <span className="count-pill">{visibleSpells.length}</span>
          </div>
          <label className="field">
            Search spells
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, school, or description"
              type="search"
              value={query}
            />
          </label>
          <div className="spell-filter-row">
            <label className="field">
              Level
              <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                <option value="">All levels</option>
                {Array.from({ length: 10 }, (_, level) => (
                  <option key={level} value={level}>
                    {level === 0 ? "Cantrip" : `Level ${level}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Class
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="">All classes</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {loading ? (
            <p className="spell-list-message" aria-live="polite">
              Loading spells...
            </p>
          ) : loadError && spells.length === 0 ? (
            <div className="spell-list-message" role="alert">
              <p>{loadError}</p>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setLoading(true);
                  setLoadError(null);
                  setReloadKey((current) => current + 1);
                }}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {loadError ? (
                <div className="spell-list-message" role="alert">
                  <p>Could not refresh the spell list: {loadError}</p>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setLoadError(null);
                      setReloadKey((current) => current + 1);
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : null}
              <ul className="spell-library-list">
                {visibleSpells.map((spell) => (
                  <li key={spell.id}>
                    <button
                      className={`spell-library-item${spell.id === selectedId ? " spell-library-item-selected" : ""}`}
                      type="button"
                      disabled={busy}
                      aria-current={spell.id === selectedId ? "true" : undefined}
                      onClick={() => selectSpell(spell)}
                    >
                      <span className="spell-library-name">{spell.name}</span>
                      <span className="spell-library-meta">
                        {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} · {spell.school}
                      </span>
                    </button>
                  </li>
                ))}
                {visibleSpells.length === 0 ? (
                  <li className="spell-list-message">No spells match these filters.</li>
                ) : null}
              </ul>
            </>
          )}
        </aside>

        <form
          aria-labelledby="spell-form-title"
          className="spell-edit-form form-panel"
          onSubmit={(event) => void save(event)}
        >
          <div className="spell-form-heading">
            <div>
              <p className="step-kicker">{selectedSpell ? "Selected spell" : "Spell details"}</p>
              <h2 id="spell-form-title">{selectedSpell ? selectedSpell.name : "New spell"}</h2>
            </div>
            {selectedSpell ? (
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
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="field">
              Level
              <select
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, level: event.target.value }))
                }
              >
                {Array.from({ length: 10 }, (_, level) => (
                  <option key={level} value={level}>
                    {level === 0 ? "Cantrip" : `Level ${level}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              School
              <input
                required
                value={form.school}
                onChange={(event) =>
                  setForm((current) => ({ ...current, school: event.target.value }))
                }
              />
            </label>
            <label className="field">
              Casting time
              <input
                value={form.castingTime}
                onChange={(event) =>
                  setForm((current) => ({ ...current, castingTime: event.target.value }))
                }
              />
            </label>
            <label className="field">
              Range
              <input
                value={form.range}
                onChange={(event) =>
                  setForm((current) => ({ ...current, range: event.target.value }))
                }
              />
            </label>
            <label className="field">
              Duration
              <input
                value={form.duration}
                onChange={(event) =>
                  setForm((current) => ({ ...current, duration: event.target.value }))
                }
              />
            </label>
            <div className="spell-checkboxes">
              <span className="spell-field-label">Components</span>
              <div className="spell-component-options">
                {spellComponents.map((component) => (
                  <label className="class-pick" key={component}>
                    <input
                      checked={form.components.includes(component)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          components: event.target.checked
                            ? [...current.components, component]
                            : current.components.filter((value) => value !== component),
                        }))
                      }
                      type="checkbox"
                    />
                    {component}
                  </label>
                ))}
              </div>
            </div>
            <label className="field">
              Material
              <input
                value={form.material ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, material: event.target.value }))
                }
              />
            </label>
            <div className="spell-checkboxes">
              <span className="spell-field-label">Traits</span>
              <div className="spell-component-options">
                <label className="class-pick">
                  <input
                    checked={form.concentration}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, concentration: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Concentration
                </label>
                <label className="class-pick">
                  <input
                    checked={form.ritual}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, ritual: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Ritual
                </label>
              </div>
            </div>
            <label className="field spell-field-wide">
              Description
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="field spell-field-wide">
              At higher levels
              <textarea
                rows={3}
                value={form.higherLevel ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, higherLevel: event.target.value }))
                }
              />
            </label>
            <fieldset className="spell-classes spell-field-wide">
              <legend className="spell-field-label">Available to classes</legend>
              <div className="spell-class-options">
                {classes.map((item) => (
                  <label className="class-pick" key={item.id}>
                    <input
                      checked={form.classIds.includes(item.id)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          classIds: event.target.checked
                            ? [...current.classIds, item.id]
                            : current.classIds.filter((id) => id !== item.id),
                        }))
                      }
                      type="checkbox"
                    />
                    {item.name}
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>

          <div className="form-actions spell-form-actions">
            <span className="spell-form-status" aria-live="polite">
              {busy ? "Saving..." : ""}
            </span>
            <button className="button button-primary" disabled={busy} type="submit">
              {busy ? "Saving..." : selectedSpell ? "Save changes" : "Create spell"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SpellEditor;
