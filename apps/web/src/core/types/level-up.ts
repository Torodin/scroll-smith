import type { AbilityName } from "./background-option";

export type AbilityIncreaseInput =
  | { mode: "split"; plusTwo: AbilityName }
  | { mode: "spread"; first: AbilityName; second: AbilityName }
  | { mode: "feat"; feat: string };

export type LevelUpInput = {
  subclassId?: number;
  abilityIncrease?: AbilityIncreaseInput;
  expertise: string[];
  weaponMasteries: string[];
  cantrips: number[];
  spellbook: number[];
  preparedSpells: number[];
  featureChoices: { choiceGroupId: number; choiceOptionId: number }[];
};
