/**
 * Workplace / working-professionals blog posts — employee guides + HR/employer primers.
 * Run before apply-workplace-seo-cluster.mjs and seo-build.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const DEFAULT_DATE = '2026-09-01';

const POSTS = [
  {
    slug: 'sleep-and-focus-at-work',
    title: 'Sleep, Focus, and Cognitive Load at Work | Siya Health',
    headline: 'Sleep, Focus, and Cognitive Load at Work',
    breadcrumbShort: 'Sleep & Focus at Work',
    metaDescription:
      'Poor sleep and heavy cognitive load can look like ADHD or burnout at work. Learn when to treat sleep as a medical issue—not just a schedule problem.',
    meta: 'Sleep & energy · Supporting guide',
    hubHref: '/fatigue',
    hubLabel: 'Fatigue',
    parentEntity: '/fatigue',
    cluster: 'fatigue',
    lead: 'When you cannot think straight after a short night—or after weeks of “fine” sleep that never restores you—work becomes the place you notice it first.',
    body: `
            <p>Demanding jobs compress sleep, blur boundaries, and reward pushing through. That is situational strain. But when focus reliably crashes at the same time each day, or sleep never feels restorative, a medical workup may be more useful than another productivity hack.</p>
            <h2>How sleep problems show up at work</h2>
            <ul>
              <li>Reading the same paragraph twice without retaining it</li>
              <li>Meeting fatigue by mid-afternoon despite caffeine</li>
              <li>Irritability or impatience that is new for you</li>
              <li>Weekend “catch-up” sleep that still leaves you tired Monday</li>
              <li>Snoring, gasping, or restless legs reported by a partner</li>
            </ul>
            <h2>Sleep debt versus sleep disorders</h2>
            <p>One bad week is different from months of non-restorative sleep. Insomnia, sleep apnea, shift-work disorder, mood overlap, and medication effects can all disrupt sleep architecture—so “enough hours in bed” still is not enough recovery.</p>
            <h2>Cognitive load is not the same as laziness</h2>
            <p>Complex work taxes working memory and task switching. When sleep or underlying fatigue is impaired, the same workload feels impossible. That pattern deserves evaluation—not shame or a standing-desk upgrade alone.</p>
            <h2>What primary care can sort</h2>
            <p><a href="/fatigue">Fatigue</a> and <a href="/brain-fog">brain fog</a> often travel together. A clinician can review sleep history, screen for apnea risk, check labs when appropriate, and decide whether referral or treatment fits. <a href="/answers/adhd-workplace-accommodations">Workplace accommodations</a> are a separate HR/legal conversation once you understand the clinical picture.</p>
            <p><em>Educational only—not occupational medicine or disability advice.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/fatigue">Fatigue</a>
                → <a href="/brain-fog">Brain Fog</a>
                → <a href="/primary-care">Primary Care</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Can poor sleep mimic ADHD at work?',
        'Yes—sleep deprivation impairs attention, impulse control, and working memory. Evaluation should consider sleep before assuming a lifelong attention disorder.',
      ],
      [
        'Should I use melatonin or apps before seeing a clinician?',
        'Short-term tools can help situational insomnia. Persistent non-restorative sleep, snoring, or daytime sleepiness warrant medical assessment—not endless self-experimentation.',
      ],
      [
        'Does remote work worsen sleep and focus?',
        'It can blur wake/sleep cues and reduce daylight exposure. It can also remove commute fatigue. The impact depends on your habits and any underlying sleep disorder.',
      ],
    ],
    relatedHub: '/telehealth',
    relatedHubLabel: 'Telehealth fatigue & sleep care',
  },
  {
    slug: 'chronic-fatigue-and-work-performance',
    title: 'Chronic Fatigue and Work Performance: When Exhaustion Won\'t Lift | Siya Health',
    headline: 'Chronic Fatigue and Work Performance',
    breadcrumbShort: 'Fatigue & Work Performance',
    metaDescription:
      'Chronic fatigue at work—unrelenting exhaustion, crash cycles, brain fog—may have medical causes. Learn framing for evaluation before blaming burnout alone.',
    meta: 'Fatigue · Supporting guide',
    hubHref: '/fatigue',
    hubLabel: 'Fatigue',
    parentEntity: '/fatigue',
    cluster: 'fatigue',
    lead: 'When rest, weekends, and vacations no longer restore you—and performance keeps slipping—chronic fatigue deserves a structured medical look, not only a workload reset.',
    body: `
            <p>Burnout is real. So are iron deficiency, thyroid disease, sleep apnea, mood conditions, long illness recovery, and medication side effects. Chronic fatigue at work is often the first place the body stops compensating.</p>
            <h2>Patterns that suggest more than “busy season”</h2>
            <ul>
              <li>Post-exertional crashes after routine tasks</li>
              <li>Brain fog paired with <a href="/blog/brain-fog-at-work">concentration problems on the job</a></li>
              <li>Exercise that used to energize you now flattens you</li>
              <li>Months of unrefreshing sleep</li>
              <li>Symptoms that predate a single stressful project</li>
            </ul>
            <h2>Why “push through” stops working</h2>
            <p>Short bursts of overwork are survivable when recovery mechanisms work. Chronic physiological fatigue reduces cognitive reserve—so the same role requires disproportionate effort, which looks like disengagement from the outside.</p>
            <h2>Medical evaluation is not giving up</h2>
            <p><a href="/fatigue">Fatigue evaluation</a> through <a href="/primary-care">primary care</a> can identify treatable contributors. That is separate from workplace performance plans or HR conversations—though clearer clinical information can inform those decisions later.</p>
            <h2>For HR and benefits teams</h2>
            <p>Structured access to screening and physician-led follow-up can help employees get answers sooner. <a href="/employers">Employer program overview</a> describes partnership pathways; individual employees can also <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a> without a contract.</p>
            <p><em>Educational only—not occupational medicine, disability determination, or legal guidance.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/fatigue">Fatigue</a>
                → <a href="/brain-fog">Brain Fog</a>
                → <a href="/primary-care">Primary Care</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Is chronic fatigue the same as ME/CFS?',
        'Not automatically. “Chronic fatigue” describes a symptom pattern; specific syndromes require defined criteria and specialist input. Primary care helps sort common causes first.',
      ],
      [
        'Should I disclose fatigue to my manager?',
        'That is an HR and legal decision. Clinically, understanding your own diagnosis and options first usually leads to clearer choices about disclosure and accommodations.',
      ],
      [
        'Can labs be normal and fatigue still be real?',
        'Yes. Normal basic labs do not rule out sleep disorders, mood overlap, post-viral recovery, or conditions needing targeted testing. Persistent symptoms still warrant follow-up.',
      ],
    ],
    relatedHub: '/fatigue',
    relatedHubLabel: 'Fatigue evaluation hub',
  },
  {
    slug: 'cognitive-health-benefits-for-employers',
    datePublished: '2026-09-02',
    audience: 'employer',
    title: 'Cognitive Health Benefits for Employers: What Clinical Programs Include | Siya Health',
    headline: 'Cognitive Health Benefits for Employers',
    breadcrumbShort: 'Cognitive Health Benefits',
    metaDescription:
      'HR and benefits leaders: learn what physician-led cognitive health programs include—screening, evaluation, and follow-up—and how they differ from wellness apps.',
    meta: 'Employers · HR & benefits guide',
    hubHref: '/employers',
    hubLabel: 'Employers',
    parentEntity: '/employers',
    cluster: 'workplace',
    lead: 'Benefits teams are asked to solve focus, fatigue, and attention problems at work. The hard part is knowing what counts as clinical care—and what is only a perk.',
    body: `
            <p>“Cognitive health” shows up in vendor decks, EAP renewals, and leadership offsites. Some offerings are coaching apps. Others are physician-led telehealth with structured screening and evaluation pathways. The difference matters for compliance, employee trust, and whether anyone actually gets a diagnosis—or only a dashboard.</p>
            <h2>Three layers HR should separate</h2>
            <ul>
              <li><strong>Screening</strong> — structured questionnaires or markers that flag patterns (attention, sleep, stress). Screening is not diagnosis.</li>
              <li><strong>Clinical evaluation</strong> — physician-led history, functional review, and medical decision-making when follow-up is appropriate.</li>
              <li><strong>Ongoing care</strong> — treatment, monitoring, and documentation within the clinician–patient relationship—not an employer report.</li>
            </ul>
            <h2>What structured clinical programs can include</h2>
            <p>Programs built for working adults may offer licensed telehealth in eligible states, concierge-supported scheduling, and pathways for ADHD-related attention patterns, sleep disruption, and fatigue that affects focus. That is different from a meditation library or a generic “mental fitness” score.</p>
            <p>Siya Health’s <a href="/employers">employer program overview</a> describes partnership pathways for HR teams. Individual employees can also use standard patient booking without a contract.</p>
            <h2>What responsible programs do not do</h2>
            <ul>
              <li>Share individual diagnoses, medications, or visit notes with employers without appropriate patient authorization</li>
              <li>Replace occupational medicine, disability determination, or legal accommodation processes</li>
              <li>Guarantee outcomes—clinical results vary by individual</li>
              <li>Publish one-size-fits-all B2B pricing before pilot design (packaging is finalized with early partners)</li>
            </ul>
            <h2>Wellness apps versus physician-led telehealth</h2>
            <p>Apps can support habits and stress management. They generally cannot prescribe, interpret labs, or document conditions for accommodations. When employees need answers about ADHD, sleep apnea risk, or persistent fatigue, a licensed clinician—not an algorithm—should be in the loop.</p>
            <h2>Licensed states and eligibility</h2>
            <p>Siya Health provides adult telehealth in California, Texas, Pennsylvania, and Florida. Eligibility is confirmed at scheduling based on where the employee is located at the time of visit.</p>
            <p><em>Educational only—for HR and benefits planning. Not medical, legal, or benefits advice. Program design varies by partnership stage.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/employers">Employers</a>
                → <a href="/answers/adhd-workplace-accommodations">Workplace accommodations</a>
                → <a href="/adhd-care">ADHD care</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Is cognitive health the same as mental health benefits?',
        'They overlap but are not identical. Cognitive health in a workplace context often includes attention, sleep, and fatigue patterns that affect job performance—some of which are medical and some situational. Benefits design should clarify which vendor handles clinical care versus coaching.',
      ],
      [
        'Can employers receive employee screening results?',
        'Responsible clinical programs treat individual health information as part of the clinician–patient relationship. Employers typically receive program-level implementation information—not individual results—unless law and patient authorization require otherwise.',
      ],
      [
        'Does Siya publish employer pricing on the website?',
        'No. B2B packaging and pricing are finalized with early partners. Submit an inquiry on the employers page for what is available for your organization size and goals.',
      ],
    ],
    relatedArticles: [
      { href: '/blog/adhd-accommodations-hr-primer', label: 'ADHD Accommodations: An HR Primer' },
      { href: '/blog/focus-fatigue-workforce-issue', label: 'Focus & Fatigue as a Workforce Issue' },
      { href: '/answers/adhd-workplace-accommodations', label: 'Workplace Accommodations Guide' },
    ],
    relatedHub: '/employers',
    relatedHubLabel: 'Employer cognitive health programs',
  },
  {
    slug: 'adhd-accommodations-hr-primer',
    datePublished: '2026-09-02',
    audience: 'employer',
    title: 'ADHD Accommodations at Work: An HR Primer (Clinical vs Legal) | Siya Health',
    headline: 'ADHD Accommodations at Work: An HR Primer',
    breadcrumbShort: 'ADHD Accommodations HR Primer',
    metaDescription:
      'HR teams: separate the clinical documentation employees may need from the legal accommodation process. Educational framing—not legal or medical advice.',
    meta: 'Employers · HR & benefits guide',
    hubHref: '/employers',
    hubLabel: 'Employers',
    parentEntity: '/employers',
    cluster: 'workplace',
    lead: 'When an employee mentions ADHD or focus problems, HR is often the first desk—not the clinician. Knowing where clinical documentation ends and accommodation law begins saves confusion on all sides.',
    body: `
            <p>Workplace accommodations for ADHD are a coordination problem. Employees need accurate clinical information. Employers need consistent, lawful processes. Clinicians document conditions and functional limitations within the treatment relationship—they do not manage your ADA interactive process or decide reasonable accommodations.</p>
            <h2>Clinical documentation: what it is</h2>
            <p>After a proper evaluation, a licensed clinician may document a diagnosis, treatment plan, and functional impacts relevant to work—extended focus time, reduced distractions, flexible scheduling, and similar needs. That documentation supports the employee’s accommodation request; it is not a prescription for what HR must approve.</p>
            <p>Our detailed guide for employees and HR teams: <a href="/answers/adhd-workplace-accommodations">workplace accommodations &amp; clinical documentation</a>.</p>
            <h2>Legal and HR process: what it is</h2>
            <ul>
              <li>Interactive dialogue between employer and employee</li>
              <li>Assessment of essential job functions and business operations</li>
              <li>Documentation of requests, offers, and denials per company policy and applicable law</li>
              <li>Coordination with legal counsel when cases are complex</li>
            </ul>
            <p>Siya Health does not provide legal advice or act as an employer’s ADA consultant. Partnership conversations focus on access to physician-led care—not on managing HR casework.</p>
            <h2>Common HR questions—clinical angle only</h2>
            <p><strong>“Can online ADHD evaluation support accommodations?”</strong> Proper documentation from a licensed clinician—telehealth or in person—is often accepted for accommodation requests. Employers may have their own forms and renewal timelines; check internal policy.</p>
            <p><strong>“Should we require a specific test?”</strong> Clinical standards vary. Responsible evaluation includes history and functional impairment review—not a single checklist score in isolation.</p>
            <p><strong>“What if sleep or fatigue looks like ADHD?”</strong> See <a href="/blog/sleep-and-focus-at-work">sleep and focus at work</a> and <a href="/blog/brain-fog-at-work">brain fog at work</a>. Evaluation should consider overlapping causes before assumptions harden on either side.</p>
            <h2>How structured employer programs help—without replacing HR</h2>
            <p>Benefits teams can offer clearer pathways to screening and physician-led follow-up so employees get answers sooner. That may reduce ad hoc crises—but it does not remove the employer’s obligation to run lawful accommodation processes. <a href="/employers">Request employer information</a> for program scope; employees can <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a> individually.</p>
            <p><em>Educational only—not legal, HR, or medical advice. Consult counsel for accommodation decisions.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/answers/adhd-workplace-accommodations">Accommodations guide</a>
                → <a href="/adhd-care">ADHD care</a>
                → <a href="/employers">Employers</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Does Siya Health talk to our HR team about individual employees?',
        'No—not without appropriate patient authorization. Employer partnerships focus on program access and operations, not individual clinical details.',
      ],
      [
        'Can managers request proof of ADHD diagnosis?',
        'That is an HR and legal question about what documentation is appropriate during an accommodation process. Clinicians provide medical documentation to the patient; how it is shared with employers follows policy and law.',
      ],
      [
        'Is screening the same as documentation for accommodations?',
        'No. Screening identifies patterns that may warrant follow-up. Accommodations typically require clinical evaluation and documented functional impact—not a self-reported screen alone.',
      ],
    ],
    relatedArticles: [
      { href: '/answers/adhd-workplace-accommodations', label: 'Workplace Accommodations & Clinical Documentation' },
      { href: '/blog/cognitive-health-benefits-for-employers', label: 'Cognitive Health Benefits for Employers' },
      { href: '/blog/executive-dysfunction-adhd', label: 'Executive Dysfunction in Adult ADHD' },
    ],
    relatedHub: '/employers',
    relatedHubLabel: 'Employer cognitive health programs',
  },
  {
    slug: 'focus-fatigue-workforce-issue',
    datePublished: '2026-09-02',
    audience: 'employer',
    title: 'When Focus and Fatigue Show Up as a Workforce Issue | Siya Health',
    headline: 'When Focus and Fatigue Show Up as a Workforce Issue',
    breadcrumbShort: 'Focus & Fatigue at Work',
    metaDescription:
      'Leadership and HR: when concentration and exhaustion spread across teams, distinguish burnout from treatable medical causes—and what clinical programs can offer.',
    meta: 'Employers · HR & benefits guide',
    hubHref: '/employers',
    hubLabel: 'Employers',
    parentEntity: '/employers',
    cluster: 'workplace',
    lead: 'Quarterly reviews mention “burnout.” Slack is quieter. Projects slip. Sometimes the problem is workload—and sometimes it is untreated sleep apnea, ADHD, thyroid disease, or months of non-restorative sleep wearing people down.',
    body: `
            <p>Workforce focus problems rarely arrive as a tidy HR ticket. They show up as missed deadlines, meeting fatigue, irritability, and employees who swear they are sleeping “enough” but never feel restored. Leadership often reaches for resilience training first. That may help culture—it does not treat sleep disorders or iron deficiency.</p>
            <h2>Burnout versus medical fatigue</h2>
            <p>Burnout tracks with sustained overload, unclear priorities, and low control. Medical fatigue and brain fog can overlap—especially after illness, perimenopause, sleep apnea, or mood conditions—but may persist even when a team rightsizes workload. The distinction matters because the intervention differs.</p>
            <h2>Patterns leaders and HR hear repeatedly</h2>
            <ul>
              <li>Afternoon crashes despite caffeine and “good sleep hygiene”</li>
              <li>High performers who suddenly cannot finish routine tasks</li>
              <li>Remote workers blaming distractions—when the issue followed them home</li>
              <li>Post-illness teams that never fully “bounced back”</li>
            </ul>
            <p>Employee-facing depth: <a href="/blog/brain-fog-at-work">brain fog at work</a>, <a href="/blog/sleep-and-focus-at-work">sleep and focus at work</a>, and <a href="/blog/chronic-fatigue-and-work-performance">chronic fatigue and work performance</a>.</p>
            <h2>Why wellness apps hit a ceiling</h2>
            <p>Meditation subscriptions and step challenges have a role. They do not diagnose sleep apnea, prescribe when appropriate, or interpret labs. When symptoms are persistent, employees need licensed clinicians—not another gamified streak.</p>
            <h2>What benefits teams can structure instead</h2>
            <p>Clear pathways to screening and physician-led telehealth reduce the friction of “find a doctor on your own.” Programs can cover ADHD-related attention patterns, sleep disruption, and fatigue markers—with concierge-supported scheduling for busy professionals. See <a href="/employers">employer cognitive health programs</a> for partnership scope.</p>
            <h2>Privacy and trust</h2>
            <p>Employees hesitate to disclose focus or fatigue problems when they fear surveillance. Clinical programs should make explicit that individual diagnoses and visit notes stay in the patient chart unless authorization says otherwise—while employers receive implementation and access information at the program level.</p>
            <p><em>Educational only—not occupational medicine, workforce analytics, or medical advice for individual employees.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/fatigue">Fatigue</a>
                → <a href="/brain-fog">Brain fog</a>
                → <a href="/employers">Employers</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Should we survey the workforce about focus and fatigue?',
        'Aggregated pulse surveys can surface themes. They are not a substitute for individual medical evaluation. Avoid framing surveys as diagnostic.',
      ],
      [
        'Can we refer everyone to the same screening tool?',
        'Structured screening can be a starting point—not an endpoint. Positive screens should route to clinical follow-up when employees choose to pursue it.',
      ],
      [
        'How does this relate to EAP?',
        'EAPs often handle counseling and referrals. Physician-led telehealth for ADHD, sleep, and fatigue can complement EAP—but roles should be clear so employees know which door to use.',
      ],
    ],
    relatedArticles: [
      { href: '/blog/sleep-and-focus-at-work', label: 'Sleep, Focus & Cognitive Load at Work' },
      { href: '/blog/chronic-fatigue-and-work-performance', label: 'Chronic Fatigue & Work Performance' },
      { href: '/blog/cognitive-health-benefits-for-employers', label: 'Cognitive Health Benefits for Employers' },
    ],
    relatedHub: '/employers',
    relatedHubLabel: 'Employer cognitive health programs',
  },
];

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function faqJsonLd(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  });
}

function buildPage(post) {
  const url = `https://siya.health/blog/${post.slug}`;
  const datePublished = post.datePublished || DEFAULT_DATE;
  const faqHtml = post.faqs.map(([q, a]) => `\n            <h3>${q}</h3>\n            <p>${a}</p>`).join('');
  const isEmployer = post.audience === 'employer';
  const about = isEmployer ? ['Employers', 'Workplace health'] : [post.hubLabel, 'Primary care'];
  const metaSuffix = post.meta.includes(' · ') ? post.meta.split(' · ')[1] : post.meta;

  const relatedArticles = post.relatedArticles || [
    { href: '/blog/brain-fog-at-work', label: 'Brain Fog at Work' },
    { href: '/blog/brain-fog-and-sleep', label: 'Brain Fog and Sleep' },
    { href: '/blog/always-tired-no-energy', label: 'Always Tired With No Energy' },
  ];
  const relatedLis = relatedArticles
    .map((a) => `                <li><a href="${a.href}">${a.label}</a></li>`)
    .join('\n');

  const ctaSection = isEmployer
    ? `            <section class="blog-provider-cta blog-employer-cta" aria-labelledby="employer-cta-heading">
              <h2 id="employer-cta-heading">Explore employer programs</h2>
              <p>Structured screening and physician-led telehealth for working professionals—partnership inquiries welcome; program packaging finalized with early partners.</p>
              <div class="blog-provider-cta-actions">
                <a class="button ds-button ds-button--primary" href="/employers#employer-inquiry-form" data-siya-track="employer_inquiry_click" data-siya-location="blog-employer-cta" data-page-type="employer" data-intent="employer" data-conversion-goal="bookDemo" data-cta-slot="bookDemo" data-component="button">Request employer information</a>
                <a href="/employers" class="button ds-button ds-button--secondary secondary" data-siya-location="blog-employer-cta">Employer program overview</a>
              </div>
              <p class="blog-provider-cta-foot">Individual employees: <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a> · <a href="/adhd-care">ADHD care</a></p>
            </section>`
    : `            <section class="blog-provider-cta" aria-labelledby="supporting-cta-heading">
              <h2 id="supporting-cta-heading">Talk with primary care</h2>
              <p>These articles describe patterns—they cannot assess your history. A licensed clinician can sort fatigue look-alikes and decide what evaluation, if any, fits your situation.</p>
              <div class="blog-provider-cta-actions">
                <a class="button ds-button ds-button--primary" href="/book-appointment" data-siya-track="book_appointment_click" data-siya-location="blog-supporting-cta">Book a primary care visit</a>
                <a href="/redirect/meet-greet" class="button ds-button ds-button--secondary secondary" data-siya-location="blog-supporting-cta" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>
              </div>
              <p class="blog-provider-cta-foot"><a href="${post.hubHref}">${post.hubLabel} hub</a> · <a href="/primary-care">Primary care</a> · <a href="/employers">For employers</a></p>
            </section>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${escAttr(post.title)}</title>
    <meta name="description" content="${escAttr(post.metaDescription)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escAttr(post.headline)}" />
    <meta property="og:description" content="${escAttr(post.metaDescription)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta property="og:site_name" content="Siya Health" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(post.title)}" />
    <meta name="twitter:description" content="${escAttr(post.metaDescription)}" />
    <meta name="twitter:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.headline,
      description: post.metaDescription,
      datePublished: datePublished,
      dateModified: datePublished,
      author: { '@type': 'Organization', name: 'Siya Health', url: 'https://siya.health' },
      publisher: { '@type': 'Organization', name: 'Siya Health', url: 'https://siya.health' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      about,
    })}</script>
    <script type="application/ld+json">${faqJsonLd(post.faqs)}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://siya.health/blog' },
        { '@type': 'ListItem', position: 3, name: post.breadcrumbShort, item: url },
      ],
    })}</script>
  </head>
  <body data-siya-supporting-cluster="${post.cluster}" data-siya-parent-entity="${post.parentEntity}">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary"></nav>
      </div>
    </header>
    <main id="main">
      <article class="blog-article">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="${post.hubHref}">${post.hubLabel}</a> · ${metaSuffix}</p>
            <h1>${post.headline}</h1>
            <p class="blog-lead">${post.lead}</p>
          </header>
          <div class="blog-content">
            <aside class="clinical-review clinical-review--pending" aria-label="Clinical review status">
              <p class="clinical-review-label">Clinician-informed</p>
              <p>Educational content informed by clinical practice patterns—not personal medical advice.</p>
            </aside>
${post.body}
            <h2>Frequently asked questions</h2>${faqHtml}

            <section class="related-articles" aria-labelledby="related-articles-heading">
              <h2 id="related-articles-heading">Related Articles</h2>
              <ul>
${relatedLis}
              </ul>
              <p class="related-articles-care"><a href="${post.relatedHub}">${post.relatedHubLabel} →</a></p>
            </section>

${ctaSection}
          </div>
        </div>
      </article>
    </main>
    <footer class="footer"><div class="container"><p>&copy; Siya Health</p></div></footer>
    <script src="/scripts/site-header.js" defer></script>
  </body>
</html>
`;
}

function main() {
  for (const post of POSTS) {
    const out = path.join(BLOG_DIR, `${post.slug}.html`);
    fs.writeFileSync(out, buildPage(post), 'utf8');
    console.log(`  wrote blog/${post.slug}.html`);
  }
  console.log(`generate-workplace-blog-posts: ${POSTS.length} posts`);
}

main();
