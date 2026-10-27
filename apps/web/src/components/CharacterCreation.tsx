import { useState } from "react";
import type { FormEvent } from "react";
import type { Character, DashboardData } from "../core/types";
import { optionName } from "./option-name";

export type CharacterCreationInput = {
  name: string;
  speciesId: number;
  backgroundId: number;
  classId: number;
  speciesChoices: { choiceGroupId: number; choiceOptionId: number }[];
};

function CharacterCreation({
  data,
  onCancel,
  onCreate,
}: {
  data: DashboardData;
  onCancel: () => void;
  onCreate: (input: CharacterCreationInput) => Promise<Character>;
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
      await onCreate({
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
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
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

export default CharacterCreation;
