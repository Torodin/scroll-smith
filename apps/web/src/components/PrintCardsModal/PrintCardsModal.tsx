import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SpellOption } from "../../core/types";
import "./PrintCardsModal.css";

export type PrintFeature = { key: string; name: string; description: string; source: string };
export type PrintSpellRef = { spellId: number; name: string; level: number };

type Card =
  | { kind: "spell"; key: string; spell: SpellOption }
  | { kind: "feature"; key: string; feature: PrintFeature };

function SpellCard({ spell }: { spell: SpellOption }) {
  const components = spell.material
    ? `${spell.components.join(", ")} (${spell.material})`
    : spell.components.join(", ");
  return (
    <article className="print-card">
      <header>
        <h3>{spell.name}</h3>
        <p>
          {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} · {spell.school}
        </p>
      </header>
      <dl>
        <dt>Cast</dt>
        <dd>
          {spell.castingTime}
          {spell.ritual ? " (ritual)" : ""}
        </dd>
        <dt>Range</dt>
        <dd>{spell.range}</dd>
        <dt>Comp.</dt>
        <dd>{components}</dd>
        <dt>Dur.</dt>
        <dd>{spell.concentration ? `Concentration, ${spell.duration}` : spell.duration}</dd>
      </dl>
      <p className="print-card-body">{spell.description}</p>
      {spell.higherLevel ? (
        <p className="print-card-body">
          <strong>Higher level.</strong> {spell.higherLevel}
        </p>
      ) : null}
    </article>
  );
}

function FeatureCard({ feature }: { feature: PrintFeature }) {
  return (
    <article className="print-card">
      <header>
        <h3>{feature.name}</h3>
        <p>{feature.source}</p>
      </header>
      <p className="print-card-body">{feature.description}</p>
    </article>
  );
}

function CardGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="print-grid">
      {cards.map((card) =>
        card.kind === "spell" ? (
          <SpellCard key={card.key} spell={card.spell} />
        ) : (
          <FeatureCard key={card.key} feature={card.feature} />
        ),
      )}
    </div>
  );
}

function PrintCardsModal({
  characterSpells,
  features,
  loadSpells,
  onClose,
}: {
  characterSpells: PrintSpellRef[];
  features: PrintFeature[];
  loadSpells: () => Promise<SpellOption[]>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [spellDetails, setSpellDetails] = useState<SpellOption[] | null>(null);
  const loadRef = useRef(loadSpells);
  loadRef.current = loadSpells;
  const [error, setError] = useState<string | null>(null);
  const [spellIds, setSpellIds] = useState<Set<number>>(
    () => new Set(characterSpells.map((spell) => spell.spellId)),
  );
  const [featureIds, setFeatureIds] = useState<Set<string>>(
    () => new Set(features.map((feature) => feature.key)),
  );

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (characterSpells.length === 0) {
      setSpellDetails([]);
      return;
    }
    let active = true;
    loadSpells()
      .then((result) => {
        if (active) setSpellDetails(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load spell details.");
          setSpellDetails([]);
        }
      });
    return () => {
      active = false;
    };
  }, [characterSpells]);

  const cards = useMemo<Card[]>(() => {
    const spells = (spellDetails ?? []).filter((spell) => spellIds.has(spell.id));
    return [
      ...spells.map<Card>((spell) => ({ kind: "spell", key: `s${spell.id}`, spell })),
      ...features
        .filter((feature) => featureIds.has(feature.key))
        .map<Card>((feature) => ({ kind: "feature", key: `f${feature.key}`, feature })),
    ];
  }, [spellDetails, spellIds, features, featureIds]);

  const toggle = <K extends number | string>(
    setter: React.Dispatch<React.SetStateAction<Set<K>>>,
    id: K,
    checked: boolean,
  ) =>
    setter((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <>
      <dialog
        ref={ref}
        className="spell-modal print-modal"
        aria-labelledby="print-modal-title"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <h2 id="print-modal-title">Print cards</h2>
        <div className="print-modal-body">
          <div className="print-select">
            <fieldset>
              <legend>Spells</legend>
              <div className="print-select-actions">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setSpellIds(new Set(characterSpells.map((s) => s.spellId)))}
                >
                  All
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setSpellIds(new Set())}
                >
                  None
                </button>
              </div>
              {characterSpells.length === 0 ? <p className="empty-copy">No spells.</p> : null}
              {characterSpells.map((spell) => (
                <label className="class-pick" key={spell.spellId}>
                  <input
                    checked={spellIds.has(spell.spellId)}
                    onChange={(event) => toggle(setSpellIds, spell.spellId, event.target.checked)}
                    type="checkbox"
                  />
                  <span>{spell.name}</span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Features / Traits</legend>
              <div className="print-select-actions">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setFeatureIds(new Set(features.map((f) => f.key)))}
                >
                  All
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setFeatureIds(new Set())}
                >
                  None
                </button>
              </div>
              {features.length === 0 ? <p className="empty-copy">No features.</p> : null}
              {features.map((feature) => (
                <label className="class-pick" key={feature.key}>
                  <input
                    checked={featureIds.has(feature.key)}
                    onChange={(event) => toggle(setFeatureIds, feature.key, event.target.checked)}
                    type="checkbox"
                  />
                  <span>{feature.name}</span>
                </label>
              ))}
            </fieldset>
          </div>
          <div className="print-preview" aria-label="Cards preview">
            {error ? <p role="alert">{error}</p> : null}
            {spellDetails === null ? <p>Loading spells...</p> : null}
            {cards.length > 0 ? (
              <CardGrid cards={cards} />
            ) : spellDetails !== null ? (
              <p className="empty-copy">Select something to preview.</p>
            ) : null}
          </div>
        </div>
        <div className="confirm-actions">
          <button className="button" onClick={onClose} type="button">
            Close
          </button>
          <button
            className="button button-primary"
            disabled={cards.length === 0}
            onClick={() => window.print()}
            type="button"
          >
            Print {cards.length} {cards.length === 1 ? "card" : "cards"}
          </button>
        </div>
      </dialog>
      {createPortal(
        <div className="print-sheet">
          <CardGrid cards={cards} />
        </div>,
        document.body,
      )}
    </>
  );
}

export default PrintCardsModal;
