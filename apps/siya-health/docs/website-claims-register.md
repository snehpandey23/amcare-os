# Website Claims Register

## Purpose

This file tracks key marketing, clinical, operational, pricing, and availability claims used on the Siya Health website so they can be reviewed, supported, and updated internally.

No public-facing claim should remain on the website long-term without an internal evidence source or owner.

---

## Claims Table

| Claim                      | Exact Website Wording                                                                                                               | Page / Location              | Evidence Needed                                       | Evidence Location                                  | Owner                  | Review Frequency | Last Reviewed | Status                 | Action Required                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ---------------------- | ---------------- | ------------- | ---------------------- | --------------------------------------------------------------------------- |
| ADHD evaluation volume     | 750+ ADHD evaluations                                                                                                               | Homepage / ADHD pages        | Internal patient/evaluation count source              | TBD                                                | Marketing / Clinical   | Quarterly        | TBD           | Needs review           | Confirm current count and evidence source                                   |
| Patient reviews            | 4.7 star rating / 450+ reviews                                                                                                      | Homepage / ADHD pages        | Review platform/source                                | TBD                                                | Marketing              | Quarterly        | TBD           | Needs review           | Confirm rating, review count, and source                                    |
| Weight loss patient volume | 5,000+ weight loss patients                                                                                                         | Weight loss / metabolic page | Internal patient count source                         | TBD                                                | Marketing / Clinical   | Quarterly        | TBD           | Needs review           | Confirm whether this refers to Siya, Klarity, WellSync, or provider history |
| Appointment timing         | Same-week appointments                                                                                                              | Homepage / service pages     | Scheduling availability review                        | TBD                                                | Operations             | Monthly          | TBD           | Needs review           | Confirm availability is consistently achievable                             |
| Clinician licensure        | Licensed clinicians                                                                                                                 | Homepage / service pages     | Provider licensure documentation                      | TBD                                                | Clinical / Compliance  | Quarterly        | TBD           | Needs review           | Confirm active licensure in listed states                                   |
| HIPAA-compliant care       | HIPAA-compliant care / secure medical chat                                                                                          | Homepage / service pages     | Platform/compliance documentation                     | TBD                                                | Compliance             | Quarterly        | TBD           | Needs review           | Confirm platform and BAA documentation                                      |
| ADHD provider expertise    | ADHD-trained providers / ADHD certifications                                                                                        | ADHD pages                   | Provider certification documentation                  | TBD                                                | Clinical               | Quarterly        | TBD           | Needs review           | Confirm exact training/certification language                               |
| Service availability       | Available in California, Texas, Pennsylvania, and Florida                                                                           | Homepage / service pages     | Active service availability by state and service line | data/site-standards.mjs → AVAILABLE_SERVICE_STATES | Clinical / Operations  | Monthly          | TBD           | Needs review           | Confirm each service is available in each listed state                      |
| Pricing                    | Initial evaluation $199; non-controlled follow-up $79/month; controlled medication follow-up $149/month when clinically appropriate | Pricing / service pages      | Pricing source of truth                               | data/site-standards.mjs → PRICING                  | Marketing / Operations | Monthly          | TBD           | Active, verify monthly | Confirm pricing before campaigns                                            |
| Medication disclaimer      | Medication is not guaranteed / controlled medication only when clinically appropriate                                               | ADHD / pricing pages         | Clinical policy and compliance review                 | TBD                                                | Clinical / Compliance  | Quarterly        | TBD           | Needs review           | Confirm exact wording with clinical policy                                  |

---

## Notes

* Do not remove claims from the website automatically unless they are obviously outdated, inaccurate, or unsupported.
* Document claims here before changing or removing them.
* Service availability is stated as California, Texas, Pennsylvania, and Florida in `data/site-standards.mjs → AVAILABLE_SERVICE_STATES`.
* Where service availability may vary by state, use: “Availability may vary by state. Start a secure medical chat to confirm eligibility.”
* Pricing shown site-wide: initial evaluation $199, non-controlled medication follow-up $79/month, controlled medication follow-up $149/month when clinically appropriate. Medication costs are separate. Source: `data/site-standards.mjs → PRICING`.
* ADHD screening must not be described as diagnostic.
* Do not imply medication, stimulant prescriptions, or treatment outcomes are guaranteed.
