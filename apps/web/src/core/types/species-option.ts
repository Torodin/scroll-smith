import type { NamedOption } from "./named-option";

export type SpeciesOption = NamedOption & {
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
