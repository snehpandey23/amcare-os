/**
 * Patient-facing copy for /providers hub cards — founder audit positioning.
 * Profile pages use data/providers.mjs; hub cards use this overlay.
 */
export const PROVIDER_HUB_PRESENTATION = {
  'dr-sneh-pandey': {
    role: 'Medical Director · Internal Medicine Physician',
    credentials:
      'Board-certified Internal Medicine · Diplomate, American Board of Obesity Medicine · ADHD-CCSP',
    focus: [
      'Adult ADHD evaluations',
      'Obesity medicine and metabolic health',
      'Chronic care and whole-person wellness',
    ],
    description:
      'Dr. Pandey focuses on structured evaluations, personalized care plans, and helping patients understand how focus, weight, energy, and long-term health connect.',
  },
  'dr-vanessa-urbina': {
    role: 'Family Medicine Physician',
    focus: [
      'Primary care',
      'Family medicine',
      'Adult ADHD',
      'Medical weight loss and lifestyle medicine',
    ],
    description:
      'Dr. Urbina brings family medicine experience and runs her own comprehensive local practice. She supports patients through primary care, ADHD care, mental health concerns, and weight-management needs.',
  },
  'dr-natasha-desai': {
    role: 'Family Medicine Physician',
    credentials: 'ADHD-CCSP',
    focus: [
      'Adult ADHD',
      'Behavioral health',
      'Anxiety and emotional regulation',
      'Family medicine',
    ],
    description:
      'Dr. Desai brings family medicine experience and ADHD-focused training, with a supportive approach for adults whose attention symptoms overlap with anxiety, stress, sleep, or emotional overwhelm.',
  },
  'dr-swati-pandey': {
    role: 'Internal Medicine Physician',
    focus: [
      "Primary care",
      "Women's health",
      'Mental health',
      'Adult ADHD and complex medication histories',
    ],
    description:
      "Dr. Swati Pandey supports adults seeking thoughtful primary care, with particular sensitivity to women's health, mood, focus, PCOS-related concerns, and long-term wellness.",
  },
  'megan-wunderlich': {
    role: 'Family Nurse Practitioner',
    focus: ['Primary care', 'Telehealth', 'Mental health', 'Adult ADHD support'],
    description:
      "Megan supports patients through telehealth visits for primary care, mental health concerns, and ADHD-related needs, working within Siya Health's physician-led care model.",
  },
  'derek-timbs': {
    role: 'Family Nurse Practitioner',
    focus: [
      'Medical weight loss',
      "Men's health",
      'Hormone support',
      'Longevity and metabolic health',
    ],
    description:
      "Derek brings experience in weight management, men's health, metabolic care, and lifestyle-focused wellness, with a practical approach to improving energy, body composition, and long-term health.",
  },
  'wendy-delgado': {
    role: 'Physician Assistant',
    focus: ['Weight Loss', 'Metabolic Care'],
    description:
      'Wendy supports patients through telehealth visits for medical weight loss and metabolic care within Siya Health\'s physician-led model.',
  },
};

export function getProviderHubPresentation(slug) {
  return PROVIDER_HUB_PRESENTATION[slug] ?? null;
}
