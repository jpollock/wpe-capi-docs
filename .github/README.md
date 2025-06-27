# GitHub Actions Workflows

This directory contains the automated workflows for the WP Engine Customer API documentation system.

## Overview

The automation system provides:
- **Automated documentation generation** from OpenAPI spec changes
- **Change detection** to identify what's new or modified
- **Preview environments** for reviewing changes before deployment
- **Multi-environment deployment** (staging → production)
- **Cleanup automation** for stale preview environments

## Workflows

### 1. Documentation Pipeline (`documentation-pipeline.yml`)

**Triggers:**
- `repository_dispatch` with type `openapi-updated` (from external API repo)
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches
- Manual trigger with `workflow_dispatch`

**Jobs:**
- **detect-changes**: Analyzes OpenAPI spec differences
- **generate-docs**: Creates documentation from OpenAPI spec
- **create-pr**: Auto-creates PRs for external spec updates
- **deploy-staging**: Deploys to staging environment (`develop` branch)
- **deploy-production**: Deploys to production environment (`main` branch)

**Key Features:**
- Smart change detection to avoid unnecessary builds
- Breaking change identification
- Automated PR creation with detailed change summaries
- Build artifact management
- Error handling and notifications

### 2. Preview Environment Cleanup (`cleanup-preview.yml`)

**Triggers:**
- Pull request closure (automatic cleanup)
- Daily schedule at 2 AM UTC (stale environment cleanup)
- Manual trigger for custom cleanup patterns

**Jobs:**
- **cleanup-pr-environment**: Removes preview environment when PR is closed
- **cleanup-stale-environments**: Removes environments older than 7 days

### 3. Test Pipeline (`test-pipeline.yml`)

**Triggers:**
- Manual trigger with test type selection
- Pull requests affecting scripts, templates, or workflows

**Test Types:**
- **basic**: Core functionality (parse → generate → build)
- **change-detection**: OpenAPI diff analysis
- **full-generation**: Complete pipeline simulation

## External Integration

### Repository Dispatch Setup

To trigger documentation updates from an external API repository, add this workflow to the API repo:

```yaml
# .github/workflows/notify-docs.yml in API repository
name: Notify Documentation on OpenAPI Changes
on:
  push:
    paths: 
      - 'openapi/v1.yaml'
      - 'swagger.yaml'
    branches: [main, develop]

jobs:
  notify-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.DOCS_REPO_TOKEN }}
          repository: wpengine/customer-api-docs
          event-type: openapi-updated
          client-payload: |
            {
              "spec_url": "https://raw.githubusercontent.com/wpengine/customer-api/${{ github.ref_name }}/openapi/v1.yaml",
              "commit_sha": "${{ github.sha }}",
              "branch": "${{ github.ref_name }}",
              "timestamp": "${{ github.event.head_commit.timestamp }}",
              "author": "${{ github.event.head_commit.author.name }}"
            }
```

## Required Secrets

Configure these secrets in your repository settings:

### GitHub Secrets
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `DOCS_REPO_TOKEN`: Personal access token for cross-repo communication

### WP Engine Secrets (when ready to deploy)
- `WPE_SSHG_KEY_PRIVATE`: SSH private key for WP Engine deployments

### Optional Notification Secrets
- `SLACK_WEBHOOK`: Webhook URL for Slack notifications

## Environment Configuration

### GitHub Environments (Optional)

You can configure GitHub environments for additional protection:

1. Go to Settings → Environments
2. Create environments: `staging`, `production`
3. Add protection rules (required reviewers, deployment branches)
4. Add environment-specific secrets

### WP Engine Environment Mapping

```
Branch → Environment → URL
main → production → https://docs.wpengine.com (automatic deployment)
develop → staging → https://staging-docs.wpengine.com (manual deployment)
feature/* → preview → WP Engine auto-creates preview for PRs against main
```

**Note**: Since your WP Engine site is configured with `main` as the production branch, WP Engine will automatically:
- Deploy to production when PRs are merged to `main`
- Create preview environments for all PRs created against `main`
- Handle preview environment lifecycle automatically

## Workflow Outputs

### Change Detection Results
- `/tmp/has-changes`: Boolean indicating if changes were detected
- `/tmp/breaking-changes`: Boolean indicating if breaking changes exist
- `/tmp/change-summary.json`: Detailed change analysis

### Build Artifacts
- `documentation-build-{run-number}`: Built documentation site
- `test-build-{run-number}`: Test build artifacts (short retention)

## Manual Operations

### Force Documentation Regeneration
```bash
# Trigger via GitHub CLI
gh workflow run documentation-pipeline.yml -f force_regenerate=true

# Or via GitHub UI: Actions → Documentation Generation Pipeline → Run workflow
```

### Test Pipeline
```bash
# Run basic tests
gh workflow run test-pipeline.yml -f test_type=basic

# Run change detection tests
gh workflow run test-pipeline.yml -f test_type=change-detection

# Run full pipeline test
gh workflow run test-pipeline.yml -f test_type=full-generation
```

### Manual Cleanup
```bash
# Cleanup specific environment pattern
gh workflow run cleanup-preview.yml -f environment_pattern=preview-old-*
```

## Monitoring and Debugging

### Workflow Status
- Monitor workflow runs in the Actions tab
- Check build artifacts for generated content
- Review change detection summaries in PR descriptions

### Common Issues

**Change Detection False Positives:**
- First run may show changes even with identical specs
- Check `/tmp/change-summary.json` for detailed analysis

**Build Failures:**
- Verify OpenAPI spec validity
- Check template syntax
- Review dependency versions

**Deployment Issues:**
- Confirm WP Engine credentials
- Verify environment names
- Check network connectivity

## Development

### Adding New Workflows
1. Create workflow file in `.github/workflows/`
2. Follow naming convention: `kebab-case.yml`
3. Add appropriate triggers and jobs
4. Test with manual dispatch first
5. Document in this README

### Modifying Existing Workflows
1. Test changes in feature branch
2. Use test pipeline to validate
3. Monitor first production run carefully
4. Update documentation as needed

## Future Enhancements

### Planned Features
- [ ] WP Engine API integration for preview environments
- [ ] Slack/Teams notifications
- [ ] Performance monitoring and metrics
- [ ] Advanced breaking change detection
- [ ] Automated rollback on deployment failures
- [ ] Integration with external monitoring tools

### Configuration Templates
- [ ] Environment-specific deployment configs
- [ ] Notification templates
- [ ] Error handling procedures
- [ ] Monitoring dashboards

## Support

For issues with the automation system:
1. Check workflow run logs in GitHub Actions
2. Review change detection output
3. Validate OpenAPI spec syntax
4. Contact the documentation team

---

*This automation system is designed to minimize manual maintenance while ensuring high-quality, up-to-date API documentation.*
