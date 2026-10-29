import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AbilityName, Character, ClassDetail, LevelUpInput, SpellOption } from "../core/types";
import { getLevelUpRequirements } from "../core/calculations";
import { PickList, weaponOptions } from "./ClassStep";

const abilityNames: AbilityName[] = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];
const abilityKeys = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
} as const;

type AbilityMode = "split" | "spread" | "feat";

function LevelUp({
  character,
  className,
  loadClass,
  loadSpells,
  onCancel,
  onLevelUp,
}: {
  character: Character;
  className: string;
  loadClass: (classId: number) => Promise<ClassDetail>;
  loadSpells: (classId: number) => Promise<SpellOption[]>;
  onCancel: () => void;
  onLevelUp: (input: LevelUpInput) => Promise<void>;
}) {
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [spells, setSpells] = useState<SpellOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subclassId, setSubclassId] = useState("");
  const [abilityMode, setAbilityMode] = useState<AbilityMode>("split");
  const [plusTwo, setPlusTwo] = useState<AbilityName | "">("");
  const [first, setFirst] = useState<AbilityName | "">("");
  const [second, setSecond] = useState<AbilityName | "">("");
  const [feat, setFeat] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [weaponMasteries, setWeaponMasteries] = useState<string[]>([]);
  const [featureChoices, setFeatureChoices] = useState<Record<number, number>>({});
  const [cantrips, setCantrips] = useState<string[]>([]);
  const [spellbook, setSpellbook] = useState<string[]>([]);
  const [prepared, setPrepared] = useState<string[]>([]);

  const classId = character.classId;
  useEffect(() => {
    let active = true;
    void loadClass(classId)
      .then(async (result) => {
        const classSpells = result.spellcastingAbility ? await loadSpells(classId) : [];
        if (!active) return;
        setDetail(result);
        setSpells(classSpells);
      })
      .catch((loadFailure: unknown) => {
        if (active) {
          setLoadError(
            loadFailure instanceof Error ? loadFailure.message : "Could not load class details.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [classId, loadClass, loadSpells]);

  const requirements = useMemo(
    () => (detail ? getLevelUpRequirements(character, detail) : null),
    [character, detail],
  );

  if (loadError || !detail || !requirements) {
    return (
      <section className="flow-page">
        <button className="text-button back-button" type="button" onClick={onCancel}>
          <span aria-hidden="true">←</span> Back to character
        </button>
        {loadError ? (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        ) : (
          <p className="species-overview-prompt" aria-live="polite">
            Loading class details...
          </p>
        )}
      </section>
    );
  }

  const extraCantrips = requirements.choiceGroups.reduce((total, group) => {
    const option = group.options.find((item) => item.id === featureChoices[group.id]);
    return total + (option?.extraCantrips ?? 0);
  }, 0);
  const cantripGain = requirements.cantrips + extraCantrips;
  const hasSpells = cantripGain + requirements.prepared + requirements.spellbook > 0;
  const hasChoices =
    requirements.expertise > 0 ||
    requirements.weaponMasteries > 0 ||
    requirements.choiceGroups.length > 0;

  const steps = [
    "Features",
    ...(requirements.needsSubclass ? ["Subclass"] : []),
    ...(requirements.abilityIncrease ? ["Abilities"] : []),
    ...(hasChoices ? ["Choices"] : []),
    ...(hasSpells ? ["Spells"] : []),
    "Review",
  ];
  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  const knownIds = new Set(character.spells.map((spell) => spell.spellId));
  const preparedIds = new Set(
    character.spells.filter((spell) => spell.prepared).map((spell) => spell.spellId),
  );
  const toIds = (picked: string[]) =>
    picked.flatMap((name) => spells.find((spell) => spell.name === name)?.id ?? []);
  const spellOptions = (min: number, max: number) =>
    spells
      .filter((spell) => spell.level >= min && spell.level <= max && !knownIds.has(spell.id))
      .map((spell) => spell.name);
  const hasSpellbook = requirements.spellbook > 0;
  const cantripOptions = spellOptions(0, 0);
  const spellbookOptions = spellOptions(1, requirements.maxSpellLevel);
  const preparedOptions = hasSpellbook
    ? [
        ...character.spells
          .filter((spell) => spell.level > 0 && !preparedIds.has(spell.spellId))
          .map((spell) => spell.name),
        ...spellbook,
      ]
    : spellbookOptions;

  const expertiseOptions = [
    ...new Set([
      ...character.skillProficiencies,
      ...(character.classChoices?.tools ?? []),
      ...detail.toolProficiencies,
    ]),
  ].filter((entry) => !character.classChoices?.expertise.includes(entry));
  const masteryOptions = weaponOptions.filter(
    (weapon) => !character.classChoices?.weaponMasteries.includes(weapon),
  );
  const takesFeat = abilityMode === "feat" || requirements.abilityIncrease === "epic-boon";

  const validate = (): string | null => {
    if (current === "Subclass" && !subclassId) return "Choose a subclass to continue.";
    if (current === "Abilities") {
      if (takesFeat) {
        if (!feat.trim()) return "Enter the feat you want to take.";
      } else if (abilityMode === "split") {
        if (!plusTwo) return "Choose the ability to increase by 2.";
        if (character[abilityKeys[plusTwo]] + 2 > 20) return "Ability scores cannot exceed 20.";
      } else {
        if (!first || !second || first === second) {
          return "Choose two different abilities to increase by 1.";
        }
        if ([first, second].some((name) => character[abilityKeys[name]] + 1 > 20)) {
          return "Ability scores cannot exceed 20.";
        }
      }
    }
    if (current === "Choices") {
      if (expertise.length !== requirements.expertise) {
        return `Choose ${requirements.expertise} proficiencies for Expertise.`;
      }
      if (weaponMasteries.length !== requirements.weaponMasteries) {
        return `Choose ${requirements.weaponMasteries} weapons for Weapon Mastery.`;
      }
      const missing = requirements.choiceGroups.find(
        (group) => featureChoices[group.id] === undefined,
      );
      if (missing) return `Choose an option for ${missing.name}.`;
    }
    if (current === "Spells") {
      if (cantrips.length !== cantripGain) return `Choose ${cantripGain} cantrips.`;
      if (spellbook.length !== requirements.spellbook) {
        return `Choose ${requirements.spellbook} spellbook spells.`;
      }
      if (prepared.length !== requirements.prepared) {
        return `Choose ${requirements.prepared} prepared spells.`;
      }
    }
    return null;
  };

  const buildInput = (): LevelUpInput => ({
    ...(requirements.needsSubclass ? { subclassId: Number(subclassId) } : {}),
    ...(requirements.abilityIncrease
      ? {
          abilityIncrease: takesFeat
            ? { mode: "feat" as const, feat: feat.trim() }
            : abilityMode === "split"
              ? { mode: "split" as const, plusTwo: plusTwo as AbilityName }
              : {
                  mode: "spread" as const,
                  first: first as AbilityName,
                  second: second as AbilityName,
                },
        }
      : {}),
    expertise,
    weaponMasteries,
    cantrips: toIds(cantrips),
    spellbook: toIds(spellbook),
    preparedSpells: toIds(prepared),
    featureChoices: requirements.choiceGroups.map((group) => ({
      choiceGroupId: group.id,
      choiceOptionId: featureChoices[group.id]!,
    })),
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    if (!isLast) {
      setStep((value) => value + 1);
      return;
    }
    setSaving(true);
    try {
      await onLevelUp(buildInput());
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

  const abilitySelect = (
    label: string,
    value: AbilityName | "",
    onChange: (next: AbilityName | "") => void,
  ) => (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as AbilityName | "")}>
        <option value="">Choose an ability</option>
        {abilityNames.map((name) => (
          <option key={name} value={name}>
            {name} ({character[abilityKeys[name]]})
          </option>
        ))}
      </select>
    </label>
  );
  const subclass = detail.subclasses.find((item) => String(item.id) === subclassId);

  return (
    <section className="flow-page">
      <button className="text-button back-button" type="button" onClick={onCancel}>
        <span aria-hidden="true">←</span> Back to character
      </button>

      <div className="flow-heading">
        <p className="eyebrow">Level up</p>
        <h1>
          {character.name} reaches level {requirements.newLevel}
        </h1>
        <p>
          Make the choices for level {requirements.newLevel} of the {className}.
        </p>
      </div>

      <div className="stepper" aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((label, index) => (
          <div className={`step ${index <= step ? "step-active" : ""}`} key={label}>
            <span className="step-number">{index < step ? "✓" : index + 1}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <form className="form-panel" onSubmit={(event) => void submit(event)}>
        <div className="form-step">
          <p className="step-kicker">
            Step {step + 1} of {steps.length}
          </p>
          {current === "Features" ? (
            <>
              <h2>New features</h2>
              {requirements.features.length === 0 ? (
                <p className="form-intro">No new class features at this level.</p>
              ) : (
                <ul className="species-trait-list">
                  {requirements.features.map((feature) => (
                    <li className="species-trait" key={feature.id}>
                      <strong>{feature.name}</strong>
                      <span>{feature.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : current === "Subclass" ? (
            <>
              <h2>Choose your subclass</h2>
              <div className="species-grid">
                {detail.subclasses.map((item) => (
                  <label
                    className={`species-card ${subclassId === String(item.id) ? "species-card-selected" : ""}`}
                    key={item.id}
                  >
                    <input
                      aria-label={item.name}
                      checked={subclassId === String(item.id)}
                      name="subclass"
                      onChange={() => setSubclassId(String(item.id))}
                      type="radio"
                    />
                    <span className="species-card-content">
                      <strong className="species-card-name">{item.name}</strong>
                      <span className="species-card-summary">{item.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {subclass ? (
                <ul className="species-trait-list">
                  {subclass.features
                    .filter((feature) => feature.level <= requirements.newLevel)
                    .map((feature) => (
                      <li className="species-trait" key={feature.id}>
                        <strong>{feature.name}</strong>
                        <span>{feature.description}</span>
                      </li>
                    ))}
                </ul>
              ) : null}
            </>
          ) : current === "Abilities" ? (
            <>
              <h2>
                {requirements.abilityIncrease === "epic-boon"
                  ? "Choose an Epic Boon"
                  : "Ability Score Improvement"}
              </h2>
              {requirements.abilityIncrease === "improvement" ? (
                <fieldset className="species-choice-group">
                  <legend className="species-choice-legend">How do you improve?</legend>
                  {(
                    [
                      ["split", "Increase one ability by 2"],
                      ["spread", "Increase two abilities by 1"],
                      ["feat", "Take a feat"],
                    ] as const
                  ).map(([mode, label]) => (
                    <label className="species-choice-control" key={mode}>
                      <input
                        checked={abilityMode === mode}
                        name="ability-mode"
                        onChange={() => setAbilityMode(mode)}
                        type="radio"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>
              ) : null}
              {takesFeat ? (
                <label className="field">
                  <span>Feat name</span>
                  <input
                    maxLength={100}
                    onChange={(event) => setFeat(event.target.value)}
                    placeholder="e.g. Alert"
                    value={feat}
                  />
                </label>
              ) : abilityMode === "split" ? (
                abilitySelect("Ability (+2)", plusTwo, setPlusTwo)
              ) : (
                <>
                  {abilitySelect("First ability (+1)", first, setFirst)}
                  {abilitySelect("Second ability (+1)", second, setSecond)}
                </>
              )}
            </>
          ) : current === "Choices" ? (
            <>
              <h2>Your choices</h2>
              {requirements.expertise > 0 ? (
                <PickList
                  legend="Expertise"
                  options={expertiseOptions}
                  value={expertise}
                  count={requirements.expertise}
                  onChange={setExpertise}
                />
              ) : null}
              {requirements.weaponMasteries > 0 ? (
                <PickList
                  legend="Weapon Mastery"
                  options={masteryOptions}
                  value={weaponMasteries}
                  count={requirements.weaponMasteries}
                  onChange={setWeaponMasteries}
                />
              ) : null}
              {requirements.choiceGroups.map((group) => (
                <fieldset className="species-choice-group" key={group.id}>
                  <legend className="species-choice-legend">{group.name} · choose 1</legend>
                  <p className="species-group-description">{group.description}</p>
                  <ul className="species-choice-list">
                    {group.options.map((option) => (
                      <li className="species-choice-item" key={option.id}>
                        <label className="species-choice-control">
                          <input
                            checked={featureChoices[group.id] === option.id}
                            className="species-choice-input"
                            name={`level-choice-${group.id}`}
                            onChange={() =>
                              setFeatureChoices((value) => ({ ...value, [group.id]: option.id }))
                            }
                            type="radio"
                          />
                          <span className="species-choice-option">
                            <strong>{option.name}</strong>
                            <span>{option.description}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              ))}
            </>
          ) : current === "Spells" ? (
            <>
              <h2>New spells</h2>
              {cantripGain > 0 ? (
                <PickList
                  legend="Cantrips"
                  options={cantripOptions}
                  value={cantrips}
                  count={cantripGain}
                  onChange={setCantrips}
                />
              ) : null}
              {requirements.spellbook > 0 ? (
                <PickList
                  legend="Spellbook spells"
                  options={spellbookOptions}
                  value={spellbook}
                  count={requirements.spellbook}
                  onChange={(next) => {
                    setSpellbook(next);
                    setPrepared((value) =>
                      value.filter(
                        (name) =>
                          next.includes(name) ||
                          character.spells.some((spell) => spell.name === name),
                      ),
                    );
                  }}
                />
              ) : null}
              {requirements.prepared > 0 ? (
                <PickList
                  legend="Prepared spells"
                  options={preparedOptions}
                  value={prepared}
                  count={requirements.prepared}
                  onChange={setPrepared}
                />
              ) : null}
            </>
          ) : (
            <>
              <h2>Review</h2>
              <ul className="spell-summary">
                <li>New level: {requirements.newLevel}</li>
                {subclass ? <li>Subclass: {subclass.name}</li> : null}
                {requirements.abilityIncrease ? (
                  <li>
                    {takesFeat
                      ? `Feat: ${feat}`
                      : abilityMode === "split"
                        ? `${plusTwo} +2`
                        : `${first} +1, ${second} +1`}
                  </li>
                ) : null}
                {expertise.length > 0 ? <li>Expertise: {expertise.join(", ")}</li> : null}
                {weaponMasteries.length > 0 ? (
                  <li>Weapon Mastery: {weaponMasteries.join(", ")}</li>
                ) : null}
                {cantrips.length > 0 ? <li>Cantrips: {cantrips.join(", ")}</li> : null}
                {spellbook.length > 0 ? <li>Spellbook: {spellbook.join(", ")}</li> : null}
                {prepared.length > 0 ? <li>Prepared: {prepared.join(", ")}</li> : null}
              </ul>
            </>
          )}
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-actions">
          {step > 0 ? (
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setStep((value) => value - 1);
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
            {saving ? "Leveling up..." : isLast ? "Level up" : "Continue"}
            {!saving && !isLast ? <span aria-hidden="true">→</span> : null}
          </button>
        </div>
      </form>
    </section>
  );
}

export default LevelUp;
