import type { Character } from "./character";
import type { NamedOption } from "./named-option";
import type { SpeciesOption } from "./species-option";

export type DashboardData = {
  characters: Character[];
  species: SpeciesOption[];
  backgrounds: NamedOption[];
  classes: NamedOption[];
};
