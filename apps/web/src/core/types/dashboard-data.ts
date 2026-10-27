import type { BackgroundOption } from "./background-option";
import type { Character } from "./character";
import type { ClassSummary } from "./class-option";
import type { SpeciesOption } from "./species-option";

export type DashboardData = {
  characters: Character[];
  species: SpeciesOption[];
  backgrounds: BackgroundOption[];
  classes: ClassSummary[];
};
