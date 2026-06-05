# Provider Page QA Checklist

Generated: 2026-06-05  
Use before publishing any new or updated provider profile.

---

## Credentials & identity

- [ ] Legal name matches medical license (spelling, suffix MD/DO)
- [ ] `jobTitle` matches employment agreement (only one Medical Director)
- [ ] Board certifications listed only if current and verifiable
- [ ] ADHD-CCSP described consistently (acronym expanded once)
- [ ] ABOM claimed only for obesity-certified physicians
- [ ] No conflicting specialty claims vs schema `medicalSpecialty`

---

## Licenses & states

- [ ] `statesLicensed` matches `entity-graph.json` and profile copy
- [ ] No state listed that provider cannot serve
- [ ] “Confirm at scheduling” disclaimer present
- [ ] Service page cards do not show provider in wrong state
- [ ] Footer state list has no duplicates (“California, California”)

---

## Images & media

- [ ] Headshot loads (200 OK, correct aspect ratio)
- [ ] `alt` text = `Dr. [Name], MD` or approved `altText` from data model
- [ ] Same canonical headshot used on profile, About, index (unless documented variant)
- [ ] OG/Twitter image appropriate (headshot or approved social crop)
- [ ] No broken `../assets/` paths from `/providers/` depth

---

## Content & claims

- [ ] No unsupported outcome guarantees
- [ ] Patient volume / statistics sourced and approved
- [ ] Testimonials labeled (illustrative vs verified platform)
- [ ] Psychiatric pages include crisis resources (988/911) where appropriate
- [ ] HIPAA language accurate (not implying HITRUST unless certified)

---

## Links & CTAs

- [ ] Meet & Greet URL works (`mnWpgh0IEgFvJymdZqHY`)
- [ ] ADHD screening CTA only on ADHD-eligible profiles
- [ ] Service links point to live pages
- [ ] Cross-links to other providers valid
- [ ] Privacy/terms point to `siya.health` (not legacy subdomain)
- [ ] Profile linked from About team card
- [ ] Profile linked from relevant service page (when Phase 5 complete)

---

## Schema & SEO

- [ ] JSON-LD parses (0 errors in Rich Results Test)
- [ ] `Physician` `@id` stable (`/providers/{slug}#physician`)
- [ ] `worksFor` → Siya Health org `@id`
- [ ] `areaServed` states match copy
- [ ] `knowsAbout` not overstuffed (<8 topics)
- [ ] `dateModified` matches `profileLastUpdated`
- [ ] Canonical URL = `https://siya.health/providers/{slug}`
- [ ] Title: `Dr. [Name], MD | [Focus] | Siya Health`
- [ ] Unique meta description per provider

---

## Layout & accessibility

- [ ] Single H1 (provider name recommended)
- [ ] Credential chips keyboard-focusable if interactive
- [ ] Color contrast on badges meets WCAG AA
- [ ] Mobile: image before wall of text
- [ ] Mobile: credentials accordion works
- [ ] Exactly one `cta-band` on page
- [ ] Skip link + landmark regions (`main`, `header`, `footer`)

---

## Review linkage (when applicable)

- [ ] `reviewedContent` URLs show `clinical-review--reviewed` on target page
- [ ] Reviewer slug on content matches this provider slug
- [ ] No “reviewed by” on pages still `pending` in registry
- [ ] Profile “Reviewed content” section matches registry only

---

## Build & parity

- [ ] Page in `sitemap.xml`
- [ ] Listed in `provider-index.json`
- [ ] Nav/footer normalized via `seo-build`
- [ ] 0 broken internal links from profile
- [ ] Production parity cert passes for provider URL sample

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Clinical / Medical Director | | |
| Operations (licenses verified) | | |
| Marketing (copy claims) | | |
| Engineering (build + schema) | | |
