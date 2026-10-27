import { useEffect, useMemo, useRef, useState } from "react";
import type { SpellOption } from "../core/types";

export type SpellSelection = {
  cantrips: number[];
  spellbook: number[];
  preparedSpells: number[];
};

type SectionKey = keyof SpellSelection;

type Section = {
  key: SectionKey;
  label: string;
  count: number;
  hint: string;
  options: SpellOption[];
};

function componentsLabel(spell: SpellOption): string {
  const parts = spell.components.join(", ");
  return spell.material ? `${parts} (${spell.material})` : parts;
}

function SpellDetails({ spell }: { spell: SpellOption }) {
  return (
    <div className="spell-details">
      <dl className="class-facts">
        <dt>Casting time</dt>
        <dd>
          {spell.castingTime}
          {spell.ritual ? " (ritual)" : ""}
        </dd>
        <dt>Range</dt>
        <dd>{spell.range}</dd>
        <dt>Components</dt>
        <dd>{componentsLabel(spell)}</dd>
        <dt>Duration</dt>
        <dd>{spell.concentration ? `Concentration, ${spell.duration}` : spell.duration}</dd>
        <dt>Classes</dt>
        <dd>{spell.classes.join(", ")}</dd>
      </dl>
      <p>{spell.description}</p>
      {spell.higherLevel ? (
        <p>
          <strong>Using a higher-level slot.</strong> {spell.higherLevel}
        </p>
      ) : null}
    </div>
  );
}

function SpellModal({
  spells,
  spellbookCount,
  cantripCount,
  preparedCount,
  value,
  onChange,
  onClose,
}: {
  spells: SpellOption[];
  spellbookCount: number;
  cantripCount: number;
  preparedCount: number;
  value: SpellSelection;
  onChange: (next: SpellSelection) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<SectionKey>("cantrips");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const sections = useMemo<Section[]>(() => {
    const cantrips = spells.filter((spell) => spell.level === 0);
    const levelOne = spells.filter((spell) => spell.level === 1);
    const result: Section[] = [];
    if (cantripCount > 0) {
      result.push({
        key: "cantrips",
        label: "Cantrips",
        count: cantripCount,
        hint: "Cantrips are always ready to cast.",
        options: cantrips,
      });
    }
    if (spellbookCount > 0) {
      result.push({
        key: "spellbook",
        label: "Spellbook",
        count: spellbookCount,
        hint: "Spells your spellbook starts with.",
        options: levelOne,
      });
    }
    if (preparedCount > 0) {
      const fromBook = spellbookCount > 0;
      result.push({
        key: "preparedSpells",
        label: "Prepared spells",
        count: preparedCount,
        hint: fromBook ? "Prepare spells from your spellbook." : "Level 1 spells you have ready.",
        options: fromBook
          ? levelOne.filter((spell) => value.spellbook.includes(spell.id))
          : levelOne,
      });
    }
    return result;
  }, [spells, cantripCount, spellbookCount, preparedCount, value.spellbook]);

  const section = sections.find((entry) => entry.key === active) ?? sections[0];
  const needle = query.trim().toLowerCase();
  const visible = section
    ? section.options.filter(
        (spell) =>
          !needle ||
          spell.name.toLowerCase().includes(needle) ||
          spell.school.toLowerCase().includes(needle),
      )
    : [];

  const toggle = (key: SectionKey, id: number, checked: boolean) => {
    const current = value[key];
    const next = checked ? [...current, id] : current.filter((entry) => entry !== id);
    const updated = { ...value, [key]: next };
    if (key === "spellbook") {
      updated.preparedSpells = value.preparedSpells.filter((entry) => next.includes(entry));
    }
    onChange(updated);
  };

  return (
    <dialog
      ref={ref}
      className="spell-modal"
      aria-labelledby="spell-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id="spell-modal-title">{spellbookCount > 0 ? "Manage spellbook" : "Choose spells"}</h2>
      <div className="spell-tabs" role="tablist">
        {sections.map((entry) => (
          <button
            aria-selected={entry.key === section?.key}
            className={`button ${entry.key === section?.key ? "spell-tab-active" : ""}`}
            key={entry.key}
            onClick={() => {
              setActive(entry.key);
              setOpenId(null);
            }}
            role="tab"
            type="button"
          >
            {entry.label} {value[entry.key].length}/{entry.count}
          </button>
        ))}
      </div>
      {section ? (
        <>
          <p className="species-choice-status">{section.hint}</p>
          <input
            aria-label="Search spells"
            className="spell-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or school"
            type="search"
            value={query}
          />
          <ul className="spell-list">
            {visible.map((spell) => {
              const checked = value[section.key].includes(spell.id);
              const blocked = !checked && value[section.key].length >= section.count;
              return (
                <li className="spell-item" key={spell.id}>
                  <div className="spell-row">
                    <label className="class-pick">
                      <input
                        checked={checked}
                        disabled={blocked}
                        onChange={(event) => toggle(section.key, spell.id, event.target.checked)}
                        type="checkbox"
                      />
                      <span>{spell.name}</span>
                    </label>
                    <span className="spell-meta">
                      {spell.school}
                      {spell.concentration ? " · C" : ""}
                      {spell.ritual ? " · R" : ""}
                    </span>
                    <button
                      aria-expanded={openId === spell.id}
                      className="button"
                      onClick={() => setOpenId(openId === spell.id ? null : spell.id)}
                      type="button"
                    >
                      Details
                    </button>
                  </div>
                  {openId === spell.id ? <SpellDetails spell={spell} /> : null}
                </li>
              );
            })}
            {visible.length === 0 ? <li>No spells found.</li> : null}
          </ul>
        </>
      ) : (
        <p>This class has no spells to choose at level 1.</p>
      )}
      <div className="confirm-actions">
        <button className="button" onClick={onClose} type="button">
          Done
        </button>
      </div>
    </dialog>
  );
}

export default SpellModal;
