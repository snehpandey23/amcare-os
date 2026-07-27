import type { GuideLink, LinkRecord } from './types'

/**
 * Fixed link registry. The model may only return link IDs from this map.
 * Application code resolves IDs → URLs. Never invent URLs in prompts or replies.
 */
export const LINK_REGISTRY: Record<string, LinkRecord> = {
    homepage: {
        id: 'homepage',
        label: 'Homepage',
        url: 'https://www.siya.health/',
        kind: 'service'
    },
    about: {
        id: 'about',
        label: 'About Siya Health',
        url: 'https://www.siya.health/about',
        kind: 'education'
    },
    adhd_care: {
        id: 'adhd_care',
        label: 'ADHD Care',
        url: 'https://www.siya.health/adhd-care',
        kind: 'service'
    },
    adhd_screening: {
        id: 'adhd_screening',
        label: 'ADHD Screening',
        url: 'https://www.siya.health/adhd-screening',
        kind: 'screening'
    },
    adult_adhd_california: {
        id: 'adult_adhd_california',
        label: 'Adult ADHD Care in California',
        url: 'https://www.siya.health/adult-adhd-california',
        kind: 'service'
    },
    fatigue: {
        id: 'fatigue',
        label: 'Fatigue: when tired stops being normal',
        url: 'https://www.siya.health/fatigue',
        kind: 'education'
    },
    brain_fog: {
        id: 'brain_fog',
        label: 'Brain Fog: when thinking feels slower',
        url: 'https://www.siya.health/brain-fog',
        kind: 'education'
    },
    executive_dysfunction: {
        id: 'executive_dysfunction',
        label: 'Executive Dysfunction & ADHD',
        url: 'https://www.siya.health/blog/executive-dysfunction-adhd',
        kind: 'education'
    },
    adhd_evaluation_cost: {
        id: 'adhd_evaluation_cost',
        label: 'ADHD Evaluation Cost',
        url: 'https://www.siya.health/adhd-evaluation-cost',
        kind: 'service'
    },
    primary_care: {
        id: 'primary_care',
        label: 'Primary Care',
        url: 'https://www.siya.health/primary-care',
        kind: 'service'
    },
    primary_urgent_care: {
        id: 'primary_urgent_care',
        label: 'Primary & Urgent Care',
        url: 'https://www.siya.health/primary-urgent-care',
        kind: 'service'
    },
    preventive_care: {
        id: 'preventive_care',
        label: 'Preventive Care',
        url: 'https://www.siya.health/preventive-care',
        kind: 'service'
    },
    telehealth: {
        id: 'telehealth',
        label: 'Telehealth',
        url: 'https://www.siya.health/telehealth',
        kind: 'service'
    },
    service_availability: {
        id: 'service_availability',
        label: 'Telehealth availability by state',
        url: 'https://www.siya.health/telehealth',
        kind: 'service'
    },
    labs: {
        id: 'labs',
        label: 'Labs & Blood Tests',
        url: 'https://www.siya.health/labs',
        kind: 'service'
    },
    labs_preventive: {
        id: 'labs_preventive',
        label: 'Preventive & wellness labs',
        url: 'https://www.siya.health/labs/preventive',
        kind: 'service'
    },
    labs_thyroid: {
        id: 'labs_thyroid',
        label: 'Thyroid / TSH Labs',
        url: 'https://www.siya.health/labs/thyroid',
        kind: 'service'
    },
    labs_a1c: {
        id: 'labs_a1c',
        label: 'A1c & Blood Sugar Labs',
        url: 'https://www.siya.health/labs/a1c-blood-sugar',
        kind: 'service'
    },
    labs_iron: {
        id: 'labs_iron',
        label: 'Iron & Ferritin Labs',
        url: 'https://www.siya.health/labs/iron-ferritin',
        kind: 'service'
    },
    labs_cbc: {
        id: 'labs_cbc',
        label: 'CBC',
        url: 'https://www.siya.health/labs/cbc',
        kind: 'service'
    },
    labs_cmp: {
        id: 'labs_cmp',
        label: 'CMP',
        url: 'https://www.siya.health/labs/cmp',
        kind: 'service'
    },
    labs_lipid: {
        id: 'labs_lipid',
        label: 'Lipid Panel',
        url: 'https://www.siya.health/labs/lipid-panel',
        kind: 'service'
    },
    labs_vitamin_b12: {
        id: 'labs_vitamin_b12',
        label: 'Vitamin B12',
        url: 'https://www.siya.health/labs/vitamin-b12',
        kind: 'service'
    },
    labs_vitamin_d: {
        id: 'labs_vitamin_d',
        label: 'Vitamin D',
        url: 'https://www.siya.health/labs/vitamin-d',
        kind: 'service'
    },
    womens_midlife: {
        id: 'womens_midlife',
        label: "Women's Midlife Health",
        url: 'https://www.siya.health/womens-midlife-health',
        kind: 'service'
    },
    womens_health: {
        id: 'womens_health',
        label: "Women's Health",
        url: 'https://www.siya.health/womens-health',
        kind: 'service'
    },
    mens_health: {
        id: 'mens_health',
        label: "Men's Health & Longevity",
        url: 'https://www.siya.health/mens-health-longevity',
        kind: 'service'
    },
    weight_loss: {
        id: 'weight_loss',
        label: 'Weight Loss & Metabolic Health',
        url: 'https://www.siya.health/weight-loss-metabolic-health',
        kind: 'service'
    },
    pricing: {
        id: 'pricing',
        label: 'Pricing',
        url: 'https://www.siya.health/pricing',
        kind: 'service'
    },
    health_guides: {
        id: 'health_guides',
        label: 'Health Guides',
        url: 'https://www.siya.health/answers',
        kind: 'education'
    },
    blog: {
        id: 'blog',
        label: 'Articles',
        url: 'https://www.siya.health/blog/all',
        kind: 'education'
    },
    providers: {
        id: 'providers',
        label: 'Care Team',
        url: 'https://www.siya.health/providers',
        kind: 'education'
    },
    provider_sneh: {
        id: 'provider_sneh',
        label: 'Dr. Sneh Pandey',
        url: 'https://www.siya.health/providers/dr-sneh-pandey',
        kind: 'education'
    },
    provider_swati: {
        id: 'provider_swati',
        label: 'Dr. Swati Pandey',
        url: 'https://www.siya.health/providers/dr-swati-pandey',
        kind: 'education'
    },
    provider_natasha: {
        id: 'provider_natasha',
        label: 'Dr. Natasha Desai',
        url: 'https://www.siya.health/providers/dr-natasha-desai',
        kind: 'education'
    },
    provider_vanessa: {
        id: 'provider_vanessa',
        label: 'Dr. Vanessa Urbina',
        url: 'https://www.siya.health/providers/dr-vanessa-urbina',
        kind: 'education'
    },
    provider_megan: {
        id: 'provider_megan',
        label: 'Megan Wunderlich, FNP-C',
        url: 'https://www.siya.health/providers/megan-wunderlich',
        kind: 'education'
    },
    provider_derek: {
        id: 'provider_derek',
        label: 'Derek Timbs, FNP-BC',
        url: 'https://www.siya.health/providers/derek-timbs',
        kind: 'education'
    },
    provider_wendy: {
        id: 'provider_wendy',
        label: 'Wendy Delgado, PA-C',
        url: 'https://www.siya.health/providers/wendy-delgado',
        kind: 'education'
    },
    secure_chat: {
        id: 'secure_chat',
        label: 'Join Siya on Spruce',
        url: 'https://spruce.care/siyahealth',
        kind: 'secure'
    },
    /** @deprecated alias — same Spruce practice join link */ spruce_practice: {
        id: 'spruce_practice',
        label: 'Download Spruce & join Siya',
        url: 'https://spruce.care/siyahealth',
        kind: 'secure'
    },
    call_siya: {
        id: 'call_siya',
        label: 'Call (215) 445-1244',
        url: 'tel:+12154451244',
        kind: 'contact'
    },
    text_siya: {
        id: 'text_siya',
        label: 'Text (215) 445-1244',
        url: 'sms:+12154451244',
        kind: 'contact'
    },
    email_siya: {
        id: 'email_siya',
        label: 'Email care@siya.health',
        url: 'mailto:care@siya.health',
        kind: 'contact'
    },
    meet_and_greet: {
        id: 'meet_and_greet',
        label: 'Book Free Meet & Greet',
        url: 'https://www.siya.health/redirect/meet-greet',
        kind: 'booking'
    },
    book_appointment: {
        id: 'book_appointment',
        label: 'Book Appointment',
        url: 'https://www.siya.health/book-appointment',
        kind: 'booking'
    },
    siya_circle: {
        id: 'siya_circle',
        label: 'Siya Circle',
        url: 'https://www.siya.health/siya-circle',
        kind: 'education'
    },
    siya_circle_join: {
        id: 'siya_circle_join',
        label: 'Join Siya Circle',
        url: 'https://form.carepatron.com/Forms/XRMFIPAWuXhTlncGx',
        kind: 'contact'
    },
    prescriptions: {
        id: 'prescriptions',
        label: 'Prescriptions',
        url: 'https://www.siya.health/prescriptions',
        kind: 'education'
    }
};
export const ALLOWED_LINK_IDS = Object.keys(LINK_REGISTRY)

export function resolveLinks(ids: string[], limit = 3): GuideLink[] {
  const out: GuideLink[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (!id || seen.has(id)) continue
    const rec = LINK_REGISTRY[id]
    if (!rec) continue
    seen.add(id)
    out.push({ id: rec.id, label: rec.label, url: rec.url })
    if (out.length >= limit) break
  }
  return out
}

export function linkByPath(path: string): GuideLink | null {
  const normalized = path.replace(/\/$/, '') || '/'
  for (const rec of Object.values(LINK_REGISTRY)) {
    const recPath = rec.url.replace('https://www.siya.health', '').replace(/\/$/, '') || '/'
    if (recPath === normalized) {
      return { id: rec.id, label: rec.label, url: rec.url }
    }
  }
  return null
}

export const QUICK_ACTIONS = [
    {
        id: 'adhd_care',
        label: 'ADHD care',
        prompt: 'I want to learn about ADHD care',
        linkHint: 'adhd_care'
    },
    {
        id: 'adhd_screening',
        label: 'Free ADHD screening',
        prompt: 'How do I take the ADHD screening?',
        linkHint: 'adhd_screening'
    },
    {
        id: 'pricing',
        label: 'Pricing',
        prompt: 'What is published pricing at Siya Health?',
        linkHint: 'pricing'
    },
    {
        id: 'meet_and_greet',
        label: 'Meet & Greet',
        prompt: 'How do I book a free Meet & Greet?',
        linkHint: 'meet_and_greet'
    },
    {
        id: 'contact',
        label: 'Call or text us',
        prompt: 'How do I call or text Siya Health?',
        linkHint: 'call_siya'
    },
    {
        id: 'human',
        label: 'Talk to a human',
        prompt: 'I want to talk to a human',
        linkHint: 'call_siya'
    },
    {
        id: 'labs',
        label: 'Labs',
        prompt: 'Where can I learn about labs and blood tests?',
        linkHint: 'labs'
    }
];
