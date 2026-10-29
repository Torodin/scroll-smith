import { useEffect, useMemo, useState } from "react";
import type { ClassDetail, DashboardData, SpellOption } from "../../core/types";
import DeleteCharacterDialog from "../DeleteCharacterDialog";
import PrintCardsModal from "../PrintCardsModal/PrintCardsModal";
import { optionName } from "../option-name";
import "./CharacterDetail.css";

function CharacterDetail({
  data,
  characterId,
  onBack,
  onDelete,
  loadClass,
  loadSpells,
}: {
  data: DashboardData;
  characterId: number;
  onBack: () => void;
  onDelete: (characterId: number) => Promise<void>;
  loadClass: (classId: number) => Promise<ClassDetail>;
  loadSpells: (classId: number) => Promise<SpellOption[]>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [classLoadError, setClassLoadError] = useState<string | null>(null);
  const character = data.characters.find((item) => item.id === characterId);
  const classId = character?.classId;

  useEffect(() => {
    if (classId === undefined) return;
    let active = true;
    setClassDetail(null);
    setClassLoadError(null);
    void loadClass(classId)
      .then((result) => {
        if (active) setClassDetail(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setClassLoadError(
            error instanceof Error ? error.message : "Could not load class features.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [classId, loadClass]);

  const classFeatures = useMemo(
    () =>
      character
        ? (classDetail?.features.filter((feature) => feature.level <= character.level) ?? [])
        : [],
    [character, classDetail],
  );
  const speciesTraits = useMemo(() => {
    if (!character) return [];
    const species = data.species.find((item) => item.id === character.speciesId);
    if (!species) return [];
    const selectedTraits = character.speciesChoices.flatMap((choice) => {
      const group = species.choiceGroups.find((item) => item.id === choice.choiceGroupId);
      return group?.options.find((item) => item.id === choice.choiceOptionId)?.features ?? [];
    });
    return [...species.traits, ...selectedTraits].filter(
      (trait, index, traits) => traits.findIndex((item) => item.id === trait.id) === index,
    );
  }, [character, data.species]);

  const printFeatures = useMemo(() => {
    if (!character) return [];
    const className = optionName(data.classes, character.classId);
    const speciesName = optionName(data.species, character.speciesId);
    return [
      ...classFeatures.map((feature) => ({
        key: `c${feature.id}`,
        name: feature.name,
        description: feature.description,
        source: className,
      })),
      ...speciesTraits.map((trait) => ({
        key: `t${trait.id}`,
        name: trait.name,
        description: trait.description,
        source: speciesName,
      })),
    ];
  }, [character, classFeatures, speciesTraits, data.classes, data.species]);

  const tabs = ["inventory", "spells", "features", "background"] as const;

  if (!character) {
    return (
      <section className="message-panel" role="alert">
        <p className="eyebrow">Character not found</p>
        <h1>This page has lost its way.</h1>
        <button className="button button-primary" type="button" onClick={onBack}>
          Back to characters
        </button>
      </section>
    );
  }

  const abilities = [
    ["Strength", character.str],
    ["Dexterity", character.dex],
    ["Constitution", character.con],
    ["Intelligence", character.int],
    ["Wisdom", character.wis],
    ["Charisma", character.cha],
  ];
  const background = data.backgrounds.find((item) => item.id === character.backgroundId);

  return (
    <section className="detail-page">
      <button className="text-button back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to characters
      </button>

      <div className="detail-hero">
        <div className="detail-avatar" aria-hidden="true">
          {character.name.trim().charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{character.name}</h1>
          <p className="detail-subtitle">
            Level {character.level} {optionName(data.classes, character.classId)}
          </p>
          <p className="detail-subtitle">
            {optionName(data.species, character.speciesId)}
            {" - "}
            {optionName(data.backgrounds, character.backgroundId)}
          </p>
        </div>
        <button className="button button-primary" type="button" onClick={() => setPrinting(true)}>
          Print cards
        </button>
        <button className="button button-danger" type="button" onClick={() => setConfirming(true)}>
          Delete character
        </button>
      </div>
      {printing ? (
        <PrintCardsModal
          characterSpells={character.spells}
          features={printFeatures}
          loadSpells={() => loadSpells(character.classId)}
          onClose={() => setPrinting(false)}
        />
      ) : null}
      {confirming ? (
        <DeleteCharacterDialog
          name={character.name}
          onCancel={() => setConfirming(false)}
          onConfirm={() => onDelete(character.id)}
        />
      ) : null}

      <div className="detail-grid">
        <section className="detail-panel detail-panel-wide">
          <p className="eyebrow">Ability scores</p>
          <h2>Core abilities</h2>
          <div className="ability-grid">
            {abilities.map(([ability, score]) => (
              <div className="ability-card" key={ability}>
                <span>{ability}</span>
                <strong>{score}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-panel detail-panel-wide detail-tabs-panel">
          <div className="detail-tabs" role="tablist" aria-label="Character details">
            {tabs.map((tab) => (
              <button
                className={`detail-tab${activeTab === tab ? " detail-tab-active" : ""}`}
                id={`character-tab-${tab}`}
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`character-panel-${tab}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "features" ? "Features / Traits" : tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div
            className="detail-tab-panel"
            id={`character-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`character-tab-${activeTab}`}
            tabIndex={0}
          >
            {activeTab === "inventory" ? (
              <>
                <p className="eyebrow">Equipment</p>
                <h2>{character.gold} GP</h2>
                {character.inventory.length > 0 ? (
                  <ul className="detail-list">
                    {character.inventory.map((entry) => (
                      <li key={entry.itemId}>
                        {entry.quantity > 1 ? `${entry.quantity} × ` : ""}
                        {entry.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-copy">No items.</p>
                )}
              </>
            ) : null}

            {activeTab === "spells" ? (
              <>
                <p className="eyebrow">Spellbook</p>
                <h2>Known spells</h2>
                {character.spells.length > 0 ? (
                  <ul className="detail-list">
                    {character.spells.map((spell) => (
                      <li key={spell.spellId}>
                        {spell.name} · {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                        {spell.level > 0 && !spell.prepared ? " · in spellbook" : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-copy">No spells known.</p>
                )}
              </>
            ) : null}

            {activeTab === "features" ? (
              <>
                <p className="eyebrow">Abilities</p>
                <h2>Features and traits</h2>
                {classLoadError ? <p className="empty-copy">{classLoadError}</p> : null}
                <div className="feature-groups">
                  <div>
                    <h3>{optionName(data.classes, character.classId)} features</h3>
                    {classFeatures.length > 0 ? (
                      <ul className="feature-list">
                        {classFeatures.map((feature) => (
                          <li key={feature.id}>
                            <strong>{feature.name}</strong>
                            <span>{feature.description}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-copy">Class features are unavailable.</p>
                    )}
                  </div>
                  <div>
                    <h3>{optionName(data.species, character.speciesId)} traits</h3>
                    {speciesTraits.length > 0 ? (
                      <ul className="feature-list">
                        {speciesTraits.map((trait) => (
                          <li key={trait.id}>
                            <strong>{trait.name}</strong>
                            <span>{trait.description}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-copy">No species traits recorded.</p>
                    )}
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "background" ? (
              <>
                <p className="eyebrow">Origin</p>
                <h2>{optionName(data.backgrounds, character.backgroundId)}</h2>
                <p className="background-description">
                  {background?.description ?? "No description available."}
                </p>
                <dl className="profile-list">
                  <div>
                    <dt>Origin feat</dt>
                    <dd>{character.feats.join(", ") || "None"}</dd>
                  </div>
                  <div>
                    <dt>Skills</dt>
                    <dd>{character.skillProficiencies.join(", ") || "None"}</dd>
                  </div>
                  <div>
                    <dt>Tools</dt>
                    <dd>{character.toolProficiencies.join(", ") || "None"}</dd>
                  </div>
                </dl>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}

export default CharacterDetail;
