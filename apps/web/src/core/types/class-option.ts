import type { AbilityName } from "./background-option";
import type { NamedOption } from "./named-option";

export type ClassEquipmentPackage = {
  items: { item: string; quantity: number }[];
  gold: number;
};

export type ClassSummary = NamedOption & {
  description: string;
  hitPointDie: number;
  primaryAbility: string;
  savingThrows: AbilityName[];
  spellcastingAbility: AbilityName | null;
};

export type ClassDetail = ClassSummary & {
  armorTraining: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  toolChoice: { count: number; category: string } | null;
  skillChoiceCount: number;
  skillChoiceOptions: string[];
  expertiseCount: number;
  weaponMasteryCount: number;
  spellbookCount: number;
  startingEquipment: {
    packages: Record<string, ClassEquipmentPackage>;
    goldAlternative: number;
  };
  levels: {
    level: number;
    proficiencyBonus: number;
    columns: Record<string, string | number>;
    spellSlots: number[] | null;
  }[];
  features: { id: number; level: number; name: string; description: string }[];
  subclasses: {
    id: number;
    name: string;
    description: string;
    features: { id: number; level: number; name: string; description: string }[];
  }[];
  choiceGroups: {
    id: number;
    level: number;
    name: string;
    description: string;
    choiceCount: number;
    options: { id: number; name: string; description: string; extraCantrips: number }[];
  }[];
};

export type ClassChoicesInput = {
  skills: string[];
  tools: string[];
  expertise: string[];
  weaponMasteries: string[];
  cantrips: number[];
  spellbook: number[];
  preparedSpells: number[];
  equipment: string;
  featureChoices: { choiceGroupId: number; choiceOptionId: number }[];
};
