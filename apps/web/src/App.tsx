import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type Character = {
  id: number;
  name: string;
  level: number;
  speciesId: number;
  backgroundId: number;
  classId: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  createdAt: string;
};

type NamedOption = {
  id: number;
  name: string;
};

type SpeciesOption = NamedOption & {
  traits: { id: number; name: string; description: string }[];
  choiceGroups: {
    id: number;
    name: string;
    description: string;
    choiceCount: number;
    options: {
      id: number;
      name: string;
      description: string;
      features: { id: number; name: string; description: string }[];
    }[];
  }[];
};

type DashboardData = {
  characters: Character[];
  species: SpeciesOption[];
  backgrounds: NamedOption[];
  classes: NamedOption[];
};

type Page = { name: "dashboard" } | { name: "create" } | { name: "detail"; characterId: number };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

function fetchDashboardData(): Promise<DashboardData> {
  return Promise.all([
    request<Character[]>("/characters"),
    request<SpeciesOption[]>("/species"),
    request<NamedOption[]>("/backgrounds"),
    request<NamedOption[]>("/classes"),
  ]).then(([characters, species, backgrounds, classes]) => ({
    characters,
    species,
    backgrounds,
    classes,
  }));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body: unknown = await response.json();
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [page, setPage] = useState<Page>({ name: "dashboard" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await fetchDashboardData());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDashboardData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const onCharacterCreated = (character: Character) => {
    setData((current) =>
      current ? { ...current, characters: [...current.characters, character] } : current,
    );
    setPage({ name: "detail", characterId: character.id });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => setPage({ name: "dashboard" })}
          aria-label="Scroll Smith home"
        >
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>Scroll Smith</span>
        </button>
        <span className="topbar-note">Your characters, ready for adventure</span>
      </header>

      <main className="main-content">
        {loading && !data ? (
          <section className="message-panel" aria-live="polite">
            <span className="loading-mark" aria-hidden="true" />
            <h1>Gathering your adventurers</h1>
            <p>One moment while we open the ledger.</p>
          </section>
        ) : loadError && !data ? (
          <section className="message-panel" role="alert">
            <p className="eyebrow">The ledger is unavailable</p>
            <h1>We couldn&apos;t load your characters.</h1>
            <p>{loadError}</p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => void loadDashboard()}
            >
              Try again
            </button>
          </section>
        ) : data ? (
          page.name === "dashboard" ? (
            <Dashboard
              data={data}
              onCreate={() => setPage({ name: "create" })}
              onSelect={(characterId) => setPage({ name: "detail", characterId })}
            />
          ) : page.name === "create" ? (
            <CharacterCreation
              data={data}
              onCancel={() => setPage({ name: "dashboard" })}
              onCreated={onCharacterCreated}
            />
          ) : (
            <CharacterDetail
              data={data}
              characterId={page.characterId}
              onBack={() => setPage({ name: "dashboard" })}
            />
          )
        ) : null}
      </main>

      <footer className="footer">
        <span>Made for the next great story.</span>
        {loading && data ? <span className="refreshing">Refreshing your ledger...</span> : null}
      </footer>
    </div>
  );
}

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

function CharacterCreation({
  data,
  onCancel,
  onCreated,
}: {
  data: DashboardData;
  onCancel: () => void;
  onCreated: (character: Character) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [speciesSelections, setSpeciesSelections] = useState<Record<number, number[]>>({});
  const [backgroundId, setBackgroundId] = useState("");
  const [classId, setClassId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedSpecies = data.species.find((species) => String(species.id) === speciesId);

  const submitStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 2) {
      if (!selectedSpecies) {
        setError("Choose a species to continue.");
        return;
      }

      const incompleteGroup = selectedSpecies.choiceGroups.find(
        (group) => (speciesSelections[group.id] ?? []).length !== group.choiceCount,
      );
      if (incompleteGroup) {
        setError(
          `${incompleteGroup.name}: choose exactly ${incompleteGroup.choiceCount} ${
            incompleteGroup.choiceCount === 1 ? "option" : "options"
          } to continue.`,
        );
        return;
      }
    }

    if (step < 4) {
      setStep((current) => current + 1);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const character = await request<Character>("/characters", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          speciesId: Number(speciesId),
          backgroundId: Number(backgroundId),
          classId: Number(classId),
          speciesChoices:
            selectedSpecies?.choiceGroups.flatMap((group) =>
              (speciesSelections[group.id] ?? []).map((choiceOptionId) => ({
                choiceGroupId: group.id,
                choiceOptionId,
              })),
            ) ?? [],
        }),
      });
      onCreated(character);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flow-page">
      <button className="text-button back-button" type="button" onClick={onCancel}>
        <span aria-hidden="true">←</span> Back to characters
      </button>

      <div className="flow-heading">
        <p className="eyebrow">A new adventure</p>
        <h1>Create a character</h1>
        <p>Choose the foundations of your hero. You can build on them as you play.</p>
      </div>

      <div className="stepper" aria-label={`Step ${step} of 4`}>
        {["Name", "Species", "Background", "Class"].map((label, index) => {
          const number = index + 1;
          return (
            <div className={`step ${number <= step ? "step-active" : ""}`} key={label}>
              <span className="step-number">{number < step ? "✓" : number}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <form className="form-panel" onSubmit={(event) => void submitStep(event)}>
        {step === 1 ? (
          <div className="form-step">
            <p className="step-kicker">Step 1 of 4</p>
            <h2>Who are they?</h2>
            <p className="form-intro">Start by giving your hero a name.</p>
            <label className="field">
              <span>Character name</span>
              <input
                autoFocus
                maxLength={100}
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Aria Moonwhisper"
                required
                value={name}
              />
            </label>
          </div>
        ) : step === 2 ? (
          <div className="form-step species-step">
            <p className="step-kicker">Step 2 of 4</p>
            <h2>Choose your species</h2>
            <p className="form-intro">
              Explore each species&apos; traits and distinctive choices before deciding who your
              hero is.
            </p>
            <fieldset className="species-options">
              <legend className="species-legend">Available species</legend>
              <div className="species-grid">
                {data.species.map((species) => (
                  <label
                    className={`species-card ${speciesId === String(species.id) ? "species-card-selected" : ""}`}
                    key={species.id}
                  >
                    <input
                      checked={speciesId === String(species.id)}
                      aria-label={species.name}
                      name="species"
                      onChange={(event) => {
                        setSpeciesId(event.target.value);
                        setSpeciesSelections({});
                        setError(null);
                      }}
                      required
                      type="radio"
                      value={species.id}
                    />
                    <span className="species-card-content">
                      <strong className="species-card-name">{species.name}</strong>
                      <span className="species-card-summary">
                        {species.traits.length} {species.traits.length === 1 ? "trait" : "traits"}
                        {species.choiceGroups.length > 0
                          ? ` · ${species.choiceGroups.length} ${species.choiceGroups.length === 1 ? "choice" : "choices"}`
                          : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {selectedSpecies ? (
                <section
                  className="species-overview"
                  aria-live="polite"
                  aria-labelledby="species-overview-title"
                >
                  <p className="eyebrow">Species overview</p>
                  <h3 id="species-overview-title">{selectedSpecies.name}</h3>
                  <p className="species-overview-intro">
                    Review the traits and choices that come with this species.
                  </p>
                  <div className="species-overview-sections">
                    <div className="species-overview-section">
                      <h4>Traits</h4>
                      {selectedSpecies.traits.length > 0 ? (
                        <ul className="species-trait-list">
                          {selectedSpecies.traits.map((trait) => (
                            <li className="species-trait" key={trait.id}>
                              <strong>{trait.name}</strong>
                              <span>{trait.description}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="species-empty">No additional traits listed.</p>
                      )}
                    </div>
                    {selectedSpecies.choiceGroups.map((group) => (
                      <div className="species-overview-section" key={group.id}>
                        <fieldset className="species-choice-group">
                          <legend className="species-choice-legend">
                            {group.name} · choose {group.choiceCount}
                          </legend>
                          <p className="species-group-description">{group.description}</p>
                          <ul className="species-choice-list">
                            {group.options.map((option) => {
                              const selectedOptions = speciesSelections[group.id] ?? [];
                              const checked = selectedOptions.includes(option.id);
                              const isMultiChoice = group.choiceCount > 1;

                              return (
                                <li className="species-choice-item" key={option.id}>
                                  <label className="species-choice-control">
                                    <input
                                      checked={checked}
                                      className="species-choice-input"
                                      name={`species-choice-${group.id}`}
                                      onChange={(event) => {
                                        setSpeciesSelections((current) => {
                                          const currentOptions = current[group.id] ?? [];
                                          const nextOptions = isMultiChoice
                                            ? event.target.checked
                                              ? currentOptions.length >= group.choiceCount
                                                ? currentOptions
                                                : [...currentOptions, option.id]
                                              : currentOptions.filter((id) => id !== option.id)
                                            : [option.id];
                                          return { ...current, [group.id]: nextOptions };
                                        });
                                        setError(null);
                                      }}
                                      type={isMultiChoice ? "checkbox" : "radio"}
                                    />
                                    <span className="species-choice-option">
                                      <strong>{option.name}</strong>
                                      <span>{option.description}</span>
                                    </span>
                                  </label>
                                  {option.features.map((feature) => (
                                    <span className="species-option-feature" key={feature.id}>
                                      <strong>{feature.name}</strong>
                                      <span>{feature.description}</span>
                                    </span>
                                  ))}
                                </li>
                              );
                            })}
                          </ul>
                          <p className="species-choice-status" aria-live="polite">
                            {speciesSelections[group.id]?.length ?? 0} of {group.choiceCount}{" "}
                            selected
                          </p>
                        </fieldset>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <p className="species-overview-prompt" aria-live="polite">
                  Choose a species to read its overview and traits.
                </p>
              )}
            </fieldset>
          </div>
        ) : step === 3 ? (
          <div className="form-step">
            <p className="step-kicker">Step 3 of 4</p>
            <h2>Where did they begin?</h2>
            <p className="form-intro">A background reflects the experiences that shaped them.</p>
            <label className="field">
              <span>Background</span>
              <select
                autoFocus
                name="background"
                onChange={(event) => setBackgroundId(event.target.value)}
                required
                value={backgroundId}
              >
                <option value="">Choose a background</option>
                {data.backgrounds.map((background) => (
                  <option value={background.id} key={background.id}>
                    {background.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="form-step">
            <p className="step-kicker">Step 4 of 4</p>
            <h2>What is their calling?</h2>
            <p className="form-intro">Choose the class that guides their adventures.</p>
            <label className="field">
              <span>Class</span>
              <select
                autoFocus
                name="class"
                onChange={(event) => setClassId(event.target.value)}
                required
                value={classId}
              >
                <option value="">Choose a class</option>
                {data.classes.map((characterClass) => (
                  <option value={characterClass.id} key={characterClass.id}>
                    {characterClass.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="creation-summary">
              <span className="summary-avatar" aria-hidden="true">
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <span>
                <strong>{name.trim()}</strong>
                <span className="summary-meta">
                  {optionName(data.species, Number(speciesId))} ·{" "}
                  {optionName(data.backgrounds, Number(backgroundId))}
                </span>
              </span>
            </div>
          </div>
        )}

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-actions">
          {step > 1 ? (
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setStep((current) => current - 1);
                setError(null);
              }}
            >
              Back
            </button>
          ) : (
            <button className="button button-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Creating..." : step === 4 ? "Create character" : "Continue"}
            {!saving && step < 4 ? <span aria-hidden="true">→</span> : null}
          </button>
        </div>
      </form>
    </section>
  );
}

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
      </div>
    </section>
  );
}

function optionName(options: NamedOption[], id: number): string {
  return options.find((option) => option.id === id)?.name ?? "Unknown";
}

export default App;
