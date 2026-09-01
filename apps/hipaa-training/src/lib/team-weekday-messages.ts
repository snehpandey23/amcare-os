/**
 * Weekday team-message copy (Mon–Fri) + usage segment helpers.
 * Email cron can import this after content approval — Feedback Friday links to /feedback.
 */
export type UsageSegment = "new_ask" | "regular_ask" | "practice_bridge";

export type WeekdayTheme =
  | "motivational_monday"
  | "therapeutic_tuesday"
  | "working_wednesday"
  | "thoughtful_thursday"
  | "feedback_friday";

const PORTAL = "https://siya-staff-assist.vercel.app";
const PRACTICE = `${PORTAL}/learn/practice`;
const FEEDBACK = `${PORTAL}/feedback`;

export function weekdayThemeForUtcDate(d = new Date()): WeekdayTheme | null {
  // IST-friendly: use Asia/Kolkata weekday
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(d);
  switch (day) {
    case "Mon":
      return "motivational_monday";
    case "Tue":
      return "therapeutic_tuesday";
    case "Wed":
      return "working_wednesday";
    case "Thu":
      return "thoughtful_thursday";
    case "Fri":
      return "feedback_friday";
    default:
      return null;
  }
}

export function classifyUsageSegment(opts: {
  askTurnsLast30d: number;
  askTurnsLast14d: number;
  practiceLifetime: number;
}): UsageSegment {
  if (opts.askTurnsLast14d >= 1) return "regular_ask";
  if (opts.practiceLifetime >= 1 && opts.askTurnsLast30d === 0) return "practice_bridge";
  return "new_ask";
}

type Draft = { subject: string; text: string };

function hi(name: string) {
  return name.trim() || "there";
}

export function buildWeekdayMessage(opts: {
  theme: WeekdayTheme;
  segment: UsageSegment;
  firstName: string;
}): Draft {
  const firstName = hi(opts.firstName);
  const portalUrl = PORTAL;
  const practiceUrl = PRACTICE;
  const feedbackUrl = FEEDBACK;

  if (opts.theme === "motivational_monday") {
    if (opts.segment === "regular_ask") {
      return {
        subject: "You’ve got this week",
        text: `Hi ${firstName} — quick Monday note from Siya Assist.\n\nYou’re already using Ask when work gets sticky — keep that rhythm. If you want a quieter stretch, try Focus on My day so it’s just priorities + chat.\n\nI’m here when you need me: ${portalUrl}\n\n— your Siya Assist`,
      };
    }
    return {
      subject: "A steady start to the week",
      text: `Hi ${firstName} — from your Siya Assist.\n\nWhatever this week throws at you, you don’t have to hold every answer alone. When something’s fuzzy mid-shift, Ask on My day is here in plain language.\n\nOne small question is enough to start: ${portalUrl}\n\n— your Siya Assist`,
    };
  }

  if (opts.theme === "therapeutic_tuesday") {
    if (opts.segment === "regular_ask") {
      return {
        subject: "Care for the person doing the work",
        text: `Hi ${firstName}.\n\nYou’re showing up for patients and teammates — leave a little room for yourself today, even five quiet minutes.\n\nIf work noise creeps back in, I’m still here on My day: ${portalUrl}\n\n— your Siya Assist`,
      };
    }
    return {
      subject: "A soft pause mid-week",
      text: `Hi ${firstName}.\n\nTuesdays can stack fast. Take one breath before the next ping — you’re allowed a short reset.\n\nWhen you’re ready for work questions again, Ask is waiting without judgment: ${portalUrl}\n\n— your Siya Assist`,
    };
  }

  if (opts.theme === "working_wednesday") {
    if (opts.segment === "regular_ask") {
      return {
        subject: "Build one muscle today",
        text: `Hi ${firstName}.\n\nYou’re already asking solid work questions — pair that with one Learn → Practice drill this week (typing speed or culture trivia both count).\n\nOpen Practice: ${practiceUrl}\n\n— your Siya Assist`,
      };
    }
    return {
      subject: "One skill rep for today",
      text: `Hi ${firstName}.\n\nMidweek is a good day for one small Practice drill — typing, culture, or healthcare terms — so the next real shift feels easier.\n\nTry a short one here: ${practiceUrl}\nWork questions still live on Ask: ${portalUrl}\n\n— your Siya Assist`,
    };
  }

  if (opts.theme === "thoughtful_thursday") {
    if (opts.segment === "regular_ask") {
      return {
        subject: "What are you carrying into Friday?",
        text: `Hi ${firstName}.\n\nWhat’s one decision or handoff you’d like clearer tomorrow? Naming it is enough — Ask can help unpack the SOP side when you’re ready.\n\nMy day: ${portalUrl}\n\n— your Siya Assist`,
      };
    }
    return {
      subject: "One reflection before Friday",
      text: `Hi ${firstName}.\n\nBefore the week closes, what’s one thing that went smoother than you expected? No essay — just notice it.\n\nIf a work question is still open, bring it to Ask: ${portalUrl}\n\n— your Siya Assist`,
    };
  }

  // feedback_friday — same CTA for all segments
  return {
    subject: "A kindness for someone on the team",
    text: `Hi ${firstName}.\n\nFridays are for appreciation and honest, useful feedback — to a peer or to a lead.\n\nYou’ll choose every time: share your name, or send anonymously. Anonymous means they see the note with no name, team, or other clues about who wrote it.\n\nGive feedback: ${feedbackUrl}\n\n— your Siya Assist`,
  };
}
