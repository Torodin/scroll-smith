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
