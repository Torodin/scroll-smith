import type { Character, ClassDetail } from "../types";

export type LevelUpRequirements = {
  newLevel: number;
  features: ClassDetail["features"];
  needsSubclass: boolean;
  abilityIncrease: "improvement" | "epic-boon" | null;
  expertise: number;
  weaponMasteries: number;
  choiceGroups: ClassDetail["choiceGroups"];
  cantrips: number;
  prepared: number;
  spellbook: number;
  maxSpellLevel: number;
};

export function getLevelUpRequirements(
  character: Character,
  detail: ClassDetail,
): LevelUpRequirements {
  const newLevel = character.level + 1;
  const column = (level: number, name: string) =>
    Number(detail.levels.find((row) => row.level === level)?.columns[name] ?? 0) || 0;
  const delta = (name: string) =>
    Math.max(column(newLevel, name) - column(character.level, name), 0);
  const features = detail.features.filter((feature) => feature.level === newLevel);
  const subclassLevel = Math.min(
    ...detail.features.filter((f) => f.name.endsWith(" Subclass")).map((f) => f.level),
  );

  return {
    newLevel,
    features,
    needsSubclass: character.subclassId === null && newLevel >= subclassLevel,
    abilityIncrease: features.some((f) => f.name === "Epic Boon")
      ? "epic-boon"
      : features.some((f) => f.name === "Ability Score Improvement")
        ? "improvement"
        : null,
    expertise: features.some((f) => f.name === "Expertise") ? 2 : 0,
    weaponMasteries: delta("Weapon Mastery"),
    choiceGroups: detail.choiceGroups.filter((group) => group.level === newLevel),
    cantrips: delta("Cantrips"),
    prepared: delta("Prepared Spells"),
    spellbook: detail.spellbookCount > 0 ? 2 : 0,
    maxSpellLevel: detail.levels.find((row) => row.level === newLevel)?.spellSlots?.length ?? 0,
  };
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function getSpellDC(spellcastingAbilityScore: number, level: number): number {
  return 8 + getProficiencyBonus(level) + getModifier(spellcastingAbilityScore);
}

export function getPassiveSkill(
  abilityScore: number,
  skillName: string,
  skillProficiencies: string[],
  level: number,
): number {
  let passivePerception = 10 + getModifier(abilityScore);

  const isProficient = !!skillProficiencies.find((skill) => skill == skillName);

  if (isProficient) passivePerception = passivePerception + getProficiencyBonus(level);

  return passivePerception;
}
