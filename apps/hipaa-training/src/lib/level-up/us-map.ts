import mapData from "@/data/us-map-states.json";

export type MapState = {
  abbr: string;
  name: string;
  capital: string;
  cx: number;
  cy: number;
  highlight?: boolean;
  note?: string;
};

export const US_MAP = mapData as {
  viewBox: { w: number; h: number };
  states: MapState[];
  quizCapitals: { abbr: string; wrong: string[] }[];
};

export function stateByAbbr(abbr: string) {
  return US_MAP.states.find((s) => s.abbr === abbr);
}

export function randomCapitalQuiz() {
  const pool = US_MAP.quizCapitals;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const state = stateByAbbr(pick.abbr)!;
  const choices = [state.capital, ...pick.wrong].sort(() => Math.random() - 0.5);
  return {
    prompt: `What is the capital of ${state.name} (${state.abbr})?`,
    choices,
    correctIndex: choices.indexOf(state.capital),
    fact: state.note ? `${state.name}: ${state.note}` : undefined,
    abbr: state.abbr,
  };
}

export function randomFindStateQuiz() {
  const state = US_MAP.states[Math.floor(Math.random() * US_MAP.states.length)];
  return {
    targetAbbr: state.abbr,
    prompt: `Tap ${state.name} on the map`,
    name: state.name,
  };
}
