# Siya Health production deploy

Production is `dpl_SM9vCTAgeM47Y3XWkNUQen147MHz`, built from commit `6321b5fd`.

## How a deploy is made

Use the CLI only. A git push must never be relied on to deploy. The siya-health ignore command is exactly `exit 0`, and `autoAssignCustomDomains` is true. That ignore command is the only guard against a push taking the custom domains.

1. Work from a clean checkout at the repo root.
2. Install dependencies with `npm ci`, then `npm install playwright@1.49.1 --no-save`. The deploy gates import playwright. It is not in the lockfile, so `npm ci` alone does not install it. `--no-save` keeps `package.json` and the lockfile unchanged.
3. The upload must target project `prj_d44fdj7C0X9ivPrLVqIHOiNvJ8Qd` on team `team_7dvS6pa19W0oVxblge8o52QL`. `scripts/deploy-siya-health.sh` sets those ids itself, because the repo-root Vercel link points at a different project.
4. Stage with `bash scripts/deploy-siya-health.sh --prod`. That runs `vercel deploy --prod --skip-domain` and does not assign www.siya.health. The script allows `--prod` only on `main` or `integration/*`. Do not edit that branch guard.
5. Verify the staged deployment.
6. Promote that one deployment. One attempt. Do not use `--force` and do not retry.

The deploy script's gates rewrite `apps/siya-health/internal/demo-qa/deploy-log.md` and the reports under `apps/siya-health/internal/demo-qa/walkthrough/`. After a deploy, commit `deploy-log.md`, restore the walkthrough reports with `git checkout -- apps/siya-health/internal/demo-qa/walkthrough/`, and keep the worktree clean before the next deploy.

## Git deployments

Automatic git deployments for siya-health are off: `gitProviderOptions.createDeployments` is `disabled`. `commandForIgnoringBuildStep` is `exit 0`. `productionBranch` is null. `autoAssignCustomDomains` is true. A push to `main` does not build siya-health. Other projects in this repo can still build.

To turn git deployments back on for siya-health only:

```http
PATCH /v9/projects/prj_d44fdj7C0X9ivPrLVqIHOiNvJ8Qd?teamId=team_7dvS6pa19W0oVxblge8o52QL
```

```json
{
  "gitProviderOptions": { "createDeployments": "enabled" },
  "commandForIgnoringBuildStep": "if [ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ]; then exit 1; else exit 0; fi",
  "productionBranch": null
}
```
