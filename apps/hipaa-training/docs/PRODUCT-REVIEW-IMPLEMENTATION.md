# Product review implementation (staff app)

Meeting decisions reflected in `apps/hipaa-training` without replacing Level Up map/timezone or helpdesk engine.

## UI / positioning

- Home hero: **Hi, how can I help you?** + quick-action chips + free-text → `/help?q=…`
- Nav **Ask** (was Help desk); removed header **Preview** badge
- Chat: shorter opening, work-focused quick prompts, exact safety line near input
- Left panel: portrait image, minimal copy, all-teams wording

## Learning content (modular JSON under `src/data/level-up/`)

| Module | File(s) | Target |
|--------|---------|--------|
| English | `level-up-catalog.json` + `english-phrases.extra.json` | 25+ phrases |
| Culture | catalog + `culture-trivia.extra.json` | 25+ trivia |
| Healthcare | catalog + `healthcare-terms.extra.json` | 20+ terms |
| Documentation | `documentation.exercises.json` | 15 exercises |
| Communication | catalog + `communication-scenarios.extra.json` | 10+ scenarios |
| Compliance | `compliance-questions.json` | 10 questions |
| Forms | `forms-catalog.json` | **Coming soon** only |
| Scheduling | not built | **Coming soon** (no hardcoded roster) |

Items include `status`, `owner`, `reviewDate`, `category`, `difficulty` where extended. Runtime merges **live** items in `src/lib/level-up/catalog.ts`.

## Not in scope (per meeting)

- Live forms, roster, or schedule integrations
- ERP-style dashboards
- Patient/public Siya Guide changes

## Ops follow-up

- Assign content owners and review dates in JSON
- Five-employee usability test (questions in meeting notes §13)
- Push to `main` for `siya-staff-assist` deploy
