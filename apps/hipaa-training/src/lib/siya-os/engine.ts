import { getEscalationContacts } from "./config";
import { defaultEscalationOwner } from "./escalation";
import { retrievalQueryBoost, routeIntent, expandShortQuery, hasRoutableIntent } from "./flows";
import { composeAnswerFromChunks, clarifyVagueMessage, clarifyConfusedFollowUp, askClarifyingQuestion, isConfidentAssistAnswer, workplaceConcernAnswer, isHrContactQuery, buildHrContactAnswer, abusivePatientAnswer, pickLiveAbusivePatientSop, formatEscalationForSlack, isVagueUserMessage, isConfusedAboutPriorAnswer, isClarifyingFollowUp, answerFromPriorAssistIfCovered, isGapContributionFollowUp, answerGapContributionFollowUp, polishStaffMessage, isCasualOffTopic, casualOffTopicReply, appendDraftLiveHedge, provisionalSourceLabel, provisionalRoutingMeta } from "./compose-answer";
import { staffTopicLabel } from "./staff-voice";
import {
  formatDepartmentLeadAnswer,
  formatLeadsFollowUpAnswer,
  fetchDepartmentLeads,
  isDepartmentLeadFollowUp,
  isDepartmentLeadQuery,
} from "./department-leads-ask";
import { isSopAssignmentQuery, answerSopAssignmentAsk } from "./sop-assignment-ask";
import { isMissingSopsQuery, answerMissingSopsAsk } from "./sop-missing-ask";
import { isMyScheduleQuery, answerMyScheduleQuery } from "./shift-roster-ask";
import { answerWhoIsQuery, isWhoAmIQuery, extractWhoIsName } from "./staff-identity-ask";
import { synthesizeWorkforceAnswer } from "./llm-answer";
import {
  retrieveLayeredKnowledge,
  retrieveWorkspaceNearMisses,
  filterStaffFacingChunks,
  isHistoricalMemoryQuery,
  type RetrievedChunk,
} from "./retrieval";
import { fetchSopsForRetrieval } from "@/lib/sop-api";
import { fetchDecisionsForRetrieval } from "@/lib/knowledge-api";
import { searchMemory } from "@/lib/memory-api";
import { displayDepartment, type Confidence, type Department } from "./departments";
import {
  assessStaffMessageSafety,
  staffRefusalMessage,
  type StaffRefusalCategory,
} from "./phi-guard";
import { fetchAdminOpsSnapshot, fetchMyTasksToday } from "./admin-ops-snapshot";
import { detectAdminOpsIntent, runAdminOpsCoach, staffMyTasksReply, isAmbiguousStaffLoginDashboardQuery, historySuggestsPresenceTopic } from "./admin-ops-coach";
import { tryFactsLookup } from "./facts-lookup";
import { tryPracticeLookup } from "./practice-lookup";
import { trySopChromeLookup } from "./sop-chrome-lookup";
import { tryWorkplaceLinkLookup } from "./workplace-link-lookup";
import { answerMetaConversation, type MetaConversationReply } from "./meta-conversation";
import {
  acknowledgePersonalPreference,
  acknowledgeRoleAuthorityClaim,
  answerEscalateChallenge,
  answerMetaCertaintyAboutPriorClaim,
  answerPersonalFactRecall,
  answerUnknownPersonAsk,
  expandRoleClaimWithHistory,
  extractPersonalFactsFromHistory,
  isCompanyPolicyAssertion,
  isPersonalPreferenceStatement,
  isRoleAuthorityAssertion,
  preferenceSummariesForLlm,
} from "./conversation-memory";
import {
  fetchFounderPortalSignalsBlock,
  wantsFounderPortalSignals,
  portalDomainFilter,
  asksDomainFlags,
} from "./founder-chat-context";

export interface SiyaReply {
  message: string;
  chunks: RetrievedChunk[];
  escalate?: string;
  refused?: boolean;
  refusalCategory?: StaffRefusalCategory;
  routing?: {
    department: Department;
    task: string;
    confidence: Confidence;
    followUpQuestions: string[];
  };
  sources?: { title: string; id: string }[];
  escalationPreview?: string;
  /** No approved KB match — show notify-owner flow */
  knowledgeGap?: boolean;
  /**
   * Answer trust for UI:
   * - approved (default): live guide
   * - provisional: authored stub, not signed-off — chip + disclaimer, no soft-stop
   */
  answerTrust?: "approved" | "provisional";
  /** Admin ops co-pilot quick links (task board, team, etc.) */
  portalLinks?: { label: string; href: string }[];
  /** True when reply used live task/team data */
  opsCoPilot?: boolean;
  /** True when deterministic site facts-lookup answered (skip LLM rewrite) */
  factsLookup?: boolean;
  /**
   * Rule engine already produced a final answer (off-topic, clarify, meta, etc.).
   * Never pass to LLM for "enhancement" — even when portalSignals are present.
   */
  ruleFinal?: boolean;
  executiveMeta?: {
    confidence: string;
    freshnessSeconds: number;
    recommendedAction: string;
    evidenceCount: number;
  };
  /** True when the reply body came from Workforce LLM synthesis */
  llmUsed?: boolean;
  /** True when retrieval compose was used because LLM was off, skipped, or failed */
  llmFallback?: boolean;
  /** Distinguishes billing/auth/quota from “LLM off” when synthesis fails */
  llmError?: {
    code: string;
    kind: string;
    message: string;
  } | null;
  pendingTask?: {
    title: string;
    assigneeId: string;
    assigneeLabel: string;
    priority: string;
    dueDate: string;
  };
}

const REFUND_PROMISE = /\b(i (can|will) (approve|refund|waive|credit)|guaranteed refund|refund is approved)\b/i;

/** Patient-site / public marketing asks — not Founder Plan gaps. */
function isPatientFacingMarketingAsk(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return (
    /\b(adhd|glp-?1|semaglutide|tirzepatide|testosterone|trt|weight\s+loss|telehealth)\b/.test(t) &&
    /\b(test(ing)?|diagnos|evaluat|screening|cost|price|california|texas|florida|pennsylvania|online|patient)\b/.test(
      t,
    )
  );
}

export function runSiyaAssistant(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: {
    layeredChunks?: RetrievedChunk[];
    founderCoach?: boolean;
    queryOverride?: string;
  },
): SiyaReply {
  return buildSiyaReply(message, history, opts);
}

function metaConversationReply(
  text: string,
  history: { role: string; content: string }[],
  task = "Portal help",
  assistantLabel?: string | null,
): SiyaReply | null {
  const priorUser = [...history].reverse().find((h) => h.role === "user")?.content;
  const priorAssistant = [...history].reverse().find((h) => h.role === "assistant")?.content;
  const meta: MetaConversationReply | null = answerMetaConversation(text, priorUser, priorAssistant, {
    assistantLabel,
  });
  if (!meta) return null;
  return {
    message: polishStaffMessage(meta.answer),
    chunks: [],
    knowledgeGap: false,
    sources: [],
    portalLinks: meta.links,
    escalationPreview: undefined,
    ruleFinal: true,
    routing: {
      department: "General",
      task,
      confidence: "high",
      followUpQuestions: [],
    },
  };
}

function toolShortcutReply(text: string, task = "Tool bookmark"): SiyaReply | null {
  const hit = tryWorkplaceLinkLookup(text);
  if (!hit) return null;
  return {
    message: polishStaffMessage(hit.message),
    chunks: [],
    knowledgeGap: false,
    sources: [{ title: `Workplace links · ${hit.label}`, id: "workplace-links" }],
    portalLinks: hit.links,
    escalationPreview: undefined,
    ruleFinal: true,
    routing: {
      department: "Clinical Operations",
      task: `${task} · ${hit.label}`,
      confidence: "high",
      followUpQuestions: [],
    },
  };
}

export async function runSiyaAssistantAsync(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: {
    focusMode?: boolean;
    authToken?: string | null;
    surface?: "default" | "founder-coach";
    /** Personalization opening label from client (optional). */
    assistantLabel?: string | null;
  }
): Promise<SiyaReply> {
  const focusMode = opts?.focusMode ?? false;
  const token = opts?.authToken?.trim() || null;
  const founderCoach = opts?.surface === "founder-coach";
  const assistantLabel = opts?.assistantLabel?.trim() || null;

  // Department leads — live portal data (before meta "no org chart" legacy copy).
  if (token && (isDepartmentLeadQuery(message) || isDepartmentLeadFollowUp(message))) {
    const leads = await fetchDepartmentLeads(token);
    if (isDepartmentLeadFollowUp(message) && !isDepartmentLeadQuery(message)) {
      return {
        message: polishStaffMessage(formatLeadsFollowUpAnswer(leads)),
        chunks: [],
        sources: [{ title: "Department leads (portal)", id: "department-leads" }],
        knowledgeGap: false,
        answerTrust: "approved",
        ruleFinal: true,
        routing: {
          department: "HR",
          task: "Department leads",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    if (isDepartmentLeadQuery(message)) {
      const { message: leadMsg, departmentLabel } = formatDepartmentLeadAnswer(message, leads);
      const dept: Department =
        departmentLabel === "Clinical Operations"
          ? "Clinical Operations"
          : departmentLabel === "Accounts"
            ? "Accounts"
            : departmentLabel === "Technology"
              ? "Technology"
              : departmentLabel === "Marketing"
                ? "Marketing"
                : departmentLabel === "Compliance"
                  ? "Compliance"
                  : "HR";
      return {
        message: polishStaffMessage(leadMsg),
        chunks: [],
        sources: [{ title: "Department leads (portal)", id: "department-leads" }],
        knowledgeGap: false,
        answerTrust: "approved",
        ruleFinal: true,
        routing: {
          department: dept,
          task: "Department leads",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }

  // Leads follow-up without token — still avoid soft-stop / inventing names.
  if (!token && isDepartmentLeadFollowUp(message)) {
    return {
      message: polishStaffMessage(
        "Yes — when you’re signed in I can read **department leads** from the portal and name whoever is assigned. Sign in and ask again (e.g. “who is the HR lead?”), or open **Team**. I won’t invent names.",
      ),
      chunks: [],
      sources: [],
      knowledgeGap: false,
      ruleFinal: true,
      routing: {
        department: "HR",
        task: "Department leads",
        confidence: "medium",
        followUpQuestions: [],
      },
    };
  }

  const metaEarly = metaConversationReply(
    message,
    history,
    founderCoach ? "Founder Talk — portal help" : "Portal help",
    assistantLabel,
  );
  if (metaEarly) return metaEarly;

  // Ambiguous "staff login dashboard" with no presence thread → ask which meaning (don't dump Workplace links).
  if (
    isAmbiguousStaffLoginDashboardQuery(message) &&
    !historySuggestsPresenceTopic(history) &&
    detectAdminOpsIntent(message, history)?.kind !== "team_pulse"
  ) {
    return {
      message: polishStaffMessage(
        [
          "Do you mean **which tool to log into** (Workplace links on My day), or **who’s currently online / on shift** (Team pulse)?",
          "",
          "Say **tool links** or **who’s online** and I’ll route you.",
        ].join("\n"),
      ),
      chunks: [],
      sources: [],
      portalLinks: [
        { label: "Team", href: "/team" },
        { label: "My day", href: "/" },
      ],
      knowledgeGap: false,
      ruleFinal: true,
      routing: {
        department: founderCoach ? "Leadership" : "General",
        task: "Clarify login vs presence",
        confidence: "high",
        followUpQuestions: ["Who’s online now?", "Show workplace login links"],
      },
    };
  }

  // Team pulse / presence BEFORE name lookup — "who is online" / "who is loggin in" must not become roster search.
  const opsIntentEarly = token ? detectAdminOpsIntent(message, history) : null;
  if (token && opsIntentEarly?.kind === "team_pulse") {
    const snapshot = await fetchAdminOpsSnapshot(token);
    if (snapshot) {
      const ops = await runAdminOpsCoach(message, snapshot, token, history);
      if (ops) {
        return {
          message: polishStaffMessage(ops.message),
          chunks: [],
          sources: [],
          portalLinks: ops.links,
          opsCoPilot: true,
          ruleFinal: true,
          pendingTask: founderCoach ? undefined : ops.pendingTask,
          executiveMeta: {
            confidence: "high",
            freshnessSeconds: 0,
            recommendedAction: "Open Team for live presence, or continue in Ask.",
            evidenceCount: 1,
          },
          routing: {
            department: "Leadership",
            task: "Team presence",
            confidence: "high",
            followUpQuestions: [],
          },
        };
      }
    }
    return {
      message: polishStaffMessage(
        "I don’t have the live **Team pulse** roster on this login (that’s an admin signal). Open **Team** to see who’s on shift — I won’t invent a list.",
      ),
      chunks: [],
      sources: [],
      portalLinks: [{ label: "Team", href: "/team" }],
      opsCoPilot: false,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Team presence",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  // Session / roster identity — before soft-stop or Daily Plan.
  if (isWhoAmIQuery(message) || extractWhoIsName(message)) {
    const idAnswer = await answerWhoIsQuery(message, token);
    if (idAnswer) {
      return {
        message: polishStaffMessage(idAnswer.message),
        chunks: [],
        sources: idAnswer.sources,
        knowledgeGap: false,
        answerTrust: "approved",
        ruleFinal: true,
        routing: {
          department: founderCoach ? "Leadership" : "General",
          task: "Staff identity",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }

  // Missing / gap SOP inventory — live portal queue, not Memory chrome.
  if (token && isMissingSopsQuery(message)) {
    const missing = await answerMissingSopsAsk(token);
    return {
      message: polishStaffMessage(missing.message),
      chunks: [],
      sources: missing.sources,
      portalLinks: missing.links,
      knowledgeGap: false,
      answerTrust: "approved",
      ruleFinal: true,
      routing: {
        department: founderCoach ? "Leadership" : "Clinical Operations",
        task: "Missing SOPs",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  // SOP assignment / who is reviewing — live portal data, not SOP body.
  if (token && isSopAssignmentQuery(message, history)) {
    const assign = await answerSopAssignmentAsk(message, history, token);
    if (assign) {
      return {
        message: polishStaffMessage(assign.message),
        chunks: [],
        sources: assign.sources,
        portalLinks: assign.links,
        knowledgeGap: false,
        answerTrust: "approved",
        ruleFinal: true,
        routing: {
          department: "Clinical Operations",
          task: "SOP assignment",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }

  // My shifts / my schedule — shift_roster for signed-in user only (deterministic).
  if (isMyScheduleQuery(message)) {
    if (!token) {
      return {
        message: polishStaffMessage(
          "Sign in to see **your** schedule from the imported MA roster. I read `shift_roster` for your account only — I won’t invent shifts or guess a team roster.",
        ),
        chunks: [],
        sources: [],
        knowledgeGap: false,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "My shift schedule",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    const sched = await answerMyScheduleQuery(message, token);
    if (sched) {
      return {
        message: polishStaffMessage(sched.message),
        chunks: [],
        sources: sched.sources,
        portalLinks: [{ label: "My day", href: "/" }],
        knowledgeGap: false,
        answerTrust: "approved",
        factsLookup: true,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "My shift schedule",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    return {
      message: polishStaffMessage(
        "I couldn’t load your schedule from **shift_roster** just now. Refresh and try again, or check **Did today go as planned?** on **My day**.",
      ),
      chunks: [],
      sources: [],
      knowledgeGap: false,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "My shift schedule",
        confidence: "medium",
        followUpQuestions: [],
      },
    };
  }

  const toolEarly = toolShortcutReply(
    message,
    founderCoach ? "Founder Talk — tool bookmark" : "Tool bookmark",
  );
  if (toolEarly) return toolEarly;

  const opsIntent = token ? detectAdminOpsIntent(message, history) : null;
  if (token && opsIntent) {
    const snapshot = await fetchAdminOpsSnapshot(token);
    if (snapshot) {
      const ops = await runAdminOpsCoach(message, snapshot, token, history);
      if (ops) {
        return {
          message: polishStaffMessage(ops.message),
          chunks: [],
          sources: [],
          portalLinks: ops.links,
          opsCoPilot: true,
          // Presence / ops snapshot answers are definitive — never Founder Talk LLM enhancement.
          ruleFinal:
            ops.intent === "team_pulse" ||
            ops.intent === "ops_engagement" ||
            ops.intent === "overdue" ||
            ops.intent === "task_status",
          pendingTask: founderCoach ? undefined : ops.pendingTask,
          executiveMeta: {
            confidence: ops.mode === "recommend" ? "high" : "medium",
            freshnessSeconds: 0,
            recommendedAction: ops.pendingTask
              ? "Review the proposed task and tap Approve to create it."
              : "Open the linked board or continue in Ask.",
            evidenceCount: 1,
          },
          routing: {
            department: "Leadership",
            task: "Executive Workspace",
            confidence: "high",
            followUpQuestions: [],
          },
        };
      }
    }
    // Staff (or snapshot miss): still answer presence honestly — never invent a roster or soft-stop.
    if (opsIntent.kind === "team_pulse") {
      return {
        message: polishStaffMessage(
          "I don’t have the live **Team pulse** roster on this login (that’s an admin signal). Open **Team** to see who’s on shift — I won’t invent a list.",
        ),
        chunks: [],
        sources: [],
        portalLinks: [{ label: "Team", href: "/team" }],
        opsCoPilot: false,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "Team presence",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    // Staff: personal task asks must not soft-stop — list My day from /api/tasks/me.
    if (
      opsIntent.kind === "task_status" ||
      opsIntent.kind === "plan_day" ||
      opsIntent.kind === "overdue"
    ) {
      const mine = await fetchMyTasksToday(token);
      if (mine) {
        const ops = staffMyTasksReply(mine.date, mine.tasks);
        return {
          message: polishStaffMessage(ops.message),
          chunks: [],
          sources: [],
          portalLinks: ops.links,
          opsCoPilot: true,
          ruleFinal: true,
          routing: {
            department: "General",
            task: "My day tasks",
            confidence: "high",
            followUpQuestions: [],
          },
        };
      }
      return {
        message: polishStaffMessage(
          "Your tasks live on **My day** — the checklist above Ask (leave **Focus** if it’s hidden). I couldn’t load the live list just now; refresh and try again.",
        ),
        chunks: [],
        sources: [],
        portalLinks: [{ label: "My day", href: "/" }],
        opsCoPilot: false,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "My day tasks",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }

  const normalized = expandShortQuery(resolveQuery(message.trim(), history));
  const routing = routeIntent(normalized);
  const query = retrievalQueryBoost(normalized, routing);

  let sops: Awaited<ReturnType<typeof fetchSopsForRetrieval>> = [];
  let decisions: Awaited<ReturnType<typeof fetchDecisionsForRetrieval>> = [];
  let memories: { id: string; title: string; body: string; department?: string | null }[] = [];
  try {
    sops = await fetchSopsForRetrieval(token);
  } catch {
    sops = [];
  }
  try {
    decisions = await fetchDecisionsForRetrieval(token);
  } catch {
    decisions = [];
  }
  if (token && isHistoricalMemoryQuery(query)) {
    try {
      memories = await searchMemory(query, token);
    } catch {
      memories = [];
    }
  }

  let portalSignals: string | null = null;
  // Only load portal snapshot when the question is actually about portal/domain signals —
  // never for every Founder Talk turn (that unlocked inventing CAC/trivia from the brief).
  if (token && wantsFounderPortalSignals(message)) {
    portalSignals = await fetchFounderPortalSignalsBlock(token, {
      domainFilter: portalDomainFilter(message),
      flagsOnly: asksDomainFlags(message),
    });
  }

  const layered = retrieveLayeredKnowledge(query, { sops, decisions, memories, limit: 6 });
  const base = buildSiyaReply(message, history, {
    focusMode,
    layeredChunks: layered,
    queryOverride: query,
    founderCoach,
    hasPortalSignals: Boolean(portalSignals),
  });
  // Definitive rule answers always stick — portalSignals must NEVER unlock LLM overwrite.
  // Provisional authored stubs must not be LLM-rewritten (prevents wrong SOP citations).
  // Only intentional empty-message + portal (Founder Talk soft ground) may continue to LLM.
  if (
    base.refused ||
    base.factsLookup ||
    base.knowledgeGap ||
    base.ruleFinal ||
    base.answerTrust === "provisional"
  ) {
    return base;
  }
  if (!base.chunks.length) {
    const allowPortalLlm = Boolean(portalSignals && !base.message?.trim());
    if (!allowPortalLlm) return base;
  }

  const routingLine = base.routing
    ? `Department: ${displayDepartment(base.routing.department)}. Task: ${base.routing.task}.`
    : "";

  const personalFacts = extractPersonalFactsFromHistory(history);
  const synthesis = await synthesizeWorkforceAnswer({
    userMessage: message,
    routingLine,
    chunks: base.chunks,
    followUpQuestions: founderCoach ? [] : (base.routing?.followUpQuestions ?? []),
    history,
    focusMode,
    // Tier-1 preferences only — never pass unconfirmed role claims as LLM "facts"
    personalFacts: preferenceSummariesForLlm(personalFacts),
    portalSignals,
  });

  if (synthesis.text) {
    let msg = appendDraftLiveHedge(polishStaffMessage(synthesis.text), base.chunks);
    if (base.chunks[0]?.escalate && !msg.includes(base.chunks[0].escalate!)) {
      msg += `\n\n**Loop in:** ${base.chunks[0].escalate}`;
    }

    if (
      !founderCoach &&
      base.routing?.confidence === "high" &&
      base.routing.followUpQuestions.length &&
      !focusMode
    ) {
      msg += "\n\n**A few quick questions:**";
      base.routing.followUpQuestions.forEach((q, i) => {
        msg += `\n${i + 1}. ${q}`;
      });
    }

    return {
      ...base,
      message: msg,
      knowledgeGap: false,
      escalationPreview: undefined,
      llmUsed: true,
      llmFallback: false,
      llmError: null,
    };
  }

  const fallbackMsg = base.message?.trim() || askClarifyingQuestion(message);

  return {
    ...base,
    message: polishStaffMessage(fallbackMsg),
    knowledgeGap: !base.message?.trim() ? true : (base.knowledgeGap ?? false),
    llmUsed: false,
    llmFallback: synthesis.llmFallback,
    llmError: synthesis.llmError
      ? {
          code: synthesis.llmError.code,
          kind: synthesis.llmError.kind,
          message: synthesis.llmError.userMessage,
        }
      : null,
  };
}

function mapClarifyOptionReply(message: string): string {
  const t = message.trim().toLowerCase();
  const map: Record<string, string> = {
    "1": "patient or caller situation",
    "2": "teammate or HR workplace concern",
    "3": "billing refund or reimbursement",
    "4": "policy or SOP lookup",
    "5": "tech login or system access issue",
  };
  if (map[t]) return map[t];
  if (/^1\b/.test(t) && t.length < 40) return `patient or caller situation — ${message}`;
  if (/^2\b/.test(t) && t.length < 40) return `teammate or HR workplace concern — ${message}`;
  if (/^3\b/.test(t) && t.length < 40) return `billing refund or reimbursement — ${message}`;
  if (/^4\b/.test(t) && t.length < 40) return `policy or SOP lookup — ${message}`;
  if (/^5\b/.test(t) && t.length < 40) return `tech login or system access issue — ${message}`;
  return message;
}

function resolveQuery(message: string, history: { role: string; content: string }[]): string {
  const mapped = mapClarifyOptionReply(message);
  const lastAssistant = [...history].reverse().find((h) => h.role === "assistant");
  const priorUser = [...history].reverse().find((h) => h.role === "user");
  // Only merge when the user is clearly answering an old 1–5 / path prompt — never glue a new topic onto the prior turn.
  if (
    lastAssistant &&
    priorUser &&
    /not sure which path|one line is enough|are you asking about|which path you need|reply with one line/i.test(
      lastAssistant.content,
    )
  ) {
    const reply = mapped.trim();
    const answeredMenu =
      /^[1-5]\b/.test(reply) ||
      /^(patient|caller|teammate|hr|billing|refund|reimburs|policy|sop|tech|login|access)\b/i.test(reply);
    if (answeredMenu) {
      return `${priorUser.content.trim()} — ${reply}`;
    }
    return mapped;
  }
  // Clarifying follow-ups (“what if the number is unreachable?”) keep prior topic for retrieval.
  if (isClarifyingFollowUp(mapped) && priorUser && priorUser.content.trim().length > 12) {
    return `${priorUser.content.trim()} — ${mapped.trim()}`;
  }
  if (!isVagueUserMessage(mapped)) return mapped;
  // Don't stitch a new short topic onto an older user turn — that caused “X — Y” echo bugs.
  return mapped;
}

function buildSiyaReply(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: {
    focusMode?: boolean;
    layeredChunks?: RetrievedChunk[];
    queryOverride?: string;
    founderCoach?: boolean;
    hasPortalSignals?: boolean;
  }
): SiyaReply {
  const focusMode = opts?.focusMode ?? false;
  const founderCoach = opts?.founderCoach ?? false;
  const text = message.trim();
  if (!text) {
    return {
      message: "What do you need help with today? Type a question or pick a suggestion below.",
      chunks: [],
      ruleFinal: true,
    };
  }

  const safety = assessStaffMessageSafety(text, history);
  if (safety.blocked && safety.category) {
    return {
      message: staffRefusalMessage(safety.category),
      chunks: [],
      refused: true,
      refusalCategory: safety.category,
      ruleFinal: true,
    };
  }

  // Learn / Practice deep-links before meta — culture “train you” must deep-link, not only catalog text.
  const practiceHit = tryPracticeLookup(text);
  if (practiceHit) {
    return {
      message: polishStaffMessage(practiceHit.message),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      portalLinks: practiceHit.links,
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Learn / Practice link",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  const toolShortcut = toolShortcutReply(text);
  if (toolShortcut) return toolShortcut;

  const sopChrome = trySopChromeLookup(text);
  if (sopChrome) {
    return {
      message: polishStaffMessage(sopChrome.message),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      portalLinks: sopChrome.links,
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: sopChrome.id === "write" ? "SOP builder" : "Department SOPs",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  // Tier 3 / Tier 1 before meta — so "my name is X" / "i am clinical lead" aren't swallowed by chrome replies.
  {
    const roleText = expandRoleClaimWithHistory(text, history);
    if (isRoleAuthorityAssertion(roleText) && !isCompanyPolicyAssertion(roleText)) {
      return {
        message: polishStaffMessage(acknowledgeRoleAuthorityClaim(roleText)),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "Role/authority claim (unconfirmed)",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }
  if (isPersonalPreferenceStatement(text) && !isCompanyPolicyAssertion(text)) {
    return {
      message: polishStaffMessage(acknowledgePersonalPreference(text)),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Personal preference (this chat)",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  const priorUser = [...history].reverse().find((h) => h.role === "user")?.content;
  const priorAssistant = [...history].reverse().find((h) => h.role === "assistant")?.content;
  const metaAnswer = answerMetaConversation(text, priorUser, priorAssistant);
  if (metaAnswer) {
    return {
      message: polishStaffMessage(metaAnswer.answer),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      portalLinks: metaAnswer.links,
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  // Patient/public marketing in Founder Talk — redirect; do not invent or flag as SOP gap.
  if (founderCoach && isPatientFacingMarketingAsk(text)) {
    return {
      message: polishStaffMessage(
        [
          "That’s a **patient / public-site** topic — Founder Talk won’t invent marketing or clinical FAQ copy here.",
          "",
          "For staff answers from approved guides, use **Ask** on **My day** (left sidebar). For patient-facing pages, use **siya.health** or Siya Guide.",
          "I won’t mark this as an internal SOP knowledge gap.",
        ].join("\n"),
      ),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "Marketing",
        task: "Patient/public topic (redirect)",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  if (isCasualOffTopic(text)) {
    return {
      message: polishStaffMessage(casualOffTopicReply()),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Out of scope (entertainment)",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  // (role / preference already handled above)

  const personalFacts = extractPersonalFactsFromHistory(history);
  if (personalFacts.length) {
    const recall = answerPersonalFactRecall(text, personalFacts);
    if (recall) {
      return {
        message: polishStaffMessage(recall),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "General",
          task:
            personalFacts.some((f) => f.kind === "role_unconfirmed")
              ? "Role claim recall (unconfirmed)"
              : "Personal preference recall (this chat)",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    const meta = answerMetaCertaintyAboutPriorClaim(text, personalFacts);
    if (meta) {
      return {
        message: polishStaffMessage(meta),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "Prior claim certainty (this chat)",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    const escalatePush = answerEscalateChallenge(text, history, personalFacts);
    if (escalatePush) {
      return {
        message: polishStaffMessage(escalatePush),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "Accounts",
          task: "Escalate target clarification",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  } else {
    const escalatePush = answerEscalateChallenge(text, history, []);
    if (escalatePush) {
      return {
        message: polishStaffMessage(escalatePush),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "Accounts",
          task: "Escalate target clarification",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }

  // Also skip unknown-person soft path when identity handler already covers who-is.
  const unknownPerson =
    extractWhoIsName(text) || isWhoAmIQuery(text) ? null : answerUnknownPersonAsk(text);
  if (unknownPerson) {
    return {
      message: polishStaffMessage(unknownPerson),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Unknown person (no directory)",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  const factsHit = tryFactsLookup(expandShortQuery(text));
  if (factsHit) {
    return {
      message: polishStaffMessage(factsHit.message),
      chunks: factsHit.chunks,
      knowledgeGap: false,
      sources: factsHit.sources,
      escalate: defaultEscalationOwner(factsHit.department),
      routing: {
        department: factsHit.department,
        task: factsHit.task,
        confidence: "high",
        followUpQuestions: [],
      },
      escalationPreview: undefined,
      factsLookup: true,
      ruleFinal: true,
    };
  }

  if (isConfusedAboutPriorAnswer(text) && history.some((h) => h.role === "assistant")) {
    if (historySuggestsPresenceTopic(history)) {
      return {
        message: polishStaffMessage(
          [
            "Sorry — I may have drifted from what you meant.",
            "",
            "If you meant **who’s online / on shift right now**, ask **who’s online now** (or open **Team**).",
            "If you meant **tool login bookmarks**, say **workplace links**.",
            "Otherwise say what you need in one short line.",
          ].join("\n"),
        ),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        portalLinks: [
          { label: "Team", href: "/team" },
          { label: "My day", href: "/" },
        ],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "Clarify presence ask",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
    return {
      message: clarifyConfusedFollowUp(),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  const lastAssistTurn = [...history].reverse().find((h) => h.role === "assistant")?.content;
  if (isGapContributionFollowUp(text, lastAssistTurn)) {
    return {
      message: polishStaffMessage(answerGapContributionFollowUp()),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      portalLinks: [
        { label: "SOP builder", href: "/memory/knowledge/sop-builder" },
        { label: "Department SOPs", href: "/memory/knowledge/sops" },
      ],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Contribute to missing guide",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  if (
    isVagueUserMessage(text) &&
    !hasRoutableIntent(text) &&
    !history.some((h) => h.role === "user" && h.content.trim().length > 12)
  ) {
    return {
      message: clarifyVagueMessage(),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  const normalized = expandShortQuery(resolveQuery(text, history));
  const routing = routeIntent(normalized);

  // HR phone/email — deterministic; never invent numbers or Clinical Ops SOPs.
  if (isHrContactQuery(normalized) || isHrContactQuery(text)) {
    const hrDetail =
      getEscalationContacts().find((c) => /people\s*\/?\s*hr/i.test(c.role))?.detail ||
      "People ops (internal directory)";
    const escalateOwner = defaultEscalationOwner("HR");
    const hasConfigured =
      hrDetail.trim() &&
      !/^people ops \(internal directory\)$/i.test(hrDetail.trim()) &&
      hrDetail.trim().toLowerCase() !== "people ops";
    return {
      message: polishStaffMessage(buildHrContactAnswer(hrDetail)),
      chunks: [],
      escalate: escalateOwner,
      knowledgeGap: !hasConfigured,
      sources: [],
      ruleFinal: true,
      routing: {
        department: "HR",
        task: "People / HR contact",
        confidence: "high",
        followUpQuestions: [
          "Do you want Copy escalation summary for a workplace concern?",
          "Is this urgent / same-day safety?",
        ],
      },
      escalationPreview: formatEscalationForSlack({
        question: text,
        department: displayDepartment("HR"),
        task: "People / HR contact",
        escalateTo: escalateOwner,
        sourceTitles: [],
        followUps: [],
      }),
    };
  }

  if (routing.flowId === "hr-workplace") {
    const escalateOwner = defaultEscalationOwner("HR");
    const askingForPolicy =
      /\b(policy|policies|posh|sexual\s+(abuse|harass)|what\s+are\s+the\s+rules)\b/i.test(
        normalized,
      );
    return {
      message: polishStaffMessage(workplaceConcernAnswer({ askingForPolicy })),
      chunks: [],
      escalate: escalateOwner,
      knowledgeGap: true,
      sources: [],
      ruleFinal: true,
      routing: {
        department: "HR",
        task: routing.task,
        confidence: routing.confidence,
        followUpQuestions: routing.followUpQuestions,
      },
      escalationPreview: formatEscalationForSlack({
        question: text,
        department: displayDepartment("HR"),
        task: routing.task,
        escalateTo: escalateOwner,
        sourceTitles: [],
        followUps: routing.followUpQuestions,
      }),
    };
  }

  const query = opts?.queryOverride ?? retrievalQueryBoost(resolveQuery(normalized, history), routing);
  let chunks =
    opts?.layeredChunks?.length ? opts.layeredChunks : retrieveLayeredKnowledge(query, { limit: 6 });
  chunks = filterStaffFacingChunks(chunks, normalized);

  // Hostile/abusive patient: prefer live reviewed SOP; hardcoded script only if none retrieved.
  if (routing.flowId === "clinical-ops-abusive-patient") {
    const liveHit = pickLiveAbusivePatientSop(chunks);
    if (!liveHit) {
      const escalateOwner = defaultEscalationOwner("Clinical Operations");
      return {
        message: polishStaffMessage(abusivePatientAnswer()),
        chunks: [],
        escalate: escalateOwner,
        knowledgeGap: true,
        sources: [],
        routing: {
          department: "Clinical Operations",
          task: routing.task,
          confidence: routing.confidence,
          followUpQuestions: routing.followUpQuestions,
        },
        escalationPreview: formatEscalationForSlack({
          question: text,
          department: displayDepartment("Clinical Operations"),
          task: routing.task,
          escalateTo: escalateOwner,
          sourceTitles: [],
          followUps: routing.followUpQuestions,
        }),
      };
    }
    // Live safety SOP — cite only this record; do not LLM-rewrite or co-cite provisional stubs.
    chunks = [liveHit];
    const msg = composeAnswerFromChunks(normalized, chunks, false, routing.flowId);
    return {
      message: polishStaffMessage(appendDraftLiveHedge(msg, chunks)),
      chunks,
      escalate: liveHit.escalate ?? defaultEscalationOwner("Clinical Operations"),
      knowledgeGap: false,
      answerTrust: "approved",
      ruleFinal: true,
      sources: [
        {
          title: liveHit.sourceLabel || staffTopicLabel(liveHit.title),
          id: liveHit.id,
        },
      ],
      routing: {
        department: "Clinical Operations",
        task: routing.task,
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  const STRONG_SCORE = 3;
  let hasStrongMatch = chunks.length > 0 && chunks[0].score >= STRONG_SCORE;

  if (!hasStrongMatch) {
    const near = filterStaffFacingChunks(retrieveWorkspaceNearMisses(query, 3), normalized).filter(
      (c) => c.score >= STRONG_SCORE,
    );
    if (near.length) {
      chunks = near;
      hasStrongMatch = true;
    } else {
      chunks = [];
    }
  }

  const confidentRaw = isConfidentAssistAnswer({
    userMessage: normalized,
    flowId: routing.flowId,
    routingConfidence: routing.confidence,
    topScore: chunks[0]?.score ?? 0,
    topChunk: chunks[0] ?? null,
  });
  // Founder Talk: medium keyword hits (e.g. "culture" → Fun Friday) must not dump unrelated guides.
  // Keep only very strong retrieval unless this is an explicit portal/domain ask —
  // except live Postgres SOPs (sop-db-*), which are approved guides staff published on purpose.
  const topIsLiveSop = Boolean(chunks[0]?.id?.startsWith("sop-db-"));
  const confident =
    founderCoach && !wantsFounderPortalSignals(normalized) && !topIsLiveSop
      ? confidentRaw && (chunks[0]?.score ?? 0) >= 40
      : confidentRaw;

  // Unsure → stop. Do not dump weak keyword hits or invent from portal.
  // Portal LLM only when the user explicitly asked about portal/domain signals.
  if (!confident) {
    if (founderCoach && opts?.hasPortalSignals && wantsFounderPortalSignals(normalized)) {
      return {
        message: "",
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        routing: {
          department: "Leadership",
          task: "Founder Talk",
          confidence: "medium",
          followUpQuestions: [],
        },
      };
    }
    const lastAssist = [...history].reverse().find((h) => h.role === "assistant")?.content;
    const fromPrior = answerFromPriorAssistIfCovered(text, lastAssist);
    if (fromPrior) {
      return {
        message: polishStaffMessage(fromPrior),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: founderCoach ? "Leadership" : routing.department,
          task: founderCoach ? "Founder Talk" : routing.task,
          confidence: "medium",
          followUpQuestions: [],
        },
      };
    }
    return {
      message: polishStaffMessage(askClarifyingQuestion(normalized)),
      chunks: [],
      // Genuine retrieval miss — same soft-stop on every surface; auto gap-capture keys off this flag.
      knowledgeGap: true,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: founderCoach ? "Leadership" : routing.department,
        task: founderCoach ? "Founder Talk" : routing.task,
        confidence: "low",
        followUpQuestions: [],
      },
    };
  }

  const knowledgeGap = false;
  const provisional = Boolean(chunks[0]?.provisional);
  const provisionalId = provisional ? chunks[0]?.id : undefined;
  const primaryIsLiveSop = Boolean(chunks[0]?.id?.startsWith("sop-db-"));
  // Cite live Postgres SOPs alone — never co-cite provisional stubs (safety / label integrity).
  // Provisional answers cite only authored provisional stubs.
  const citeChunks = provisional
    ? chunks.filter((c) => c.provisional || c.id === provisionalId).slice(0, 1)
    : primaryIsLiveSop
      ? chunks.filter((c) => c.id === chunks[0]!.id).slice(0, 1)
      : chunks.filter((c) => !c.provisional).slice(0, 2);

  const sources = citeChunks.map((c) => ({
    title:
      c.sourceLabel ||
      (c.provisional ? provisionalSourceLabel(c.id) : staffTopicLabel(c.title)),
    id: c.id,
  }));
  const escalateOwner = chunks[0]?.escalate ?? defaultEscalationOwner(routing.department);

  let msg = appendDraftLiveHedge(
    composeAnswerFromChunks(normalized, chunks, knowledgeGap, routing.flowId),
    chunks,
  );

  if (REFUND_PROMISE.test(msg)) {
    msg =
      "I can't approve refunds or billing exceptions here. Use the **billing / accounts** escalation path from our approved guides, or loop in the **Billing lead** with dates and amounts (no patient identifiers in this chat).";
  }

  if (
    routing.flowId === "accounts-reimbursement" &&
    !chunks.some((c) => /reimburs|expense/i.test(c.id) || /reimburs|expense/i.test(c.title))
  ) {
    msg =
      "**Note:** There isn't a live **employee reimbursement** SOP yet — use **Policies & requirements** (expense) and check with **Accounts**.\n\n" +
      msg;
  }

  if (chunks[0]?.escalate && knowledgeGap) {
    msg += `\n\n**Loop in:** ${chunks[0].escalate}`;
  }

  const showFollowUps =
    !provisional &&
    !focusMode &&
    routing.followUpQuestions.length > 0 &&
    (routing.confidence === "high" ||
      (routing.confidence === "medium" &&
        (routing.flowId === "marketing-carousel" || routing.flowId === "marketing-daily")));
  if (showFollowUps) {
    msg += "\n\n**To help you faster:**";
    routing.followUpQuestions.forEach((q, i) => {
      msg += `\n${i + 1}. ${q}`;
    });
  }

  const showContacts = knowledgeGap;
  if (showContacts) {
    const contacts = getEscalationContacts()
      .slice(0, 4)
      .map((c) => `${c.role}: ${c.detail}`)
      .join(" · ");
    msg += `\n\n**People to try:** ${contacts}`;
  }

  const escalationPreview = knowledgeGap
    ? formatEscalationForSlack({
        question: text,
        department: displayDepartment(routing.department),
        task: routing.task,
        escalateTo: escalateOwner,
        sourceTitles: sources.map((s) => s.title),
        followUps: showFollowUps ? routing.followUpQuestions : undefined,
      })
    : undefined;

  const showRouting =
    provisional ||
    routing.confidence === "high" ||
    routing.confidence === "medium" ||
    (routing.task !== "Company memory lookup" && routing.department !== "General");

  const provRoute = provisional ? provisionalRoutingMeta(provisionalId) : null;

  return {
    message: polishStaffMessage(msg),
    chunks,
    escalate: escalateOwner,
    routing: showRouting
      ? {
          department: provRoute ? provRoute.department : routing.department,
          task: provRoute ? provRoute.task : routing.task,
          confidence: provisional ? "high" : routing.confidence,
          followUpQuestions: showFollowUps ? routing.followUpQuestions : [],
        }
      : undefined,
    sources,
    escalationPreview,
    knowledgeGap: false,
    answerTrust: provisional ? "provisional" : "approved",
    ruleFinal: provisional,
  };
}
