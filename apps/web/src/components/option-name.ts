import type { NamedOption } from "../core/types";

export function optionName(options: NamedOption[], id: number): string {
  return options.find((option) => option.id === id)?.name ?? "Unknown";
}
