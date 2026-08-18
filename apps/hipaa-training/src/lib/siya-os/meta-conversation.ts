/**
 * Proactive meta-conversation catalog for Ask / Founder Talk.
 *
 * Goal: human-to-bot small talk and product questions get short, honest answers
 * instead of Founder soft-stop ("no approved staff guide") or SOP dumps.
 *
 * Assist is also **in-app support** for the staff portal chrome (Clear chat, Focus, Mic, nav).
 * Product-map answers live here so “what features do you have” does not soft-stop.
 *
 * When a new live failure is a *meta* miss (identity, capability, chrome, memory),
 * add a case here + a sample line in META_SMOKE_SAMPLES — do not wait for another
 * founder report cycle.
 */

export type MetaCategory =
  | "identity"
  | "capability"
  | "authority"
  | "chrome"
  | "memory"
  | "compare"
  | "courtesy";

type MetaCase = {
  id: string;
  category: MetaCategory;
  /** Match against normalized lowercase text */
  test: (t: string, priorUser?: string) => boolean;
  answer: string;
};

const IDENTITY = [
  "I’m **Siya Assist** — an **AI** help desk for Siya Health staff (not a human).",
  "",
  "I answer from **approved internal guides** and live portal signals when available. I don’t invent policy, culture lectures, or org-chart facts.",
  "For drills (culture trivia, typing, etc.), use **Learn → Practice** — Ask/Talk stays for work questions.",
].join("\n");

const WHO = [
  "I'm **Siya Assist** — the internal help desk for Siya Health staff.",
  "",
  "I answer from **approved internal guides** and can route you to the right owner when we don't have a published policy yet.",
].join("\n");

const BOSS = [
  "I don’t have a personal boss — I’m **Siya Assist**, the staff help desk.",
  "",
  "If a **staff SOP / guide is missing**, use **Notify owner** (logs a knowledge-gap for the department lead or founder).",
  "If **you** need a human owner for work (billing, clinical, privacy, IT), ask who to escalate to for that task — I’ll use approved pathways (e.g. Billing lead), not invent one.",
  "I never write your Founder Plan Record for you.",
].join("\n");

const PRODUCT_MAP = [
  "I’m **in-app support** for this staff portal as well as the SOP help desk.",
  "",
  "**Chat (this screen)**",
  "• **New chat** (left sidebar) — start another thread. Login and a new window also open a fresh thread; older chats stay in the list.",
  "• **Clear chat** (top of the thread, after you’ve sent something) — empty *this* conversation and start fresh. It does **not** remove other chats from the sidebar.",
  "• **Archive** (on a sidebar chat) — remove that chat from your list (day-to-day “delete”).",
  "• **Search chats…** — find an older thread by title/text.",
  "• **Mic** then **Send** — dictate into the box; each Mic session is a fresh take.",
  "• 👍 / 👎 — “was this reply helpful?” for review. Does not teach me policy.",
  "• **Notify owner** — only when a **staff guide is missing**. Not email, not a transcript dump.",
  "• **Copy escalation summary** — when it appears: copy a handoff you paste yourself.",
  "",
  "**Left sidebar**",
  "• **My day** — this home: Assist chat + today’s checklist (staff).",
  "• **Learn** — HIPAA training + **Practice** drills (typing, English, culture, map, timezones).",
  "• **Memory** — published internal knowledge (as your role allows).",
  "• **Team** — teammates / presence.",
  "• **Admin** — admin tools (admins only).",
  "• **Account** / **Sign out** — header: your profile and logout.",
  "",
  "**Shift (staff, not admin)**",
  "• **Focus** — quieter My day (priorities + Ask; learning nudges pause). **Back to working** leaves Focus.",
  "• **Break** / **End shift** — presence and end-of-day wrap (you confirm; I don’t clock you out from chat).",
  "",
  "**Admin / founder**",
  "• **Talk** (Founder Talk) answers from guides + portal signals. I **never** write **This week’s plan** (Focus / Can Wait / Delegate / Observe) — you edit that yourself.",
  "",
  "Ask “how do I use Clear chat / Focus / Learn / Mic” anytime — I’ll point to the control, not invent a missing SOP.",
].join("\n");

const CAN_DO = [
  "Two jobs: **(1)** staff help desk from **approved guides**, and **(2)** support for **this app’s buttons and screens**.",
  "",
  "**Work questions:** policies, SOPs, who to contact (reimbursement, leave, billing path, refills). Admins can also ask portal signals (e.g. Team pulse).",
  "**App how-to:** Clear chat, New chat, Archive, Mic, Focus, Learn/Practice, Notify owner, thumbs — I should explain those without pretending they’re missing SOPs.",
  "",
  "I **cannot**: invent policy, immigration/visa advice, US career paths, civics, or write your Founder Plan Record. Role claims in chat stay **unconfirmed**.",
].join("\n");

const LEARN_TRAIN = [
  "You can’t permanently “train” me by chatting — I don’t absorb new company truth from staff talk.",
  "",
  "For **culture / trivia drills**, open **Learn → Practice → Culture & trivia** (`/learn/practice#culture`).",
  "To change what I answer on policy, an owner must publish an **approved internal guide** (or use **Notify owner** to queue a gap).",
].join("\n");

const MEMORY = [
  "I only use what’s **in this chat thread** (plus approved guides).",
  "",
  "I don’t reliably recall other chats or “previous sessions” unless that history is loaded into this thread.",
  "Personal preferences you state here can be recalled **in this chat only**. Role claims (“X is clinical lead”) stay **unconfirmed** until admin verifies.",
].join("\n");

const COMPARE = [
  "I’m **Siya Assist**, not ChatGPT/Gemini for general knowledge.",
  "",
  "I’m scoped to **Siya staff work** — approved guides and portal signals. General trivia and open-web inventing are out of scope on purpose.",
].join("\n");

const FEELINGS = [
  "I don’t have feelings or opinions — I’m a help desk for staff workflows and approved guides.",
  "Ask a work question (SOP, billing path, who owns something) and I’ll stay on that.",
].join("\n");

const NOTIFY = [
  "**Notify owner** logs a **knowledge-gap click** for the suggested department lead’s weekly digest (or founder if there’s no lead).",
  "",
  "It does **not** email a full chat transcript, store your verbatim question in Postgres, or change company policy.",
  "Use it when a **staff SOP / internal guide** is missing or unclear — not for music, civics, or patient marketing FAQs.",
  "For a handoff you can paste yourself, use **Copy escalation summary** when that button appears.",
].join("\n");

const THUMBS = [
  "👍 / 👎 records a **private yes/no** on **that Assist reply** — not the whole chat, not the patient.",
  "",
  "**What gets saved:** helpful true/false, optional department, and (for 👎) a generic reason like “poor explanation.” **No** question text, **no** names, **no** email to anyone.",
  "**What you will see:** the buttons disappear and the line **“Thanks — logged (yes/no only, no transcript).”** That’s the only confirmation. There is no inbox, no ticket, and no Chat Review row.",
  "**What it does *not* do:** change policy, teach me, page a lead, or open Memory.",
].join("\n");

const THUMBS_WHO = [
  "Nobody gets an email when you tap 👍 or 👎.",
  "",
  "The click is stored as an anonymous **helpful / not helpful** count for Assist quality (engineering/ops can tally 👎 over a week). You only see **“Thanks — logged…”** under that reply.",
  "That is **not** **Chat Review** (`/chat-review`) — Chat Review is a separate admin/clinical-lead log of *patient* chats. Staff volume still goes on **End shift** handoff.",
].join("\n");

const PLAN_RECORD = [
  "I **never** write Founder Focus, Can Wait, Delegate, or Observe for you.",
  "Edit those yourself on **This week’s plan**. Talk is answers-only.",
].join("\n");

const COMPANY_BOSS = [
  "I don’t publish a live **org chart** in chat, and I won’t invent who “the boss” is.",
  "",
  "Siya Health is **physician-led**. For day-to-day work, ask **who owns this task** (billing, clinical, HR, IT) and I’ll use approved escalation paths.",
  "If you meant **my** (Siya Assist) boss → I don’t have one; use **Notify owner** when a staff guide is missing.",
].join("\n");

const WHERE_GUIDES = [
  "Approved staff guides are what I pull in **Ask** from published internal topics.",
  "",
  "Browse / manage knowledge in **Memory** (left sidebar). Drills (culture, typing) are under **Learn → Practice**.",
  "If something’s missing, say the task in one sentence — or use **Notify owner** when that button appears.",
].join("\n");

const MY_JOB = [
  "I don’t have your personal HR job description in this chat.",
  "",
  "Ask about a **specific Siya workflow** (refill, reimbursement, leave, billing contact) — or check role duties with your **manager / HR**.",
].join("\n");

const ORIENTATION = [
  "I’m **Siya Assist** in the **Siya staff portal** — help for **Siya Health staff work**, not a general “become an MA in the US” career app and not a promise to “change your life.”",
  "",
  "**Useful ways to use this app as staff:**",
  "1. **Ask** (this chat) — policies, SOPs, who to contact (reimbursement, leave, billing path, refills).",
  "2. **Learn → Training** — HIPAA certification modules.",
  "3. **Learn → Practice** — short drills (chat speed/typing, English phrases, culture trivia, timezones) to get sharper at US clinic chat.",
  "4. **My day** — shift checklist and tasks.",
  "5. **Memory / Team** — published knowledge and team info (as your role allows).",
  "",
  "Dictation and imperfect English are fine — if something is **unclear**, ask me to clarify and I’ll ask back.",
  "I answer from **approved guides**. I don’t invent immigration advice or email your supervisor for you.",
  "Ask about **any button on screen** (Clear chat, Focus, Mic, Archive) — I support this app, not only SOPs.",
].join("\n");

const LEARN_EXPLAIN = [
  "**Learn** is the training area of this staff app (left sidebar).",
  "",
  "**Practice drills** are short exercises — typing/chat speed, English phrases, culture trivia, US map, timezones. They help day-to-day clinic chat skills; they are **not** an MA license or a US visa path.",
  "**Chat speed & accuracy** is the typing drill under Practice.",
  "",
  "Open **Learn** or **Learn → Practice** in the left sidebar when you want a drill. Use **Ask** here for policies, SOPs, and who owns a work question.",
].join("\n");

const LOOP_IN = [
  "I don’t email people or “loop them in” for you.",
  "",
  "If a reply showed **Copy escalation summary**, tap that and paste into Slack/email yourself.",
  "**Notify owner** is only when a **staff guide is missing** — not for general orientation or “what is this app.”",
  "For day-to-day help, message your **manager / supervisor** on your normal work channel.",
].join("\n");

const DELETE_CHATS = [
  "**Clear chat** is at the **top of this thread** (next to “Assist”) once you’ve sent at least one message. It empties *this* conversation and starts fresh. It does **not** delete other chats in the sidebar.",
  "",
  "**New chat** (left sidebar) opens another thread and keeps this one in the list.",
  "**Archive** (on a sidebar row) removes that chat from your list — that’s the day-to-day “delete.”",
  "I can’t press those buttons for you from inside the message box.",
].join("\n");

const CLEAR_CHAT = [
  "**Clear chat** sits at the **top of this conversation** (right side, next to “Assist”) after you’ve sent a message.",
  "",
  "It starts this thread over. Other chats stay in the left list until you **Archive** them.",
  "**New chat** is a *new* thread; **Clear chat** wipes the *current* one.",
].join("\n");

const FOCUS_HELP = [
  "**Focus** is a **shift presence** button in the top bar (staff) — 🎯 Focus.",
  "",
  "It means “I’m concentrating”: My day stays on priorities + this chat; learning nudges pause. It does **not** change company policy or lock the app.",
  "Tap **Back to working** when you’re done. I can’t turn Focus on/off from chat.",
].join("\n");

const NAV_HELP = [
  "Left sidebar: **My day** (this home + Assist), **Learn** (HIPAA + Practice drills), **Memory** (published knowledge), **Team** (people / presence).",
  "",
  "Staff also have **Account**, **Sign out**, **Light/Dark**, and shift controls (**Focus**, **Break**, **End shift**).",
  "Admins see **Admin** instead of shift Focus, and **Talk** for founder questions — Talk never writes This week’s plan.",
].join("\n");

const MIC_HELP = [
  "**Mic** turns speech into text in the box. Tap Mic again to stop, then tap **Send**.",
  "",
  "Each Mic session starts a **fresh** take (it won’t glue onto old leftover text).",
  "Dictation typos are OK — if something is unclear, ask me to clarify.",
].join("\n");

const CASES: MetaCase[] = [
  // --- identity ---
  {
    id: "ai-human",
    category: "identity",
    test: (t) =>
      /\b(are|aren'?t|arent|r)\s+(you|u)\s+(an?\s+)?(ai|a\.i\.|bot|human|robot|person|llm)\b/.test(t) ||
      /\bwhy\s+(not|aren'?t|arent)\b.*\b(you|u)\b.*\b(ai|a\.i\.|bot)\b/.test(t) ||
      /\bwhy\s+not\b.*\b(ai|a\.i\.)\b/.test(t) ||
      /\bare\s+(you|u)\s+human\b/.test(t) ||
      /\b(are|r)\s+(you|u)\s+real\b/.test(t) ||
      /\bare\s+(you|u)\s+a\s+chatbot\b/.test(t),
    answer: IDENTITY,
  },
  {
    id: "who-what-name",
    category: "identity",
    test: (t) =>
      /what('s| is) your name\b/.test(t) ||
      /\bwho are you\b/.test(t) ||
      /\bwhat are you\??\s*$/.test(t) ||
      /\bintroduce yourself\b/.test(t),
    answer: WHO,
  },
  {
    id: "feelings",
    category: "identity",
    test: (t) =>
      /\b(do you|can you)\s+(feel|love|hate|get angry)\b/.test(t) ||
      /\bhow\s+do\s+you\s+feel\b/.test(t),
    answer: FEELINGS,
  },

  // --- authority ---
  {
    id: "boss-escalate",
    category: "authority",
    test: (t) =>
      /\bwho\s+is\s+your\s+(boss|manager|supervisor|owner)\b/.test(t) ||
      /\b(can|could)\s+(you|u)\s+escalate\s+to\s+your\s+(boss|manager|supervisor)\b/.test(t) ||
      /\bescalate\s+to\s+your\s+(boss|manager|supervisor)\b/.test(t) ||
      /\bwho\s+(do you|do u)\s+report\s+to\b/.test(t) ||
      /\bwho\s+owns\s+you\b/.test(t),
    answer: BOSS,
  },
  {
    id: "company-boss",
    category: "authority",
    test: (t) =>
      /^(who'?s|who\s+is)\s+the\s+boss\??\s*$/.test(t) ||
      /^(who'?s|who\s+is)\s+boss\??\s*$/.test(t) ||
      /\bwho\s+is\s+in\s+charge\s+(here|at\s+siya)\b/.test(t),
    answer: COMPANY_BOSS,
  },

  // --- capability ---
  {
    id: "what-can-you-do",
    category: "capability",
    test: (t) =>
      /\bwhat\s+can\s+(you|u)\s+do\b/.test(t) ||
      /\bhow\s+can\s+(you|u)\s+help\b/.test(t) ||
      /\bwhat\s+are\s+(you|u)\s+(good|able)\s+at\b/.test(t) ||
      /\bcapabilities\b/.test(t),
    answer: CAN_DO,
  },
  {
    id: "product-features",
    category: "chrome",
    test: (t) =>
      (/\b(all\s+the\s+)?features?\b/.test(t) &&
        /\b(what|which|list|know|have|app|tool|portal|you)\b/.test(t)) ||
      /\bwhat\s+(buttons?|controls?|screens?)\b/.test(t) ||
      /\bhow\s+(do\s+i\s+)?use\s+(this\s+)?(app|tool|portal|assist)\b/.test(t) ||
      /\b(app|portal)\s+support\b/.test(t) ||
      /\btest\s+(your|the)\s+(knowledge|features)\b/.test(t) ||
      /\bwhat\s+can\s+(i|we)\s+do\s+(in|with)\s+(this\s+)?(app|tool|portal)\b/.test(t) ||
      /\btell\s+me\s+(about\s+)?(the\s+)?(buttons?|features?|screens?)\b/.test(t),
    answer: PRODUCT_MAP,
  },
  {
    id: "where-guides",
    category: "chrome",
    test: (t) =>
      /\bwhere\s+(are|is)\s+(the\s+)?(right\s+)?(guides?|sops?|policies|policy)\b/.test(t) ||
      /\bwhere\s+(do\s+i|can\s+i)\s+find\s+(the\s+)?(guides?|sops?|policies)\b/.test(t) ||
      /\bwhere\s+are\s+the\s+right\s+guide\b/.test(t),
    answer: WHERE_GUIDES,
  },
  {
    id: "my-job",
    category: "capability",
    test: (t) =>
      /\bwhat('?s| is)\s+my\s+(typical\s+)?(job|role|title)\b/.test(t) ||
      /\bwhat\s+do\s+i\s+(usually\s+)?do\s+here\b/.test(t),
    answer: MY_JOB,
  },
  {
    id: "orientation",
    category: "capability",
    test: (t) =>
      /\b(what\s+is\s+this\s+(tool|app)|get\s+some\s+orientation|orientation\b)/.test(t) ||
      /\btop\s+\d+\s+uses\b/.test(t) ||
      (/\bbecome\s+a\s+(better\s+)?medical\s+assistant\b/.test(t) &&
        /\b(app|tool|ai|assist|learn|practice|drill)\b/.test(t)) ||
      (/\bchange\s+my\s+life\b/.test(t) && /\b(app|tool|ai)\b/.test(t)) ||
      (/\bdictat/.test(t) && /\b(orientation|this\s+tool|english|mic)\b/.test(t)),
    answer: ORIENTATION,
  },
  {
    id: "learn-explain",
    category: "capability",
    test: (t) =>
      /\b(what\s+(is|are)|what'?s|how\s+(do|will|does|can))\b/.test(t) &&
      /\b(learn(\s+h[eu]rb)?|practice(d)?\s+drills?|chat\s+speed)\b/.test(t),
    answer: LEARN_EXPLAIN,
  },
  {
    id: "loop-in",
    category: "chrome",
    test: (t) =>
      /\bhow\s+(do\s+i\s+)?loop\s+(them|him|her|someone|supervisor)\s+in\b/.test(t) ||
      /\bloop\s+them\s+in\b/.test(t) ||
      /\bemail\s+(my\s+)?supervisor\b/.test(t) ||
      /\bemail\s+supervisor\b/.test(t),
    answer: LOOP_IN,
  },
  {
    id: "train-learn-permanent",
    category: "capability",
    test: (t) =>
      /\b(train|teach|program)\s+(you|u)\b/.test(t) ||
      /\b(can|could)\s+(you|u)\s+(learn|remember)\s+(this|that|from me|forever|permanently)\b/.test(t) ||
      /\bi\s+want\s+to\s+train\s+(you|u)\b/.test(t) ||
      /\bupdate\s+your\s+(knowledge|brain|model)\b/.test(t),
    answer: LEARN_TRAIN,
  },
  {
    id: "write-plan-record",
    category: "capability",
    test: (t) =>
      /\b(write|update|edit|fill)\s+(my\s+)?(plan\s+record|founder\s+focus|can\s+wait)\b/.test(t) ||
      /\bcan\s+(you|u)\s+(set|change)\s+founder\s+focus\b/.test(t),
    answer: PLAN_RECORD,
  },

  // --- memory ---
  {
    id: "remember-other-chats",
    category: "memory",
    test: (t) =>
      /\b(do you|can you|did you)\s+remember\s+(previous|other|past|last)\s+chats?\b/.test(t) ||
      /\bremember\s+(our|my)\s+(last|previous)\s+(chat|conversation)\b/.test(t) ||
      /\bdo\s+you\s+remember\s+me\b/.test(t) ||
      /\bacross\s+(chats|sessions|threads)\b/.test(t),
    answer: MEMORY,
  },

  // --- compare ---
  {
    id: "vs-chatgpt",
    category: "compare",
    test: (t) =>
      /\b(chatgpt|chat gpt|openai|gemini|copilot|claude)\b/.test(t) &&
      /\b(like|vs|versus|better|same|just|another|different)\b/.test(t),
    answer: COMPARE,
  },
  {
    id: "are-you-chatgpt",
    category: "compare",
    test: (t) => /\bare\s+(you|u)\s+(chatgpt|chat gpt|gemini|claude|copilot)\b/.test(t),
    answer: COMPARE,
  },

  // --- chrome ---
  {
    id: "notify-owner",
    category: "chrome",
    test: (t) => /\bnotify\s+owner\b/.test(t) && /\b(what|do|does|button|mean|for|how|when|why|click)\b/.test(t),
    answer: NOTIFY,
  },
  {
    id: "thumbs",
    category: "chrome",
    test: (t) =>
      /\b(thumbs?|feedback)\b/.test(t) &&
      /\b(what|do|does|button|mean|for|why|up|down|helpful)\b/.test(t),
    answer: THUMBS,
  },
  {
    id: "thumbs-who",
    category: "chrome",
    test: (t) =>
      /\b(quality\s+review|who\s+(does|reviews?)\s+(the\s+)?(thumbs?|feedback|quality))\b/.test(t) ||
      (/\bthumbs?\s+down\b/.test(t) && /\b(who|how|what\s+happens|review)\b/.test(t)) ||
      (/\bquality\s+review\b/.test(t) && /\b(who|how|done|process)\b/.test(t)),
    answer: THUMBS_WHO,
  },
  {
    id: "delete-chats",
    category: "chrome",
    test: (t, prior) => {
      const blob = [prior, t].filter(Boolean).join(" ");
      if (
        /\b(delete|remove|archive)\s+(old\s+|exist(?:ing|ig)\s+|this\s+|my\s+)?(chats?|conversations?|threads?)\b/.test(
          t,
        ) ||
        /\bhow\s+(do\s+i\s+)?(delete|remove|archive)\s+(a\s+|my\s+|old\s+|exist(?:ing|ig)\s+)?(chats?|conversations?)\b/.test(
          t,
        ) ||
        /\bwhere\s+(do\s+i\s+)?(delete|archive)\s+(chats?|conversations?)\b/.test(t) ||
        /\bdelete\s+exist/.test(t)
      ) {
        return true;
      }
      // Split dictation: "how to" then "delete existig chat"
      if (
        t.length < 48 &&
        /\b(delete|remove|archive)\b/.test(t) &&
        (/\b(chat|conversation|thread|exist)/.test(t) ||
          (/\bhow\s+to\b/.test(prior || "") && /\b(chat|thread|conversation|delete|archive)\b/.test(blob)))
      ) {
        return true;
      }
      if (/^(how(\s+to)?|how\s+do\s+i)\??$/.test(t) && /\b(delete|archive|clear)\s+.{0,40}(chat|thread)/.test(blob)) {
        return true;
      }
      return false;
    },
    answer: DELETE_CHATS,
  },
  {
    id: "clear-chat",
    category: "chrome",
    test: (t) =>
      /\bclear\s+chat\b/.test(t) ||
      /\bhow\s+(do\s+i\s+)?(clear|reset|wipe)\s+(this\s+)?(chat|conversation|thread)\b/.test(t) ||
      /\b(what\s+does|where\s+is)\s+(the\s+)?clear\s+chat\b/.test(t),
    answer: CLEAR_CHAT,
  },
  {
    id: "new-chat",
    category: "chrome",
    test: (t) =>
      /\bnew\s+chat\b/.test(t) &&
      /\b(what|where|how|button|do|mean|use|start)\b/.test(t),
    answer: DELETE_CHATS,
  },
  {
    id: "focus-help",
    category: "chrome",
    test: (t) =>
      (/\bfocus\s+(mode|button)\b/.test(t) ||
        /\bwhat\s+(is|does)\s+focus\b/.test(t) ||
        /\bhow\s+(do\s+i\s+)?(use|turn\s+on|start)\s+focus\b/.test(t) ||
        /\b🎯\s*focus\b/.test(t) ||
        /\bback\s+to\s+working\b/.test(t)) &&
      !/\bfounder\s+focus\b/.test(t) &&
      !/\bplan\s+record\b/.test(t),
    answer: FOCUS_HELP,
  },
  {
    id: "nav-help",
    category: "chrome",
    test: (t) =>
      (/\b(top\s+nav|left\s+sidebar|navigation|menu)\b/.test(t) && /\b(what|where|how|mean)\b/.test(t)) ||
      (/\bwhat\s+(is|are)\s+(my\s+day|memory|team)\b/.test(t) && !/\bpractice\s+drills?\b/.test(t)) ||
      /\bhow\s+do\s+i\s+(open|get\s+to|find)\s+(learn|memory|team|my\s+day|account)\b/.test(t),
    answer: NAV_HELP,
  },
  {
    id: "end-shift",
    category: "chrome",
    test: (t) =>
      /\b(how\s+(do\s+i\s+)?(end|finish)\s+(my\s+)?shift|what\s+does\s+end\s+shift\b|end\s+shift\s+button)\b/.test(
        t,
      ),
    answer:
      "**End shift** is in the top bar (staff). You confirm a wrap-up; I don’t clock you out from chat. After that you may see a short handoff prompt. **Break** is presence only — not ending the day.",
  },
  {
    id: "mic-help",
    category: "chrome",
    test: (t) =>
      /\b(how\s+(do\s+i\s+)?(use\s+)?(the\s+)?mic|microphone|dictat|voice\s+input)\b/.test(t) &&
      /\b(how|what|use|work|button|option)\b/.test(t),
    answer: MIC_HELP,
  },

  // Courtesy — frustration about Assist (needs no prior assistant turn)
  {
    id: "frustration",
    category: "courtesy",
    test: (t) =>
      t.length < 100 &&
      !/\bmy\s+name\s+is\b/.test(t) &&
      (/\bthis\s+(isn'?t|is\s+not|aint)\s+working\b/.test(t) ||
        /\b(you|u)\s+(are|r)\s+not\s+(helping|assisting)\b/.test(t)),
    answer: [
      "Sorry — that last stretch wasn’t useful.",
      "",
      "Tell me what you need in plain terms (e.g. “how do I submit a reimbursement?” or “who do I contact for billing?”).",
      "I’ll use approved guides or say clearly when something is outside staff help-desk scope.",
    ].join("\n"),
  },
  {
    id: "greeting",
    category: "courtesy",
    test: (t) => /^(hi|hello|hey|how\s+(are|r)\s+(you|u)|how'?s\s+it\s+going)\b/.test(t) && t.length < 28,
    answer: "Hi — ask me about policies, SOPs, tools, or who to contact. I'll use approved internal guides first.",
  },
  {
    id: "thanks",
    category: "courtesy",
    test: (t) => /^(thanks|thank you|thx|ty)\b/.test(t) && t.length < 40,
    answer: "You’re welcome — ask anytime about policies, SOPs, or who to contact.",
  },
  {
    id: "bye",
    category: "courtesy",
    test: (t) => /^(bye|goodbye|see you|later)\b/.test(t) && t.length < 40,
    answer: "Bye — I’m here when you need a staff guide or escalation path.",
  },
];

/** Samples for local smoke / H0 — one per case id we care about most. */
export const META_SMOKE_SAMPLES: { id: string; text: string; mustMatch: RegExp; mustNot: RegExp }[] = [
  { id: "ai-human", text: "why not arent u AI", mustMatch: /AI help desk|not a human/i, mustNot: /approved staff guide/i },
  { id: "ai-human", text: "are you human", mustMatch: /not a human|AI help desk/i, mustNot: /approved staff guide/i },
  { id: "who-what-name", text: "who are you", mustMatch: /Siya Assist/i, mustNot: /approved staff guide for that/i },
  { id: "boss-escalate", text: "who is your boss", mustMatch: /don.?t have a personal boss|Notify owner/i, mustNot: /approved staff guide/i },
  { id: "boss-escalate", text: "can you escalate to your boss", mustMatch: /Notify owner|Siya Assist/i, mustNot: /HIPAA certification course/i },
  { id: "company-boss", text: "whos the boss", mustMatch: /org chart|physician-led|who owns/i, mustNot: /right staff guide for that yet/i },
  { id: "where-guides", text: "where are the right guide", mustMatch: /Memory|Ask|Practice/i, mustNot: /right staff guide for that yet/i },
  { id: "my-job", text: "whats my typical job", mustMatch: /job description|manager|workflow/i, mustNot: /right staff guide for that yet/i },
  {
    id: "orientation",
    text: "I am asking how do they help me become a medical assistant because I was told that this is an app which will change my life and help me use AI to become a better medical assistant can you tell me like top 5 uses for this app for me",
    mustMatch: /Siya Assist|Ask|Learn → Practice|My day/i,
    mustNot: /right staff guide for that yet|Privacy Officer|Efficiency: Automate/i,
  },
  {
    id: "learn-explain",
    text: "what is learn herb and practiced drills and chat speed and how will they help me",
    mustMatch: /Learn|Practice drills|Chat speed/i,
    mustNot: /Open the \*\*Chat speed|right staff guide for that yet/i,
  },
  {
    id: "loop-in",
    text: "how to loop them in",
    mustMatch: /don.?t email|Copy escalation|Notify owner|manager/i,
    mustNot: /right staff guide for that yet|HIPAA certification course/i,
  },
  {
    id: "delete-chats",
    text: "how to delete old chats",
    mustMatch: /Archive|Clear chat|New chat/i,
    mustNot: /right staff guide for that yet/i,
  },
  {
    id: "clear-chat",
    text: "what does the clear chat button do",
    mustMatch: /top of this (thread|conversation)|Clear chat/i,
    mustNot: /right staff guide for that yet/i,
  },
  {
    id: "product-features",
    text: "what features does this app have",
    mustMatch: /Clear chat|Archive|Focus|Learn/i,
    mustNot: /right staff guide for that yet/i,
  },
  {
    id: "focus-help",
    text: "what is focus button",
    mustMatch: /shift presence|Back to working/i,
    mustNot: /right staff guide for that yet/i,
  },
  { id: "what-can-you-do", text: "what can you do", mustMatch: /help desk|this app|approved/i, mustNot: /approved staff guide for that/i },
  { id: "train-learn-permanent", text: "i want to train you regarding american culture", mustMatch: /Practice|culture|can.?t permanently/i, mustNot: /approved staff guide for that/i },
  { id: "remember-other-chats", text: "do you remember previous chats", mustMatch: /this chat thread|don.?t reliably recall other/i, mustNot: /approved staff guide/i },
  { id: "are-you-chatgpt", text: "are you chatgpt", mustMatch: /Siya Assist|not ChatGPT/i, mustNot: /approved staff guide/i },
  { id: "notify-owner", text: "what does notify owner button do", mustMatch: /knowledge-gap/i, mustNot: /approved staff guide for that/i },
  { id: "thumbs", text: "what does the thumbs up button do", mustMatch: /yes\/no|no transcript|Does not email/i, mustNot: /approved staff guide/i },
  {
    id: "thumbs-who",
    text: "who does quality review n how is it done",
    mustMatch: /Nobody gets an email|Chat Review|yes\/no|End shift/i,
    mustNot: /right staff guide for that yet|Quality Review Access/i,
  },
  {
    id: "delete-chats",
    text: "delete existig chat",
    mustMatch: /Archive|Clear chat/i,
    mustNot: /right staff guide for that yet/i,
  },
  { id: "write-plan-record", text: "can you write my plan record", mustMatch: /never.*Plan|This week/i, mustNot: /approved staff guide for that/i },
  { id: "feelings", text: "do you feel sad", mustMatch: /don.?t have feelings/i, mustNot: /approved staff guide/i },
  { id: "greeting", text: "how r u", mustMatch: /Hi —/i, mustNot: /approved staff guide/i },
  { id: "frustration", text: "this isnt working good", mustMatch: /Sorry|plain terms|reimbursement/i, mustNot: /right staff guide for that yet/i },
  { id: "thanks", text: "thanks", mustMatch: /welcome/i, mustNot: /approved staff guide/i },
];

/**
 * First matching meta case wins. Returns null if not a meta conversation turn.
 */
export function answerMetaConversation(text: string, priorUser?: string): string | null {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ");
  const prior = (priorUser ?? "")
    .trim()
    .toLowerCase()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ");
  // Dictated orientation asks can be long; still allow meta (cases are selective).
  if (!t || t.length > 1200) return null;
  for (const c of CASES) {
    if (c.test(t, prior)) return c.answer;
  }
  return null;
}

export function metaCaseCount(): number {
  return CASES.length;
}
