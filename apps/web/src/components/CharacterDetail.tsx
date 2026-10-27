import type { DashboardData } from "../core/types";
import { optionName } from "./option-name";

function CharacterDetail({
  data,
  characterId,
  onBack,
}: {
  data: DashboardData;
  characterId: number;
  onBack: () => void;
}) {
  const character = data.characters.find((item) => item.id === characterId);

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
          <p className="eyebrow">Character sheet</p>
          <h1>{character.name}</h1>
          <p className="detail-subtitle">
            Level {character.level} {optionName(data.classes, character.classId)}
          </p>
        </div>
        <span className="level-pill detail-level">Level {character.level}</span>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <p className="eyebrow">Origins</p>
          <h2>Adventurer profile</h2>
          <dl className="profile-list">
            <div>
              <dt>Species</dt>
              <dd>{optionName(data.species, character.speciesId)}</dd>
            </div>
            <div>
              <dt>Background</dt>
              <dd>{optionName(data.backgrounds, character.backgroundId)}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd>{optionName(data.classes, character.classId)}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{character.level}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-panel">
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

        <section className="detail-panel">
          <p className="eyebrow">Background benefits</p>
          <h2>Proficiencies and feats</h2>
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
        </section>

        <section className="detail-panel">
          <p className="eyebrow">Equipment</p>
          <h2>{character.gold} GP</h2>
          {character.inventory.length > 0 ? (
            <ul className="species-empty">
              {character.inventory.map((entry) => (
                <li key={entry.itemId}>
                  {entry.quantity > 1 ? `${entry.quantity} × ` : ""}
                  {entry.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="species-empty">No items.</p>
          )}
        </section>
      </div>
    </section>
  );
}

export default CharacterDetail;
