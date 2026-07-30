import raw from "@/data/level-up-catalog.json";
import englishExtra from "@/data/level-up/english-phrases.extra.json";
import cultureExtra from "@/data/level-up/culture-trivia.extra.json";
import healthExtra from "@/data/level-up/healthcare-terms.extra.json";
import docExercises from "@/data/level-up/documentation.exercises.json";
import commExtra from "@/data/level-up/communication-scenarios.extra.json";
import complianceBank from "@/data/level-up/compliance-questions.json";
import formsCatalog from "@/data/level-up/forms-catalog.json";

export type PhraseCard = {
  id: string;
  phrase: string;
  meaning: string;
  example: string;
};

export type TriviaItem = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  fact?: string;
};

export type ScenarioItem = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explain: string;
};

export type DocExercise = {
  id: string;
  messy: string;
  clean: string;
};

export type LevelUpCatalog = {
  phrases: PhraseCard[];
  trivia: TriviaItem[];
  healthTerms: { id: string; term: string; plain: string }[];
  healthcareLines: { id: string; role: string; line: string; tip: string }[];
  scenarios: ScenarioItem[];
  docRewrite: { messy: string; clean: string };
  emailRewrite: { messy: string; clean: string };
  complianceQuick: ScenarioItem & { prompt: string };
  aiTips: string[];
  stateAbbreviations: { abbr: string; name: string }[];
};

type WithMeta<T> = T & { meta: { status: string; owner?: string; reviewDate?: string } };

function stripMetaPhrase(row: WithMeta<PhraseCard>): PhraseCard {
  const { meta: _m, ...rest } = row;
  return rest;
}

function stripMetaTrivia(row: WithMeta<TriviaItem>): TriviaItem {
  const { meta: _m, ...rest } = row;
  return rest;
}

function stripMetaTerm(row: WithMeta<{ id: string; term: string; plain: string }>) {
  const { meta: _m, ...rest } = row;
  return rest;
}

function stripMetaScenario(row: WithMeta<ScenarioItem>): ScenarioItem {
  const { meta: _m, ...rest } = row;
  return rest;
}

function stripMetaDoc(row: WithMeta<DocExercise>): DocExercise {
  const { meta: _m, ...rest } = row;
  return rest;
}

const base = raw as LevelUpCatalog;

function liveRows<T extends { meta: { status: string } }>(rows: T[]): T[] {
  return rows.filter((r) => r.meta.status === "live");
}

const extraPhrases = liveRows(englishExtra as WithMeta<PhraseCard>[]).map(stripMetaPhrase);

const extraTrivia = liveRows(cultureExtra as WithMeta<TriviaItem>[]).map(stripMetaTrivia);

const extraTerms = liveRows(healthExtra as WithMeta<{ id: string; term: string; plain: string }>[]).map(
  stripMetaTerm,
);

const allDocExercises: DocExercise[] = [
  ...liveRows(docExercises as WithMeta<DocExercise>[]).map(stripMetaDoc),
  { id: "legacy-doc", messy: base.docRewrite.messy, clean: base.docRewrite.clean },
];

const extraScenarios = liveRows(commExtra as WithMeta<ScenarioItem>[]).map(stripMetaScenario);

const complianceItems: ScenarioItem[] = liveRows(complianceBank as WithMeta<ScenarioItem>[]).map(stripMetaScenario);

export const LEVEL_UP_CATALOG: LevelUpCatalog = {
  ...base,
  phrases: [...base.phrases, ...extraPhrases],
  trivia: [...base.trivia, ...extraTrivia],
  healthTerms: [...base.healthTerms, ...extraTerms],
  scenarios: [...base.scenarios, ...extraScenarios],
};

export const DOCUMENTATION_EXERCISES = allDocExercises;
export const COMPLIANCE_QUESTIONS = complianceItems;
export const FORMS_CATALOG = formsCatalog;

/** Stable daily index from calendar date (same item for everyone that day). */
export function dailyIndex(key: string, length: number, date = new Date()): number {
  if (length <= 0) return 0;
  const day = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${key}`;
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  return h % length;
}

export function phraseOfTheDay(date = new Date()) {
  const i = dailyIndex("phrase", LEVEL_UP_CATALOG.phrases.length, date);
  return LEVEL_UP_CATALOG.phrases[i];
}

export function triviaOfTheDay(date = new Date()) {
  const i = dailyIndex("trivia", LEVEL_UP_CATALOG.trivia.length, date);
  return LEVEL_UP_CATALOG.trivia[i];
}

export function healthTermOfTheDay(date = new Date()) {
  const i = dailyIndex("term", LEVEL_UP_CATALOG.healthTerms.length, date);
  return LEVEL_UP_CATALOG.healthTerms[i];
}

export function aiTipOfTheDay(date = new Date()) {
  const i = dailyIndex("ai", LEVEL_UP_CATALOG.aiTips.length, date);
  return LEVEL_UP_CATALOG.aiTips[i];
}

export function docExerciseOfTheDay(date = new Date()) {
  const i = dailyIndex("doc", DOCUMENTATION_EXERCISES.length, date);
  return DOCUMENTATION_EXERCISES[i];
}

export function complianceQuestionOfTheDay(date = new Date()) {
  const pool = COMPLIANCE_QUESTIONS.length ? COMPLIANCE_QUESTIONS : [LEVEL_UP_CATALOG.complianceQuick];
  const i = dailyIndex("compliance", pool.length, date);
  return pool[i];
}
