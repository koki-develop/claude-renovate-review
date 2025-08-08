# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a GitHub Action that reviews Renovate pull requests using Claude Code. It analyzes dependency updates, checks for breaking changes, and provides safety assessments for merging.

## Key Files

- `action.yml`: Main GitHub Action configuration defining inputs, outputs, and execution steps
- `extract.js`: Node.js script that parses Claude Code execution logs to extract review reports and blocked tool executions
- `docs/README.md`: User documentation with usage examples and configuration details
- `.github/workflows/release-please.yml`: Automated release workflow using release-please

## Architecture

The action follows this execution flow:

1. **Validation Phase**: Validates PR number and API keys (either Anthropic API key or Claude Code OAuth token required)
2. **PR Analysis**: Fetches PR details using GitHub CLI (`gh pr view`)
3. **Tool Preparation**: Converts allowed tools list to comma-separated format, automatically adds `Bash(gh pr diff:*)` to allowed tools
4. **Claude Code Execution**: Invokes Claude Code base action to review the PR with specific prompts
5. **Result Extraction**: Parses execution logs to extract the review report and any blocked tool attempts
6. **Output Generation**: Creates GitHub Action summary and optionally posts a comment on the PR

## Development Commands

Since this is a GitHub Action with no build process:

```bash
# Validate action.yml syntax
actionlint

# Lint GitHub Actions workflows
ghalint run

# Lint action.yml
ghalint act

# Security scan for GitHub workflows
zizmor .github/workflows/
```

## Key Implementation Details

### Log Extraction Logic (extract.js)
- Processes Claude Code execution logs from `CLAUDE_CODE_EXECUTION_FILE` environment variable
- Searches for review reports starting with "## Renovate PR Review Results"
- Tracks tool uses and identifies blocked tool executions
- Generates formatted output with blocked tools section when permissions were denied

### Tool Permissions
Default allowed tools:
- `WebFetch(domain:github.com)`
- `WebFetch(domain:raw.githubusercontent.com)`
- `Bash(gh pr diff:*)` (automatically added)

### Review Report Format
Claude Code generates structured markdown reports with:
- Safety Assessment (Safe/Needs Manual Migration/Not Safe)
- Release Content Analysis
- Impact Scope Investigation
- Recommended Actions
- Reference Links

## Testing Considerations

When testing changes:
- Ensure the action handles missing PR numbers gracefully
- Verify both authentication methods work (API key and OAuth token)
- Test comment creation and update functionality
- Validate extraction of blocked tool executions