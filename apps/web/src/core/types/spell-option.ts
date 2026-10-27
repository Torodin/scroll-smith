export type SpellOption = {
  id: number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  material: string | null;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevel: string | null;
  classes: string[];
};
