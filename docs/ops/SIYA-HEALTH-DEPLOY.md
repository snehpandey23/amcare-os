# Siya Health production deploy

Production is `dpl_7311hvGrfC3bcubjAZNy5XN24o7w`, built from commit `974a2686`.

## How a deploy is made

Use the CLI only. Do not rely on a git push to publish www.siya.health.

1. Work from a clean checkout at the repo root.
2. The upload must target project `prj_d44fdj7C0X9ivPrLVqIHOiNvJ8Qd` on team `team_7dvS6pa19W0oVxblge8o52QL`. `scripts/deploy-siya-health.sh` sets those ids itself, because the repo-root Vercel link points at a different project.
3. Stage with `bash scripts/deploy-siya-health.sh --prod`. That runs `vercel deploy --prod --skip-domain` and does not assign www.siya.health.
4. Verify the staged deployment.
5. Promote that one deployment. One attempt. Do not use `--force` and do not retry.

## Git deployments

Automatic git deployments for siya-health are off: `gitProviderOptions.createDeployments` is `disabled`. The ignored-build command and `productionBranch` were left as they were (`productionBranch` is null). A push to `main` does not build siya-health. Other projects in this repo can still build.

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
