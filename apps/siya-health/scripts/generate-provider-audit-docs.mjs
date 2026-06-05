/**
 * Generate provider missing-info, bio completeness audits, intake form, and CSV request sheet.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROVIDERS } from '../data/providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, '..', 'docs');

const FIELD_CHECKS = [
  { group: 'Identity', field: 'full legal name', key: 'name', required: true },
  { group: 'Identity', field: 'preferred display name', key: 'displayName', required: true },
  { group: 'Identity', field: 'credentials/suffixes', key: 'credentials', required: true },
  { group: 'Identity', field: 'current role/title', key: 'role', required: true },
  { group: 'Identity', field: 'short bio', key: 'shortBio', required: true },
  { group: 'Identity', field: 'long bio', key: 'longBio', required: true },
  { group: 'Identity', field: 'professional headshot', key: 'photo', required: true },
  { group: 'Identity', field: 'alt text', key: 'altText', required: true },
  { group: 'Licensing', field: 'active license states', key: 'statesLicensed', required: true },
  { group: 'Licensing', field: 'license type per state', key: 'licenses', required: true },
  { group: 'Licensing', field: 'license verification source', key: 'credentialVerifiedBy', required: true },
  { group: 'Licensing', field: 'accepting patients per state', key: 'acceptingNewPatients', required: true },
  { group: 'Education', field: 'medical school', key: 'education', required: true },
  { group: 'Education', field: 'residency', key: 'residency', required: true },
  { group: 'Education', field: 'fellowship', key: 'fellowship', required: false },
  { group: 'Education', field: 'board certifications', key: 'boardCertifications', required: true },
  { group: 'Education', field: 'professional memberships', key: 'professionalMemberships', required: false },
  { group: 'Clinical', field: 'clinical focus areas', key: 'clinicalFocus', required: true },
  { group: 'Clinical', field: 'services supported', key: 'services', required: true },
  { group: 'Clinical', field: 'patient-fit description', key: 'patientFit', required: true },
  { group: 'Clinical', field: 'languages spoken', key: 'languages', required: false },
  { group: 'Clinical', field: 'care philosophy', key: 'carePhilosophy', required: true },
  { group: 'Trust', field: 'profile last updated', key: 'profileLastUpdated', required: true },
  { group: 'Trust', field: 'credential status', key: 'credentialStatus', required: true },
  { group: 'Trust', field: 'reviewedContent', key: 'reviewedContent', required: false },
  { group: 'Trust', field: 'authoredContent', key: 'authoredContent', required: false },
  { group: 'Trust', field: 'NPI', key: 'npi', required: false },
  { group: 'Trust', field: 'external profiles (sameAs)', key: 'sameAs', required: false },
];

function isEmpty(val, key) {
  if (val === null || val === undefined) return true;
  if (Array.isArray(val)) return val.length === 0;
  if (key === 'patientFit') return !val?.deck;
  if (key === 'longBio') return !Array.isArray(val) || val.length === 0;
  return false;
}

function statusFor(provider, check) {
  const val = provider[check.key];
  if (isEmpty(val, check.key)) {
    if (check.key === 'credentialStatus' && val) return { status: 'Needs verification', priority: 'Required before physician-reviewed content linkage' };
    if (check.key === 'boardCertifications' && Array.isArray(val) && val.length) return { status: 'Needs verification', priority: 'Required before physician-reviewed content linkage' };
    return { status: 'Missing', priority: check.required ? 'Required before publishing' : 'Nice to have' };
  }
  if (['licenses', 'education', 'residency', 'npi', 'sameAs', 'acceptingNewPatients', 'credentialVerifiedBy'].includes(check.key)) {
    return { status: 'Missing', priority: check.required ? 'Required before adding provider #4' : 'Nice to have' };
  }
  if (check.key === 'credentialStatus' && String(val).includes('pending')) {
    return { status: 'Needs verification', priority: 'Required before physician-reviewed content linkage' };
  }
  return { status: 'Complete', priority: '—' };
}

function csvEscape(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

function buildMissingInfoAudit() {
  const lines = [
    '# Provider Missing Information Audit',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'Fields with null, empty arrays, or pending verification in `data/providers.mjs`.',
    '',
  ];
  for (const p of PROVIDERS) {
    lines.push(`## ${p.name}`, '');
    for (const check of FIELD_CHECKS) {
      const val = p[check.key];
      const { status, priority } = statusFor(p, check);
      if (status === 'Complete') continue;
      const current = isEmpty(val, check.key) ? '—' : Array.isArray(val) ? val.join('; ') : String(val).slice(0, 120);
      lines.push(`| Field | ${check.field} |`);
      lines.push(`| Current value | ${current} |`);
      lines.push(`| Status | ${status} |`);
      lines.push(`| Priority | ${priority} |`);
      lines.push(`| Question | Please provide ${check.field} for ${p.displayName}. |`);
      lines.push('');
    }
    if (p.claimsNeedingVerification?.length) {
      lines.push('### Claims needing proof', '');
      for (const c of p.claimsNeedingVerification) {
        lines.push(`- **${c}** — Status: Needs verification — Do not publish as substantiated without source.`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

function buildBioCompletenessAudit() {
  const lines = [
    '# Provider Bio Completeness Audit',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
  ];
  for (const p of PROVIDERS) {
    lines.push(`## ${p.name}`, '');
    const rows = [];
    for (const check of FIELD_CHECKS) {
      const val = p[check.key];
      const { status, priority } = statusFor(p, check);
      let why = 'Supports accurate provider profiles and E-E-A-T.';
      if (check.key === 'licenses') why = 'Required for state-specific care claims and compliance.';
      if (check.key === 'education') why = 'Standard credential transparency for physician profiles.';
      if (check.key === 'reviewedContent') why = 'Only populate after physician sign-off.';
      rows.push({ field: check.field, status, why, priority, question: `What is your ${check.field}?`, format: 'Text or list as appropriate' });
    }
    lines.push('| Field | Status | Why it matters | Question | Format |');
    lines.push('|-------|--------|----------------|----------|--------|');
    for (const r of rows) {
      lines.push(`| ${r.field} | ${r.status} | ${r.why} | ${r.question} | ${r.format} |`);
    }
    lines.push('');
    if (p.claimsNeedingVerification?.length) {
      lines.push('**Claims requiring source documentation:** ' + p.claimsNeedingVerification.join('; '), '');
    }
  }
  lines.push('## Minimum bio requirements for adding a new provider', '');
  lines.push('Before provider #4 can go live, collect:');
  lines.push('');
  lines.push('1. Legal display name, credentials, role, headshot + alt text');
  lines.push('2. Active license states with verification source (no invented license numbers)');
  lines.push('3. Board certifications with verification status');
  lines.push('4. Medical school, residency, fellowship (if applicable)');
  lines.push('5. Clinical focus, services, patient-fit, care philosophy (approved copy)');
  lines.push('6. Booking link, accepting-new-patients status per state');
  lines.push('7. Profile last-updated date and credential verification date');
  lines.push('8. Signed consent for headshot, profile publication, and testimonial use');
  lines.push('9. No patient volume, rating, or award claims without documented source');
  lines.push('');
  return lines.join('\n');
}

function buildCsv() {
  const header = 'Provider,Field,Priority,QuestionToAsk,ExampleAnswer,Owner,Status';
  const rows = [header];
  for (const p of PROVIDERS) {
    for (const check of FIELD_CHECKS) {
      const { status, priority } = statusFor(p, check);
      if (status === 'Complete') continue;
      const q = `Please provide ${check.field} for ${p.displayName}.`;
      const pri =
        priority === '—'
          ? 'Nice to have'
          : priority.includes('#4')
            ? 'Required before adding provider #4'
            : priority.includes('reviewed')
              ? 'Verification needed'
              : priority.includes('publishing')
                ? 'Required before publishing'
                : 'Nice to have';
      rows.push(
        [p.name, check.field, pri, q, '', 'Provider/Admin', status].map(csvEscape).join(','),
      );
    }
    for (const c of p.claimsNeedingVerification || []) {
      rows.push(
        [p.name, `Claim: ${c}`, 'Verification needed', `Provide source documentation for: ${c}`, '', 'Admin', 'Needs verification']
          .map(csvEscape)
          .join(','),
      );
    }
  }
  return rows.join('\n');
}

function buildIntakeForm() {
  return `# Provider Intake Form

Send to each physician to complete in 10–15 minutes. Do not publish fields marked "pending verification" until admin confirms.

## Basic identity

- Full legal name:
- Preferred display name (e.g. Dr. Jane Smith, MD):
- Credentials / suffixes (MD, DO, etc.):
- Current role / title at Siya Health:
- Professional headshot file (or confirm existing):
- Alt text for headshot (accessibility):

## Licenses

- Active license states (check all that apply): CA / TX / PA / FL / other
- License type per state (e.g. physician, psychiatric):
- License status (active / inactive):
- License expiration dates (if sharing):
- State medical board profile URL per state:
- Accepting new patients in each licensed state? (yes/no per state):

## Education & training

- Medical school name:
- Graduation year (if approved for publication):
- Residency specialty:
- Residency institution:
- Fellowship (if applicable):
- Board certifications (list; include ABOM if applicable):
- ADHD-CCSP or other ADHD-specific training:
- Professional memberships (optional):

## Clinical profile

- Clinical focus areas (3–6 bullets):
- Conditions treated:
- Services you support at Siya (ADHD, weight loss, telehealth, men's health, etc.):
- Patient-fit statement (who you help best):
- Languages spoken:
- Telehealth availability notes:
- Controlled-substance eligibility notes (if relevant):
- Crisis / emergency limitation language (if psychiatric care):

## Care philosophy & bio

- Short bio (2–3 sentences, first person OK):
- Long bio / background (paragraph):
- Care philosophy (how you practice):
- Approved deck line (emotional headline, not H1):

## External profiles (optional)

- NPI number:
- State medical board profile URL(s):
- LinkedIn URL:
- Doximity / Healthgrades / WebMD (if desired):

## Consent & claims

- [ ] I consent to publication of my headshot on siya.health
- [ ] I approve the bio copy above for public profile
- [ ] I consent to attribution on physician-reviewed content (when applicable)
- Patient volume claims (only if documented source attached):
- Testimonials (only with signed patient consent on file):

**Submitted by:** _______________ **Date:** _______________
`;
}

function main() {
  fs.mkdirSync(DOCS, { recursive: true });
  fs.writeFileSync(path.join(DOCS, 'PROVIDER-MISSING-INFO-AUDIT.md'), buildMissingInfoAudit(), 'utf8');
  fs.writeFileSync(path.join(DOCS, 'PROVIDER-BIO-COMPLETENESS-AUDIT.md'), buildBioCompletenessAudit(), 'utf8');
  fs.writeFileSync(path.join(DOCS, 'PROVIDER-BIO-REQUEST-SHEET.csv'), buildCsv(), 'utf8');
  fs.writeFileSync(path.join(DOCS, 'PROVIDER-INTAKE-FORM.md'), buildIntakeForm(), 'utf8');
  console.log('Wrote provider audit docs (4 files)');
}

main();
