export const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof abilityKeys)[number];
export type Scores = Record<AbilityKey, number>;

const abilityLabels: Record<AbilityKey, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const POINT_BUDGET = 27;
const pointCosts: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

type Assignment = Record<AbilityKey, number | null>;

export type AbilityState = {
  mode: "manual" | "roll" | "pointBuy";
  manual: Scores;
  rolls: number[];
  assignment: Assignment;
  pointBuy: Scores;
};

const uniform = (value: number): Scores => ({
  str: value,
  dex: value,
  con: value,
  int: value,
  wis: value,
  cha: value,
});

export const emptyAbilityState: AbilityState = {
  mode: "pointBuy",
  manual: uniform(10),
  rolls: [],
  assignment: { str: null, dex: null, con: null, int: null, wis: null, cha: null },
  pointBuy: uniform(8),
};

const pointsSpent = (scores: Scores) =>
  abilityKeys.reduce((sum, key) => sum + (pointCosts[scores[key]] ?? 0), 0);

function rollAbility(): number {
  const dice = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
  return dice.reduce((a, b) => a + b, 0) - Math.min(...dice);
}

export function resolveAbilityScores(state: AbilityState): Scores | string {
  if (state.mode === "manual") {
    const invalid = abilityKeys.some(
      (key) =>
        !Number.isInteger(state.manual[key]) || state.manual[key] < 1 || state.manual[key] > 30,
    );
    return invalid ? "Ability scores must be whole numbers between 1 and 30." : state.manual;
  }
  if (state.mode === "pointBuy") {
    return pointsSpent(state.pointBuy) > POINT_BUDGET
      ? `You can spend at most ${POINT_BUDGET} points.`
      : state.pointBuy;
  }
  if (state.rolls.length === 0) return "Roll your ability scores to continue.";
  const result = {} as Scores;
  for (const key of abilityKeys) {
    const index = state.assignment[key];
    if (index === null) return "Assign a rolled value to every ability.";
    result[key] = state.rolls[index]!;
  }
  return result;
}

function AbilityStep({
  state,
  onChange,
}: {
  state: AbilityState;
  onChange: (next: AbilityState) => void;
}) {
  const spent = pointsSpent(state.pointBuy);
  const taken = new Set(Object.values(state.assignment).filter((v) => v !== null));

  return (
    <>
      <div className="background-ability-mode" role="radiogroup">
        {(
          [
            ["pointBuy", "Point buy"],
            ["roll", "Roll (4d6, drop lowest)"],
            ["manual", "By hand"],
          ] as const
        ).map(([mode, label]) => (
          <label key={mode}>
            <input
              checked={state.mode === mode}
              name="score-method"
              onChange={() => onChange({ ...state, mode })}
              type="radio"
            />{" "}
            {label}
          </label>
        ))}
      </div>

      {state.mode === "pointBuy" ? (
        <p className="species-empty">
          Points remaining: {POINT_BUDGET - spent} of {POINT_BUDGET}. Scores range from 8 to 15.
        </p>
      ) : null}

      {state.mode === "roll" ? (
        <p className="species-empty">
          <button
            className="button button-secondary"
            disabled={state.rolls.length > 0}
            type="button"
            onClick={() =>
              onChange({
                ...state,
                rolls: Array.from({ length: 6 }, rollAbility).sort((a, b) => b - a),
              })
            }
          >
            {state.rolls.length > 0 ? "Rolled" : "Roll scores"}
          </button>{" "}
          {state.rolls.length > 0 ? `Results: ${state.rolls.join(", ")}` : null}
        </p>
      ) : null}

      <div className="background-ability-split">
        {abilityKeys.map((key) => (
          <label className="field" key={key}>
            <span>{abilityLabels[key]}</span>
            {state.mode === "manual" ? (
              <input
                max={30}
                min={1}
                name={`score-${key}`}
                onChange={(event) =>
                  onChange({
                    ...state,
                    manual: { ...state.manual, [key]: Number(event.target.value) },
                  })
                }
                type="number"
                value={state.manual[key]}
              />
            ) : state.mode === "pointBuy" ? (
              <select
                name={`score-${key}`}
                onChange={(event) =>
                  onChange({
                    ...state,
                    pointBuy: { ...state.pointBuy, [key]: Number(event.target.value) },
                  })
                }
                value={state.pointBuy[key]}
              >
                {Object.keys(pointCosts).map((value) => {
                  const cost = pointCosts[Number(value)]! - pointCosts[state.pointBuy[key]]!;
                  return (
                    <option disabled={spent + cost > POINT_BUDGET} key={value} value={value}>
                      {value} (cost {pointCosts[Number(value)]})
                    </option>
                  );
                })}
              </select>
            ) : (
              <select
                disabled={state.rolls.length === 0}
                name={`score-${key}`}
                onChange={(event) =>
                  onChange({
                    ...state,
                    assignment: {
                      ...state.assignment,
                      [key]: event.target.value === "" ? null : Number(event.target.value),
                    },
                  })
                }
                value={state.assignment[key] ?? ""}
              >
                <option value="">Choose a roll</option>
                {state.rolls.map((roll, index) => (
                  <option
                    disabled={taken.has(index) && state.assignment[key] !== index}
                    key={index}
                    value={index}
                  >
                    {roll}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
    </>
  );
}

export default AbilityStep;
