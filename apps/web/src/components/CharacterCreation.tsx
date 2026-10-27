import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Character,
  ClassChoicesInput,
  ClassDetail,
  DashboardData,
  SpellOption,
} from "../core/types";
import ClassStep, {
  buildClassChoices,
  emptyClassSelection,
  validateClassSelection,
} from "./ClassStep";
import type { ClassSelection } from "./ClassStep";
import { optionName } from "./option-name";

export type CharacterCreationInput = {
  name: string;
  speciesId: number;
  backgroundId: number;
  classId: number;
  speciesChoices: { choiceGroupId: number; choiceOptionId: number }[];
  classChoices: ClassChoicesInput;
  backgroundChoices?: {
    abilityIncreases: { mode: "split"; plusTwo: string; plusOne: string } | { mode: "even" };
    equipment: "package" | "gold";
    toolChoice?: string;
  };
};

const gamingSets = ["Dice Set", "Dragonchess Set", "Playing Card Set", "Three-Dragon Ante Set"];

function CharacterCreation({
  data,
  onCancel,
  onCreate,
  loadClass,
  loadSpells,
}: {
  data: DashboardData;
  onCancel: () => void;
  onCreate: (input: CharacterCreationInput) => Promise<Character>;
  loadClass: (id: number) => Promise<ClassDetail>;
  loadSpells: (classId: number) => Promise<SpellOption[]>;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [speciesSelections, setSpeciesSelections] = useState<Record<number, number[]>>({});
  const [backgroundId, setBackgroundId] = useState("");
  const [classSelection, setClassSelection] = useState<ClassSelection>(emptyClassSelection);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abilityMode, setAbilityMode] = useState<"split" | "even">("split");
  const [plusTwo, setPlusTwo] = useState("");
  const [plusOne, setPlusOne] = useState("");
  const [gamingSet, setGamingSet] = useState("");
  const [equipment, setEquipment] = useState<"package" | "gold">("package");
  const selectedSpecies = data.species.find((species) => String(species.id) === speciesId);
  const selectedBackground = data.backgrounds.find(
    (background) => String(background.id) === backgroundId,
  );
  const props = selectedBackground?.properties ?? null;
  const backgroundSkills = props?.skillProficiencies ?? [];

  const submitStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 4) {
      const classError = validateClassSelection(classDetail, classSelection, backgroundSkills);
      if (classError || !classDetail) {
        setError(classError ?? "Choose a class to continue.");
        return;
      }
    }
    if (step === 3) {
      if (!selectedBackground) {
        setError("Choose a background to continue.");
        return;
      }
      if (props) {
        if (abilityMode === "split" && (!plusTwo || !plusOne || plusTwo === plusOne)) {
          setError("Choose two different abilities for the +2 and +1 increases.");
          return;
        }
        if (props.toolProficiency.type === "choice" && !gamingSet) {
          setError(`Choose a ${props.toolProficiency.category} to continue.`);
          return;
        }
      }
    }
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
        classId: Number(classSelection.classId),
        classChoices: buildClassChoices(classDetail!, classSelection),
        ...(props
          ? {
              backgroundChoices: {
                abilityIncreases:
                  abilityMode === "split"
                    ? { mode: "split" as const, plusTwo, plusOne }
                    : { mode: "even" as const },
                equipment,
                ...(props.toolProficiency.type === "choice" ? { toolChoice: gamingSet } : {}),
              },
            }
          : {}),
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
            <fieldset className="species-options">
              <legend className="species-legend">Available backgrounds</legend>
              <div className="species-grid">
                {data.backgrounds.map((background) => (
                  <label
                    className={`species-card ${backgroundId === String(background.id) ? "species-card-selected" : ""}`}
                    key={background.id}
                  >
                    <input
                      aria-label={background.name}
                      checked={backgroundId === String(background.id)}
                      name="background"
                      onChange={(event) => {
                        setBackgroundId(event.target.value);
                        setAbilityMode("split");
                        setPlusTwo("");
                        setPlusOne("");
                        setGamingSet("");
                        setEquipment("package");
                        setError(null);
                      }}
                      required
                      type="radio"
                      value={background.id}
                    />
                    <span className="species-card-content">
                      <strong className="species-card-name">{background.name}</strong>
                      {background.properties ? (
                        <span className="species-card-summary">
                          {background.properties.feat} ·{" "}
                          {background.properties.skillProficiencies.join(", ")}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
              {selectedBackground ? (
                <section
                  className="species-overview"
                  aria-live="polite"
                  aria-labelledby="background-overview-title"
                >
                  <p className="eyebrow">Background overview</p>
                  <h3 id="background-overview-title">{selectedBackground.name}</h3>
                  <p className="species-overview-intro">{selectedBackground.description}</p>
                  {props ? (
                    <div className="species-overview-sections">
                      <div className="species-overview-section">
                        <h4>Origin feat</h4>
                        <p className="species-empty">{props.feat}</p>
                        <h4>Skill proficiencies</h4>
                        <p className="species-empty">{props.skillProficiencies.join(", ")}</p>
                        <h4>Tool proficiency</h4>
                        {props.toolProficiency.type === "specific" ? (
                          <p className="species-empty">{props.toolProficiency.name}</p>
                        ) : (
                          <label className="field">
                            <span>Choose one {props.toolProficiency.category}</span>
                            <select
                              name="gaming-set"
                              onChange={(event) => setGamingSet(event.target.value)}
                              value={gamingSet}
                            >
                              <option value="">Choose a set</option>
                              {gamingSets.map((set) => (
                                <option key={set} value={set}>
                                  {set}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                      <div className="species-overview-section">
                        <h4>Ability score increases</h4>
                        <div className="background-ability-mode" role="radiogroup">
                          <label>
                            <input
                              checked={abilityMode === "split"}
                              name="ability-mode"
                              onChange={() => setAbilityMode("split")}
                              type="radio"
                            />{" "}
                            +2 and +1
                          </label>
                          <label>
                            <input
                              checked={abilityMode === "even"}
                              name="ability-mode"
                              onChange={() => setAbilityMode("even")}
                              type="radio"
                            />{" "}
                            +1 to all three
                          </label>
                        </div>
                        {abilityMode === "split" ? (
                          <div className="background-ability-split">
                            <label className="field">
                              <span>+2 to</span>
                              <select
                                name="ability-plus-two"
                                onChange={(event) => setPlusTwo(event.target.value)}
                                value={plusTwo}
                              >
                                <option value="">Choose an ability</option>
                                {props.abilityScores.map((ability) => (
                                  <option key={ability} value={ability}>
                                    {ability}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="field">
                              <span>+1 to</span>
                              <select
                                name="ability-plus-one"
                                onChange={(event) => setPlusOne(event.target.value)}
                                value={plusOne}
                              >
                                <option value="">Choose an ability</option>
                                {props.abilityScores.map((ability) => (
                                  <option key={ability} value={ability}>
                                    {ability}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        ) : (
                          <p className="species-empty">{props.abilityScores.join(", ")}</p>
                        )}
                        <p className="species-empty">No score can rise above 20.</p>
                        <h4>Equipment</h4>
                        <div className="background-ability-mode" role="radiogroup">
                          <label>
                            <input
                              checked={equipment === "package"}
                              name="background-equipment"
                              onChange={() => setEquipment("package")}
                              type="radio"
                            />{" "}
                            <strong>Option A:</strong>{" "}
                            {[
                              ...props.equipment.package.items.map((entry) =>
                                entry.quantity > 1 ? `${entry.quantity} ${entry.item}` : entry.item,
                              ),
                              `${props.equipment.package.gold} GP`,
                            ].join(", ")}
                          </label>
                          <label>
                            <input
                              checked={equipment === "gold"}
                              name="background-equipment"
                              onChange={() => setEquipment("gold")}
                              type="radio"
                            />{" "}
                            <strong>Option B:</strong> {props.equipment.alternative.amount}{" "}
                            {props.equipment.alternative.currency}
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : (
                <p className="species-overview-prompt" aria-live="polite">
                  Choose a background to read its details.
                </p>
              )}
            </fieldset>
          </div>
        ) : (
          <div className="form-step">
            <p className="step-kicker">Step 4 of 4</p>
            <h2>What is their calling?</h2>
            <p className="form-intro">Choose the class that guides their adventures.</p>
            <ClassStep
              backgroundSkills={backgroundSkills}
              classes={data.classes}
              loadClass={loadClass}
              loadSpells={loadSpells}
              onChange={(next) => {
                setClassSelection(next);
                setError(null);
              }}
              onDetail={setClassDetail}
              selection={classSelection}
            />
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
