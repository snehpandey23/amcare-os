import { resolveLinks } from './link-registry'
import { humanHandoffResponse } from './templates'
import type { GuideResponse } from './types'

export interface IntentMatch {
  id: string
  confidence: number
  response: GuideResponse
}


/** “human”, “talk”, “real person”, etc. — route to people, not articles */
const HUMAN_HANDOFF_RE =
  /^(human|talk|person|agent|staff|someone|representative|helpdesk|support)\s*[?.!]?\s*$|\b(real (person|human)|human (being|agent|please|help|support)|talk to (a )?(human|person|someone|agent|real|staff)|speak (to|with) (a )?(human|person|someone|agent|staff)|live (agent|person|human|support)|want (a )?human|get (a )?human|need (a )?human|human (please|now)|customer (service|support)|reach (a )?human|connect (me )?(to|with) (a )?(human|person|agent)|not (a )?bot|are you (a )?bot)\b/i

export function isHumanHandoffRequest(text: string): boolean {
  return HUMAN_HANDOFF_RE.test(text.trim())
}

const INTENT_PATTERNS: Array<{
  id: string
  re: RegExp
  message: string
  followUp: string
  links: string[]
  linkLimit?: number
  event?: GuideResponse['analyticsEvent']
}> = [
  {
    id: 'callback_request',
    re: /\b(contact me|call me back|reach out to me|have someone (call|email|contact)|get back to me|follow up with me|request a callback|callback please)\b/i,
    message:
      'Happy to help — share your contact details below and our team will follow up. This is not for emergencies; for urgent needs call 911 or 988.',
    followUp: 'Fill in the short form below (no clinical details, please).',
    links: ['call_siya', 'meet_and_greet'],
    event: 'callback_form_shown',
  },
  {
    id: 'human_handoff',
    re: HUMAN_HANDOFF_RE,
    message: '',
    followUp: '',
    links: ['call_siya', 'text_siya', 'email_siya', 'meet_and_greet', 'spruce_practice'],
    linkLimit: 5,
    event: 'booking_handoff',
  },
  {
    id: 'pricing',
    re: /\b(pric(e|ing)|cost|fee|how much|\$149|\$79)\b/i,
    message:
      'Happy to help with that. Published pricing includes a $149 initial evaluation, plus follow-up plans of $79/month or $149/month when a clinician recommends one. Details can change, so the pricing page is the best place to confirm.',
    followUp: 'Want the full pricing page, ADHD evaluation cost details, or a free Meet & Greet to talk it through?',
    links: ['pricing', 'adhd_evaluation_cost', 'meet_and_greet'],
  },
  {
    id: 'adhd_screening',
    re: /\b(adhd )?screen(ing)?|asrs|free (adhd )?test\b/i,
    message:
      'There’s a free adult ADHD screening on the site — it only takes a couple of minutes. It’s educational and not a diagnosis, but it can be a calm first step.',
    followUp: 'Want to take the screening now, or read about ADHD care first?',
    links: ['adhd_screening', 'adhd_care', 'meet_and_greet'],
    event: 'screening_link_clicked',
  },
  {
    id: 'adhd_care',
    re: /^\s*adhd\s*[?.!]?\s*$|\b(adhd (care|eval|evaluation|diagnosis|treatment)|adult adhd|focus care|about adhd)\b/i,
    message:
      'Siya offers adult ADHD evaluation through telehealth when it’s clinically appropriate — usually a structured visit in supported states. Screening can help you get oriented, but it isn’t a diagnosis, and medication is never guaranteed.',
    followUp: 'Would you like the free screening, the ADHD care page, or a Meet & Greet?',
    links: ['adhd_care', 'adhd_screening', 'meet_and_greet'],
    event: 'service_link_clicked',
  },
  {
    id: 'states',
    re: /\b(what states|which states|do you (serve|see patients in)|california|texas|florida|pennsylvania|availability|telehealth)\b/i,
    message:
      'Siya currently provides telehealth for adults in California, Texas, Pennsylvania, and Florida. Eligibility is confirmed when you schedule.',
    followUp: 'Looking for ADHD, primary care, weight, or something else in your state?',
    links: ['telehealth', 'meet_and_greet', 'pricing'],
  },
  {
    id: 'meet_greet',
    re: /\b(meet\s*&?\s*greet|book|appointment|schedule|intro call)\b/i,
    message:
      'You can book a free Meet & Greet — a short, non-clinical conversation to understand your needs and choose a next step. It isn’t emergency care and doesn’t prescribe medication.',
    followUp: 'Want the Meet & Greet link, or would you rather call or text us?',
    links: ['meet_and_greet', 'call_siya', 'text_siya'],
    event: 'booking_handoff',
  },
  {
    id: 'private_discussion',
    re: /\b(private (chat|message|discussion|conversation)|secure (medical )?chat|contact .{0,40}securely|securely|spruce|message (the )?(doctor|clinician|provider)|share (my )?(medical|health|clinical) (info|information|details|history)|before (i |we )?(pay|paying|booking a visit)|talk privately|clinical (message|messaging))\b/i,
    message:
      'If you’d like a more private conversation about your health before paying for a full visit, that isn’t something this website chat can do. You can book a free Meet & Greet, or download our partner app Spruce and join the Siya Health practice there for secure messaging.',
    followUp: 'Would you like the Meet & Greet booking link, or the Spruce join link?',
    links: ['meet_and_greet', 'spruce_practice', 'call_siya'],
    event: 'secure_chat_handoff',
  },
  {
    id: 'contact_phone',
    re: /\b(contact (the )?(team|clinic|doctor|siya)|talk to (a )?(clinician|provider)|call (siya|you|us)|text (siya|you|us)|phone number|phone|email (siya|you|us|the team)|how do i (reach|contact)|care@siya)\b/i,
    message:
      'You can reach a human on the Siya team by calling or texting (215) 445-1244, emailing care@siya.health, or booking a free Meet & Greet. For a more private clinical conversation, you can also join Siya on Spruce.',
    followUp: 'Prefer call, text, email, Meet & Greet, or Spruce?',
    links: ['call_siya', 'text_siya', 'email_siya', 'meet_and_greet', 'spruce_practice'],
    linkLimit: 5,
    event: 'booking_handoff',
  },
  {
    id: 'providers',
    re: /\b(who will i see|who do i see|who (would|will) i (meet|see)|which (doctor|provider|clinician)|provider|care team|who (are|is) (the )?(doctors|providers)|dr\.?\s*pandey|dr\.?\s*desai)\b/i,
    message:
      'You’ll see a licensed Siya clinician appropriate for your visit and state — the public care team pages list who’s on the team and what they focus on. Exact clinician assignment is confirmed at scheduling.',
    followUp: 'Want the care team page, or a Meet & Greet to talk through fit?',
    links: ['providers', 'meet_and_greet', 'about'],
  },
  {
    id: 'primary',
    re: /\b(primary care|urgent care|sick visit|fever|cold|flu|cough|sore throat|sinus|uti|earache|rash(?! cancer))\b/i,
    message:
      'For everyday concerns like fever or similar sick-visit needs, Siya publishes primary and urgent care telehealth information for adults in supported states. This chat can’t triage how urgent your symptoms are — if you feel seriously ill, call 911 or use emergency care.',
    followUp: 'Want the primary care page, a Meet & Greet, or our call/text number?',
    links: ['primary_care', 'meet_and_greet', 'call_siya'],
  },
  {
    id: 'labs_a1c',
    re: /\b(a1c|hba1c|blood sugar|hemoglobin a1c)\b/i,
    message:
      'Siya has a public labs page on A1c and blood sugar testing — educational context for when those markers may be discussed, not a personal lab interpretation.',
    followUp: 'Want the A1c labs page, the main labs hub, or a Meet & Greet?',
    links: ['labs_a1c', 'labs', 'meet_and_greet'],
    event: 'service_link_clicked',
  },
  {
    id: 'labs_iron',
    re: /\b(ferritin|iron (labs?|test|level|deficiency)|iron\b)/i,
    message:
      'Siya publishes iron and ferritin lab information for educational browsing. This chat can’t interpret your personal results.',
    followUp: 'Want the iron/ferritin page, the main labs hub, or a Meet & Greet?',
    links: ['labs_iron', 'labs', 'meet_and_greet'],
    event: 'service_link_clicked',
  },
  {
    id: 'labs_thyroid',
    re: /\b(tsh|thyroid|free t4|hypothyroid|hyperthyroid)\b/i,
    message:
      'Siya has a public thyroid labs page covering TSH and related markers — for orientation only, not personal result interpretation.',
    followUp: 'Want the thyroid labs page, the main labs hub, or a Meet & Greet?',
    links: ['labs_thyroid', 'labs', 'meet_and_greet'],
    event: 'service_link_clicked',
  },
  {
    id: 'labs',
    re: /\b(labs?|blood test|panel)\b/i,
    message:
      'Siya publishes physician-guided lab information and pathways on the labs pages. I can’t interpret individual lab results here, but I can get you to the right public resources.',
    followUp: 'Want the main labs page, a Meet & Greet, or the call/text number?',
    links: ['labs', 'meet_and_greet', 'call_siya'],
    event: 'service_link_clicked',
  },
  {
    id: 'womens',
    re: /\b(women'?s|midlife|menopause|perimenopause)\b/i,
    message:
      "Siya shares women’s midlife health service information for adults in supported states. Individual care still needs a medical evaluation.",
    followUp: 'Would you like the midlife page, or a Meet & Greet to talk about next steps?',
    links: ['womens_midlife', 'womens_health', 'meet_and_greet'],
  },
  {
    id: 'mens',
    re: /\b(men'?s health|testosterone|longevity|trt)\b/i,
    message:
      "Siya shares men’s health and longevity service information for adults in supported states. Individual care still needs a medical evaluation.",
    followUp: 'Want the men’s health page, labs info, or a Meet & Greet?',
    links: ['mens_health', 'labs', 'meet_and_greet'],
  },
  {
    id: 'weight',
    re: /\b(weight loss|glp-?1|semaglutide|ozempic|wegovy|metabolic)\b/i,
    message:
      'Siya publishes medical weight loss and metabolic health information. Medication or treatment recommendations are individualized and aren’t made in this chat.',
    followUp: 'Would you like the weight-loss page, a Meet & Greet, or the call/text number?',
    links: ['weight_loss', 'meet_and_greet', 'call_siya'],
  },
  {
    id: 'guides',
    re: /\b(health guides?|articles?|blog|faq|answers)\b/i,
    message:
      'You can browse Siya’s Health Guides and articles for educational information. They’re helpful context — not individualized medical advice.',
    followUp: 'Looking for ADHD guides, weight topics, or the full Health Guides hub?',
    links: ['health_guides', 'blog', 'siya_circle'],
  },
  {
    id: 'circle',
    re: /\b(siya circle|newsletter)\b/i,
    message:
      'Siya Circle is a free health education newsletter for general education only — not diagnosis, treatment, medication advice, or emergency care.',
    followUp: 'Would you like to join Siya Circle, or browse Health Guides first?',
    links: ['siya_circle', 'siya_circle_join', 'health_guides'],
  },
]

export function matchDeterministicIntent(text: string): IntentMatch | null {
  for (const intent of INTENT_PATTERNS) {
    if (intent.re.test(text)) {
      if (intent.id === 'human_handoff') {
        return { id: intent.id, confidence: 0.95, response: humanHandoffResponse() }
      }
      if (intent.id === 'callback_request') {
        const limit = intent.linkLimit || 3
        return {
          id: intent.id,
          confidence: 0.92,
          response: {
            state: 'verified',
            message: intent.message,
            followUp: intent.followUp,
            links: resolveLinks(intent.links, limit),
            citations: resolveLinks(intent.links.slice(0, 2)),
            refusalCategory: 'none',
            analyticsEvent: intent.event,
            showCallbackForm: true,
          },
        }
      }
      const isPrivate = intent.id === 'private_discussion'
      const limit = intent.linkLimit || 3
      return {
        id: intent.id,
        confidence: 0.9,
        response: {
          state: isPrivate ? 'restricted' : 'verified',
          message: intent.message,
          followUp: intent.followUp,
          links: resolveLinks(intent.links, limit),
          citations: resolveLinks(intent.links.slice(0, 2)),
          refusalCategory: isPrivate ? 'clinical' : 'none',
          analyticsEvent: intent.event,
        },
      }
    }
  }
  return null
}