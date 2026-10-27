import type { NamedOption } from "./named-option";

export type AbilityName =
  | "Strength"
  | "Dexterity"
  | "Constitution"
  | "Intelligence"
  | "Wisdom"
  | "Charisma";

export type BackgroundOption = NamedOption & {
  description: string;
  properties: {
    abilityScores: AbilityName[];
    feat: string;
    skillProficiencies: string[];
    toolProficiency: { type: "specific"; name: string } | { type: "choice"; category: string };
    equipment: {
      package: { items: { item: string; quantity: number }[]; gold: number };
      alternative: { amount: number; currency: "GP" };
    };
  } | null;
};
