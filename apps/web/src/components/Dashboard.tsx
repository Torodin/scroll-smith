import type { DashboardData } from "../core/types";
import { optionName } from "./option-name";

function Dashboard({
  data,
  onCreate,
  onSelect,
}: {
  data: DashboardData;
  onCreate: () => void;
  onSelect: (characterId: number) => void;
}) {
  return (
    <section className="dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Character vault</p>
          <h1>Your adventurers</h1>
          <p className="heading-copy">Keep your party close and your next adventure closer.</p>
        </div>
        <button className="button button-primary create-button" type="button" onClick={onCreate}>
          <span aria-hidden="true">+</span>
          Create character
        </button>
      </div>

      <div className="collection-heading">
        <h2>Characters</h2>
        <span className="count-pill">{data.characters.length}</span>
      </div>

      {data.characters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-crest" aria-hidden="true">
            ✦
          </div>
          <h2>Your story starts here</h2>
          <p>Create your first character and bring a new hero to life.</p>
          <button className="button button-primary" type="button" onClick={onCreate}>
            Create your first character
          </button>
        </div>
      ) : (
        <div className="character-grid">
          {data.characters.map((character) => (
            <button
              className="character-card"
              type="button"
              key={character.id}
              onClick={() => onSelect(character.id)}
              aria-label={`View ${character.name}, level ${character.level} ${optionName(data.classes, character.classId)}`}
            >
              <span className="character-card-top">
                <span className="character-avatar" aria-hidden="true">
                  {character.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="level-pill">Level {character.level}</span>
              </span>
              <span className="character-name">{character.name}</span>
              <span className="character-class">{optionName(data.classes, character.classId)}</span>
              <span className="character-meta">
                {optionName(data.species, character.speciesId)}
                <span aria-hidden="true">·</span>
                {optionName(data.backgrounds, character.backgroundId)}
              </span>
              <span className="card-link">
                View character <span aria-hidden="true">→</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default Dashboard;
