/**
 * Canonical provider profiles — source of truth for generated pages and schema.
 * Credential truth merged from data/internal-provider-records.mjs at export.
 */
import { applyInternalRecords } from './internal-provider-records.mjs';
import { ADDITIONAL_PROVIDERS } from './providers-additional.mjs';
import { AVAILABLE_SERVICE_STATES } from './site-standards.mjs';
export { BASE_URL, BOOKING_LINK, PROFILE_LAST_UPDATED, resolveProviderPhoto } from './providers-core.mjs';
import { BASE_URL, BOOKING_LINK, PROFILE_LAST_UPDATED, resolveProviderPhoto } from './providers-core.mjs';

export const PROVIDERS = [
  {
    slug: 'dr-sneh-pandey',
    name: 'Dr. Sneh Pandey, MD',
    displayName: 'Dr. Sneh Pandey, MD',
    givenName: 'Sneh',
    familyName: 'Pandey',
    honorificPrefix: 'Dr.',
    honorificSuffix: 'MD',
    credentials: ['MD'],
    role: 'Medical Director',
    photo: 'assets/images/dr-sneh-pandey.png',
    altText: 'Dr. Sneh Pandey, MD',
    statesLicensed: ['California', 'Texas', 'Pennsylvania', 'Florida'],
    stateAbbreviations: ['CA', 'TX', 'PA', 'FL'],
    licenses: [],
    boardCertifications: [
      'Board Certified Internal Medicine',
      'Obesity Medicine',
      'ADHD-CCSP (ADHD Clinical Services Provider Program)',
    ],
    clinicalFocus: [
      '<strong>Adult ADHD evaluations</strong>—inattentive presentation, late diagnosis, “missed in childhood” patterns',
      '<strong>Executive dysfunction &amp; overwhelm</strong>—procrastination, time management, emotional flooding',
      '<strong>Metabolic health &amp; weight</strong>—when ADHD and nutrition, appetite, or GLP-1–based care intersect',
      '<strong>Coexisting stress, anxiety, or mood symptoms</strong>—screened carefully; treated or referred as appropriate',
    ],
    conditionsTreated: [
      'Adult ADHD',
      'Executive dysfunction',
      'Metabolic health',
      'Medical weight loss',
      'ADHD and weight overlap',
    ],
    services: [
      { label: 'ADHD evaluation & care', path: '/adhd-care' },
      { label: 'Medical weight loss', path: '/weight-loss-metabolic-health' },
      { label: 'Telehealth', path: '/telehealth' },
      { label: "Men's health", path: '/mens-health-longevity' },
    ],
    languages: [],
    education: null,
    residency: null,
    fellowship: null,
    professionalMemberships: [],
    carePhilosophy: [
      'Care here is <strong>structured, not rushed</strong>. We combine clinical interview, validated ADHD measures, and—when indicated—objective cognitive testing as <em>one part</em> of a broader assessment. No outcome is guaranteed; the goal is <strong>clarity</strong> and a plan that fits your life.',
      'If medication is on the table, discussions follow safety rules, state regulations, and your history—not trends from social media. If the better next step is therapy, primary care coordination, or further medical workup, we say so.',
    ],
    shortBio:
      'I’m Dr. Sneh Pandey. I built Siya Health for adults who suspect ADHD, carry shame about focus and follow-through, and want answers that respect both your intelligence and your nervous system—not another lecture about discipline.',
    longBio: [
      'You don’t need a provider who rushes a label—or one who dismisses you because you have a career, a degree, or a calendar that looks “put together.” You need someone who understands <strong>high-functioning burnout</strong>, the overlap between ADHD and metabolic health, and how hard it is to ask for help when you’ve always been “the responsible one.”',
      'My background spans complex medical care and <strong>obesity medicine</strong>; I’ve supported <strong>5,000+ patients</strong> in structured weight-loss programs. That matters when ADHD and appetite, energy, or metabolic risk show up in the same story.',
    ],
    patientFit: {
      deck: 'If you’re exhausted from performing “fine” while your brain says otherwise—you’re in the right place.',
      bullets: [
        '<strong>Systems thinking</strong>—ADHD, sleep, stress, weight, and mood often travel together; we look at the full picture.',
        '<strong>Evidence-based structure</strong>—validated screening tools and objective cognitive measures when appropriate—never a substitute for clinical judgment.',
        '<strong>Telehealth that still feels serious</strong>—thorough visits, clear documentation, transparent next steps.',
      ],
      sectionTitle: 'Why patients choose Dr. Pandey',
    },
    credentialChips: ['Internal Medicine', 'Obesity Medicine', 'ADHD-CCSP', 'Medical Director'],
    whatToExpect: [
      { title: 'Free ADHD screening', text: 'a short, honest check-in to see if evaluation is a sensible next step.' },
      { title: 'Meet & Greet', text: 'ask questions, learn how telehealth visits work, and see if Siya feels like a fit—no pressure.' },
      { title: 'Full evaluation', text: 'typically 60–90 minutes with a licensed, ADHD-CCSP–trained clinician; history, standardized tools, and discussion of diagnosis and options.' },
      { title: 'Ongoing care', text: 'follow-up tuned to medication monitoring, dose adjustments, or coaching referrals as your plan evolves.' },
    ],
    trustCards: [
      { title: 'Board-certified', text: 'Internal Medicine; Obesity Medicine specialist training; ADHD Clinical Services Provider Program (ADHD-CCSP).' },
      { title: 'States licensed', text: 'Telehealth appointments where eligible: <strong>California</strong>, <strong>Texas</strong>, <strong>Pennsylvania</strong>, and <strong>Florida</strong>—confirm at scheduling.' },
      { title: 'HIPAA-compliant', text: 'Secure video, documented visits, and practice policies aligned with telehealth standards.' },
    ],
    testimonials: [
      { quote: 'I finally stopped feeling lazy. The evaluation was thorough and kind—I wish I’d done it years ago.', cite: 'Adult ADHD patient, TX (verified)', needsVerification: true },
      { quote: 'He actually listened to how my weight and focus issues connected. Nothing felt gimmicky.', cite: 'Metabolic + ADHD follow-up patient (verified)', needsVerification: true },
    ],
    relatedLinksHtml:
      'Explore education: <a href="/blog/adhd-symptoms-overlooked">overlooked adult ADHD symptoms</a>, <a href="/blog/how-to-know-if-you-have-adhd-adult">signs it may be ADHD</a>, and <a href="/blog/online-adhd-diagnosis-texas">online diagnosis in Texas</a>.',
    inlineCtas: [
      { label: 'See ADHD evaluation & care', path: '/adhd-care', primary: true },
      { label: 'View pricing', path: '/membership-pricing', primary: false },
    ],
    finalCta: {
      title: 'Ready to stop guessing?',
      subtitle: 'Start with a free screening—or book a Meet & Greet if you want human answers first.',
    },
    disclaimer:
      'This page describes our practice philosophy and typical workflows; it is not a guarantee of any clinical outcome. Diagnosis and treatment require an individual evaluation. Eligibility, prescribing, and follow-up depend on medical history, state law, and clinician judgment.',
    telehealthDisclaimer: null,
    bookingLink: BOOKING_LINK,
    profileLastUpdated: PROFILE_LAST_UPDATED,
    credentialStatus: 'Credentials listed from practice records; full license verification pending per-state documentation.',
    credentialVerifiedBy: null,
    credentialVerifiedDate: null,
    acceptingNewPatients: null,
    reviewedContent: [],
    authoredContent: [],
    sameAs: [],
    npi: null,
    schema: {
      medicalSpecialty: ['Internal Medicine', 'Obesity Medicine', 'Adult ADHD'],
      knowsAbout: ['Adult ADHD', 'Executive dysfunction', 'Metabolic health', 'Medical weight loss', 'ADHD and weight overlap'],
      jobTitle: 'Medical Director',
    },
    seo: {
      title: 'Dr. Sneh Pandey, MD | Adult ADHD & Metabolic Care | Siya Health',
      description:
        'Meet Dr. Sneh Pandey—Medical Director at Siya Health. Board-certified Internal Medicine, Obesity Medicine, ADHD-CCSP. Structured adult ADHD evaluations and weight-inclusive telehealth in CA, TX, PA & FL.',
      focusLead: 'ADHD-first positioning—with room for the problems that often hide beside it.',
    },
    servicePageTagline: 'Adult ADHD & metabolic care',
    homepageRole: 'Internal Medicine Physician',
    homepageBio:
      'Focus on metabolic health, weight management, hormone optimization, ADHD, and helping patients improve overall physical and mental well-being.',
    claimsNeedingVerification: ['5,000+ patients in structured weight-loss programs', 'verified testimonial attributions'],
    showScreeningCta: true,
  },
  {
    slug: 'dr-natasha-desai',
    name: 'Dr. Natasha Desai, MD',
    displayName: 'Dr. Natasha Desai, MD',
    givenName: 'Natasha',
    familyName: 'Desai',
    honorificPrefix: 'Dr.',
    honorificSuffix: 'MD',
    credentials: ['MD'],
    role: 'Family & Behavioral Medicine Physician',
    photo: 'assets/images/dr-natasha-desai.png',
    altText: 'Dr. Natasha Desai, MD',
    statesLicensed: ['Texas', 'Florida'],
    stateAbbreviations: ['TX', 'FL'],
    licenses: [],
    boardCertifications: ['Family & Behavioral Medicine', 'ADHD-CCSP'],
    clinicalFocus: [
      '<strong>Adult ADHD</strong>—especially emotional dysregulation, rejection sensitivity patterns, and burnout',
      '<strong>Anxiety overlapping with attention symptoms</strong>—teasing out what needs what (without minimizing either)',
      '<strong>Stress, sleep, and coping</strong>—foundations that change how ADHD feels day to day',
      '<strong>Weight &amp; mental health</strong>—secondary support when habits and mood interact',
    ],
    conditionsTreated: [
      'Adult ADHD',
      'Anxiety',
      'Emotional dysregulation',
      'ADHD with anxiety overlap',
      'Behavioral health',
    ],
    services: [
      { label: 'ADHD care', path: '/adhd-care' },
      { label: 'Telehealth', path: '/telehealth' },
    ],
    languages: [],
    education: null,
    residency: null,
    fellowship: null,
    professionalMemberships: [],
    carePhilosophy: [
      'We start with a careful history: childhood patterns, current impairment, and what you’ve already tried. Validated scales and, when appropriate, objective measures support—not replace—clinical judgment. If medication is part of your plan, we discuss risks, benefits, and monitoring plainly.',
      'When therapy or specialist escalation is the better path, I help you understand <em>why</em>—so you leave with direction, not confusion.',
    ],
    shortBio:
      'I’m Dr. Natasha Desai. I work with adults who are tired of being told to breathe harder, plan better, or push through—when what they really need is a clinician who understands how <strong>attention, emotion, and stress</strong> tangle together.',
    longBio: [
      'My training bridges <strong>whole-person family medicine</strong> with <strong>behavioral medicine</strong>—so we can talk about ADHD without pretending your anxiety, sleep, or relationships live in a separate box.',
      'If you’ve been invalidated because you “seem fine,” or you oscillate between hyperfocus and shutdown, you’re not dramatic—you’re human, and your symptoms deserve a structured look.',
    ],
    patientFit: {
      deck: 'When ADHD rides along with anxiety, big feelings, and “I should be able to cope”',
      bullets: [
        '<strong>Warm, direct communication</strong>—no jargon walls; we name what’s happening and what we can test.',
        '<strong>Skills + medicine in context</strong>—behavioral strategies matter alongside appropriate medical options.',
        '<strong>Telehealth-friendly structure</strong>—clear visit goals, follow-up that respects your calendar.',
      ],
      sectionTitle: 'Why patients choose Dr. Desai',
    },
    credentialChips: ['Family Medicine', 'Behavioral Medicine', 'ADHD-CCSP'],
    whatToExpect: [
      { title: 'Screening', text: 'quick clarity on whether a full evaluation makes sense.' },
      { title: 'Meet & Greet', text: 'match expectations, ask anything awkward—you’ve probably been holding it in awhile.' },
      { title: 'Evaluation', text: 'structured interview + standardized tools; discussion of diagnosis and coexisting conditions.' },
      { title: 'Follow-up', text: 'medication titration, behavioral homework, or coordinated referrals as needed.' },
    ],
    trustCards: [
      { title: 'Training', text: 'Family medicine with behavioral medicine focus; ADHD-CCSP for structured ADHD care.' },
      { title: 'States licensed', text: 'Telehealth where eligible: <strong>Texas</strong> and <strong>Florida</strong>—confirm when you book.' },
      { title: 'Privacy', text: 'HIPAA-compliant visits; documentation you can use for pharmacies and continuity of care.' },
    ],
    testimonials: [
      { quote: 'She didn’t rush me. For the first time I felt like my anxiety and ADHD were both real—not competing for attention.', cite: 'Adult patient, FL (verified)', needsVerification: true },
      { quote: 'I cried after the visit—in a good way. Someone finally connected the dots.', cite: 'Behavioral health follow-up (verified)', needsVerification: true },
    ],
    relatedLinksHtml:
      'Dig deeper: <a href="/blog/adhd-symptoms-overlooked">overlooked symptoms</a>, <a href="/blog/is-online-adhd-diagnosis-legit">legitimate online diagnosis</a>, <a href="/blog/non-stimulant-adhd-medications-explained">non-stimulant options</a>.',
    inlineCtas: [
      { label: 'ADHD care overview', path: '/adhd-care', primary: true },
      { label: 'Read: “You’re not lazy”', path: '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd', primary: false },
    ],
    finalCta: {
      title: 'You don’t have to hold it together alone on camera',
      subtitle: 'Start with a free screening or talk to our team first—your pace.',
    },
    disclaimer:
      'This page is educational and descriptive of our practice style—not a promise of any specific diagnosis or treatment. Care is individualized; eligibility depends on state licensure, medical history, and clinical appropriateness.',
    telehealthDisclaimer: null,
    bookingLink: BOOKING_LINK,
    profileLastUpdated: PROFILE_LAST_UPDATED,
    credentialStatus: 'Credentials listed from practice records; full license verification pending per-state documentation.',
    credentialVerifiedBy: null,
    credentialVerifiedDate: null,
    acceptingNewPatients: null,
    reviewedContent: [],
    authoredContent: [],
    sameAs: [],
    npi: null,
    schema: {
      medicalSpecialty: ['Family Medicine', 'Behavioral Medicine', 'Adult ADHD'],
      knowsAbout: ['Adult ADHD', 'Anxiety', 'Emotional dysregulation', 'ADHD with anxiety overlap', 'Behavioral health'],
      jobTitle: 'Family & Behavioral Medicine Physician',
    },
    seo: {
      title: 'Dr. Natasha Desai, MD | Adult ADHD & Behavioral Medicine | Siya Health',
      description:
        'Meet Dr. Natasha Desai—Family & Behavioral Medicine physician at Siya Health. ADHD-CCSP. Adult ADHD with anxiety and emotional overlap via telehealth in TX & FL.',
      focusLead: 'ADHD at the center—with behavioral and emotional overlap addressed honestly.',
    },
    servicePageTagline: 'ADHD & behavioral medicine',
    homepageRole: 'Family Medicine Physician',
    homepageBio:
      'Focus on adult ADHD evaluation and treatment, behavioral health, and helping patients better understand symptoms affecting focus, productivity, and daily functioning.',
    claimsNeedingVerification: ['verified testimonial attributions'],
    showScreeningCta: true,
  },
  {
    slug: 'dr-swati-pandey',
    name: 'Dr. Swati Pandey, MD',
    displayName: 'Dr. Swati Pandey, MD',
    givenName: 'Swati',
    familyName: 'Pandey',
    honorificPrefix: 'Dr.',
    honorificSuffix: 'MD',
    credentials: ['MD'],
    role: 'Licensed Medical Provider — ADHD & Mental Health Care',
    photo: 'assets/images/dr-swati-pandey.png',
    altText: 'Dr. Swati Pandey, MD',
    statesLicensed: ['Pennsylvania'],
    stateAbbreviations: ['PA'],
    licenses: [],
    boardCertifications: ['ADHD-CCSP (ADHD Clinical Services Provider Program)'],
    clinicalFocus: [
      '<strong>Adult ADHD</strong>—especially when mood or anxiety clouds the picture',
      '<strong>Major depression, generalized anxiety, panic</strong>—differentiated from or treated alongside ADHD',
      '<strong>Treatment-resistant or “complicated” histories</strong>—multiple meds, gaps in care, diagnostic uncertainty',
      '<strong>Secondary support</strong>—sleep, substance use themes, and safety screening as standard—not optional',
    ],
    conditionsTreated: [
      'Adult ADHD',
      'Depression',
      'Anxiety',
      'Complex medication histories',
      'ADHD with anxiety and mood overlap',
    ],
    services: [
      { label: 'ADHD evaluation info', path: '/adhd-care' },
      { label: 'Telehealth', path: '/telehealth' },
    ],
    languages: [],
    education: null,
    residency: null,
    fellowship: null,
    professionalMemberships: [],
    carePhilosophy: [
      'Evaluations integrate developmental history, symptom course, family history, and standardized measures. When cognitive testing adds value, we use it as <em>data</em>, not a vending-machine diagnosis. Treatment plans respect your goals, contraindications, and what’s realistic in your week-to-week life.',
      'If controlled substances are not appropriate, you’ll understand why—and what alternatives exist.',
    ],
    shortBio:
      'I’m Dr. Swati Pandey. I help adults who’ve white-knuckled their way through careers and relationships while their minds race or go numb. If you’re wondering whether it’s ADHD, mood, both, or something else entirely, we slow down enough to think clearly—together.',
    longBio: [
      'Medical care here is about <strong>accurate diagnosis</strong>, safety, and a plan you can sustain within a primary care–led model. I’m comfortable with complexity: prior trials that “didn’t work,” trauma history, mood questions, or ADHD that only became obvious after life slowed down.',
      'Validation matters here. So does rigor. You’ll get both.',
    ],
    patientFit: {
      deck: 'When ADHD, anxiety, and depression stack—and you need clinical depth, not a sound bite',
      bullets: [
        '<strong>Clarity-first evaluations</strong>—ADHD-CCSP training with structured assessment for mood and anxiety overlap.',
        '<strong>Medication when appropriate, context always</strong>—risks, interactions, and follow-up spelled out.',
        '<strong>Coordination mindset</strong>—therapy referrals, PCP collaboration, or metabolic colleagues when your story needs a team.',
      ],
      sectionTitle: 'Why patients choose Dr. Swati Pandey',
    },
    credentialChips: ['Licensed Medical Provider', 'ADHD-CCSP', 'Mental Health Care'],
    whatToExpect: [
      { title: 'Screening', text: 'fast signal on whether a full ADHD evaluation is the right next step.' },
      { title: 'Meet & Greet', text: 'logistics, fit, and your questions—especially if you’ve had bad experiences elsewhere.' },
      { title: 'Comprehensive evaluation', text: 'sufficient time to unpack overlapping symptoms responsibly.' },
      { title: 'Ongoing care', text: 'monitoring, dose changes, or step-up/step-down plans with clear communication.' },
    ],
    trustCards: [
      { title: 'Scope', text: 'Licensed medical provider; ADHD-CCSP for structured ADHD assessment within primary care scope.' },
      { title: 'States licensed', text: 'Telehealth where eligible: <strong>Pennsylvania</strong>—confirm at scheduling.' },
      { title: 'Safety', text: 'HIPAA-compliant platform; crisis resources provided when urgent risk is present.' },
    ],
    testimonials: [
      { quote: 'She explained the overlap between my depression and attention issues without minimizing either. I left with a plan—not a fog.', cite: 'ADHD follow-up patient, PA (verified)', needsVerification: true },
      { quote: 'Finally someone who reads charts before throwing meds at symptoms.', cite: 'Complex medication history patient (verified)', needsVerification: true },
    ],
    relatedLinksHtml:
      'Further reading: <a href="/blog/how-adhd-medication-is-prescribed-online">how online prescribing is regulated</a>, <a href="/blog/is-adhd-medication-safe-long-term">long-term medication themes</a>, <a href="/blog/adhd-medication-side-effects-what-to-expect">side effects to know</a>.',
    inlineCtas: [
      { label: 'ADHD evaluation info', path: '/adhd-care', primary: true },
      { label: 'Medication options (education)', path: '/blog/adhd-medication-options-for-adults', primary: false },
    ],
    finalCta: {
      title: 'Your mind doesn’t have to feel this loud forever',
      subtitle: 'Screening is free. Meet & Greets are human. Evaluations are thorough.',
    },
    disclaimer:
      'This page describes our clinical philosophy, not a guarantee of outcomes. Treatment is individualized within licensed medical scope; some patients may require in-person care or higher levels of care than telehealth can offer. Emergency mental health crises require calling 988 or 911.',
    telehealthDisclaimer: 'Emergency mental health crises require calling 988 or 911.',
    bookingLink: BOOKING_LINK,
    profileLastUpdated: PROFILE_LAST_UPDATED,
    credentialStatus: 'Credentials listed from practice records; full license verification pending per-state documentation.',
    credentialVerifiedBy: null,
    credentialVerifiedDate: null,
    acceptingNewPatients: null,
    reviewedContent: [],
    authoredContent: [],
    sameAs: [],
    npi: null,
    schema: {
      medicalSpecialty: ['Adult ADHD', 'Mental Health', 'Primary Care'],
      knowsAbout: ['Adult ADHD', 'Depression', 'Anxiety', 'Complex medication histories', 'ADHD with anxiety and mood overlap'],
      jobTitle: 'Licensed Medical Provider — ADHD & Mental Health Care',
    },
    seo: {
      title: 'Dr. Swati Pandey, MD | Adult ADHD & Mental Health Care | Siya Health',
      description:
        'Meet Dr. Swati Pandey—licensed medical provider at Siya Health. ADHD-CCSP. Adult ADHD with depression, anxiety, and complex medication histories via telehealth in PA.',
      focusLead: 'ADHD in adults—with mood and anxiety overlap addressed within primary care scope.',
    },
    servicePageTagline: 'ADHD & behavioral health depth',
    homepageRole: 'Internal Medicine Physician',
    homepageBio:
      "Primary care and women's health experience with a focus on preventive care, chronic disease management, mental health, and whole-person wellness.",
    claimsNeedingVerification: ['verified testimonial attributions'],
    showScreeningCta: true,
  },
  ...ADDITIONAL_PROVIDERS,
]
  .map(applyInternalRecords)
  .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

export function getProviderBySlug(slug) {
  return PROVIDERS.find((p) => p.slug === slug) ?? null;
}

export function getAllProviders() {
  return PROVIDERS;
}

/** Service page → contracted provider slugs (clinical scope; state chips on cards). */
export const SERVICE_PROVIDER_SLUGS = {
  'adhd-care': ['dr-sneh-pandey', 'dr-natasha-desai', 'dr-swati-pandey', 'megan-wunderlich'],
  telehealth: [
    'dr-sneh-pandey',
    'dr-natasha-desai',
    'dr-swati-pandey',
    'dr-vanessa-urbina',
    'megan-wunderlich',
    'derek-timbs',
    'wendy-delgado',
  ],
  'weight-loss-metabolic-health': ['dr-sneh-pandey', 'dr-vanessa-urbina', 'derek-timbs', 'wendy-delgado'],
  'primary-urgent-care': ['dr-vanessa-urbina', 'dr-natasha-desai', 'dr-sneh-pandey'],
  'mens-health-longevity': ['dr-sneh-pandey', 'derek-timbs'],
};

/** Hub filter keys → service page keys */
export const HUB_FILTER_SERVICE_MAP = {
  adhd: 'adhd-care',
  'weight-loss': 'weight-loss-metabolic-health',
  'primary-care': 'primary-urgent-care',
  telehealth: 'telehealth',
};

export function getProviderServiceScopes(slug) {
  return Object.entries(SERVICE_PROVIDER_SLUGS)
    .filter(([, slugs]) => slugs.includes(slug))
    .map(([key]) => key);
}

export function getProviderHubFilterTags(provider) {
  const scopes = getProviderServiceScopes(provider.slug);
  const services = scopes
    .filter((s) => s !== 'mens-health-longevity')
    .map((s) => Object.entries(HUB_FILTER_SERVICE_MAP).find(([, v]) => v === s)?.[0])
    .filter(Boolean);
  return {
    states: provider.stateAbbreviations,
    services: [...new Set(services)],
  };
}

export function getProvidersForServicePage(serviceKey, { stateAbbr } = {}) {
  const slugs = SERVICE_PROVIDER_SLUGS[serviceKey] || [];
  let list = slugs.map((s) => getProviderBySlug(s)).filter(Boolean);
  if (stateAbbr) {
    list = list.filter((p) => p.stateAbbreviations.includes(stateAbbr));
  }
  return list;
}

export function bookingLinkWithAttribution(providerSlug, surface = 'profile') {
  const sep = BOOKING_LINK.includes('?') ? '&' : '?';
  return `${BOOKING_LINK}${sep}utm_source=siya&utm_medium=provider&utm_campaign=${encodeURIComponent(providerSlug)}&utm_content=${encodeURIComponent(surface)}`;
}

export function stateChipLabel(provider) {
  return provider.stateAbbreviations.join(', ');
}

/** Siya Healthcare, PLLC service footprint — excludes license-only states (e.g. OH on Derek). */
export function providerServiceStates(provider) {
  return provider.statesLicensed.filter((state) => AVAILABLE_SERVICE_STATES.includes(state));
}

export function toEntityGraphProvider(provider) {
  const photo = resolveProviderPhoto(provider);
  const entityId =
    provider.providerType === 'physician'
      ? `${BASE_URL}/providers/${provider.slug}#physician`
      : `${BASE_URL}/providers/${provider.slug}#practitioner`;
  return {
    '@id': entityId,
    slug: provider.slug,
    url: `${BASE_URL}/providers/${provider.slug}`,
    name: provider.name,
    givenName: provider.givenName,
    familyName: provider.familyName,
    honorificPrefix: provider.honorificPrefix || undefined,
    honorificSuffix: provider.honorificSuffix || undefined,
    providerType: provider.providerType,
    providerCategory: provider.providerCategory,
    jobTitle: provider.schema.jobTitle,
    worksFor: { '@id': `${BASE_URL}/#organization` },
    medicalSpecialty: provider.schema.medicalSpecialty,
    hasCredential: provider.boardCertifications,
    statesLicensed: provider.statesLicensed,
    serviceStates: providerServiceStates(provider),
    conditionsTreated: provider.conditionsTreated,
    npi: provider.npi || undefined,
    image: `${BASE_URL}/${photo.src}`,
    photoStatus: provider.photoStatus,
  };
}
