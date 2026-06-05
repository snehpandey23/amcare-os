/**
 * Import counsel DOCX files → legal-document-versions/{slug}.md
 * Verbatim text with placeholder substitution only.
 *
 * Env overrides (optional):
 *   COUNSEL_DOCX_TERMS, COUNSEL_DOCX_PRIVACY, COUNSEL_DOCX_NPP
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const VERSIONS_DIR = path.join(SITE_ROOT, 'legal-document-versions');

const DEFAULT_DOCX = {
  'terms-of-use': '/Users/sp/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Website Terms of Use - Siya Health.docx',
  'privacy-policy': '/Users/sp/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Website Privacy Policy - Siya Health (1).docx',
  'notice-of-privacy-practices': '/Users/sp/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Notice of Privacy Practices Siya Health.docx',
};

import { LEGAL_EFFECTIVE_DATE_DISPLAY } from '../data/site-standards.mjs';

const EFFECTIVE_DATE = LEGAL_EFFECTIVE_DATE_DISPLAY;
const WEBSITE_URL = 'https://siya.health';
const CONTACT_EMAIL = 'care@siya.health';

const EXTRACTOR = `import zipfile, re, xml.etree.ElementTree as ET, json, sys
WNS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def extract_docx(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    blocks = []
    for p in root.iter(f'{WNS}p'):
        parts = []
        for r in p.iter(f'{WNS}r'):
            rpr = r.find(f'{WNS}rPr')
            is_bold = rpr is not None and rpr.find(f'{WNS}b') is not None
            for t in r.iter(f'{WNS}t'):
                text = (t.text or '') + (t.tail or '')
                if text:
                    parts.append((is_bold, text))
        if not parts:
            continue
        line = ''.join(t for _, t in parts)
        line = re.sub(r'\\s+', ' ', line).strip()
        if not line:
            continue
        all_bold = all(b for b, _ in parts) and len(parts) > 0
        blocks.append({'text': line, 'bold': all_bold})
    return blocks

path = sys.argv[1]
print(json.dumps(extract_docx(path)))
`;

function extractBlocks(docxPath) {
  const r = spawnSync('python3', ['-c', EXTRACTOR, docxPath], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`DOCX extract failed: ${r.stderr || r.stdout}`);
  return JSON.parse(r.stdout);
}

function isNumberedSection(text) {
  return /^\d+\.\s+/.test(text);
}

function isBullet(text) {
  return /^[•●○\-–]\s+/.test(text) || (/^[A-Z][a-z]+:/.test(text) && text.length < 120);
}

function toMarkdown(blocks, slug) {
  const lines = [];
  for (const { text, bold } of blocks) {
    let t = text;

    t = t.replace(/\[DATE\]/g, EFFECTIVE_DATE);
    t = t.replace(/\[website\]/gi, WEBSITE_URL);
    t = t.replace(/\(website\)/gi, WEBSITE_URL);
    t = t.replace(/\[info@\]/g, CONTACT_EMAIL);

    t = t.replace(
      /our Privacy Policy \(insert link\)/gi,
      'our [Privacy Policy](/legal/privacy-policy)',
    );
    t = t.replace(
      /our Notice of Privacy Practices \(insert link\)/gi,
      'our [Notice of Privacy Practices](/legal/notice-of-privacy-practices)',
    );
    t = t.replace('(insert link)', '[Privacy Policy](/legal/privacy-policy)');

    // Cross-link counsel references (no substance change)
    if (slug === 'terms-of-use') {
      t = t.replace(
        /Please review our Privacy Policy and our Notice of Privacy Practices,/,
        'Please review our [Privacy Policy](/legal/privacy-policy) and our [Notice of Privacy Practices](/legal/notice-of-privacy-practices),',
      );
      t = t.replace(/See our Privacy Policy\./g, 'See our [Privacy Policy](/legal/privacy-policy).');
    }
    if (slug === 'privacy-policy') {
      t = t.replace(
        /which is covered by our Notice of Privacy Practices\./,
        'which is covered by our [Notice of Privacy Practices](/legal/notice-of-privacy-practices).',
      );
    }

    if (t === 'Terms of Use' || t === 'Privacy Policy' || t === 'Notice of Privacy Practices') {
      lines.push(`# ${t}`);
      continue;
    }
    if (bold && (isNumberedSection(t) || t.length < 80)) {
      lines.push(`## ${t}`);
      continue;
    }
    if (t.startsWith('THIS NOTICE DESCRIBES')) {
      lines.push(`**${t}**`);
      continue;
    }
    if (t.startsWith('IMPORTANT NOTICE REGARDING ARBITRATION')) {
      lines.push(`**${t}**`);
      continue;
    }
    if (/^Effective Date:|^Effective:/i.test(t)) {
      lines.push(`**${t}**`);
      continue;
    }
    if (t.startsWith('- ') || t.startsWith('• ')) {
      lines.push(t.replace(/^•\s+/, '- '));
      continue;
    }
    if (/^(Treatment|Payment|Healthcare Operation|Marketing|Fundraising|Research|As Required By Law|To Avert|Organ and Tissue|Workers|Public Health|Military|National Security|Correctional|Law Enforcement|Health Oversight|Judicial|Serious Threat|Specialized Government|Business Associates|Your Rights|Complaints|Contact|Changes to This Notice):/i.test(t)) {
      lines.push(`### ${t}`);
      continue;
    }
    lines.push(t);
  }

  return `${lines.join('\n\n')}\n`;
}

function main() {
  fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  const envMap = {
    'terms-of-use': process.env.COUNSEL_DOCX_TERMS,
    'privacy-policy': process.env.COUNSEL_DOCX_PRIVACY,
    'notice-of-privacy-practices': process.env.COUNSEL_DOCX_NPP,
  };

  for (const [slug, defaultPath] of Object.entries(DEFAULT_DOCX)) {
    const docxPath = envMap[slug] || defaultPath;
    if (!fs.existsSync(docxPath)) {
      console.error(`Missing DOCX for ${slug}: ${docxPath}`);
      process.exit(1);
    }
    const blocks = extractBlocks(docxPath);
    const md = toMarkdown(blocks, slug);
    const out = path.join(VERSIONS_DIR, `${slug}.md`);
    fs.writeFileSync(out, md, 'utf8');
    console.log(`Wrote ${out} (${blocks.length} blocks, ${md.length} chars)`);
  }
}

main();
