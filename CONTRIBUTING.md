# Contributing Guide

Thank you for your interest in contributing! This project aims to maintain a high bar for quality, security, and developer experience. Please read this guide before opening issues or pull requests.

## Prerequisites
- Node.js 20.x (see `.nvmrc`)
- npm 10+
- Git 2.4+
- On Windows: use Git Bash or WSL for Husky hooks and POSIX scripts

## Getting Started
- Fork and clone the repo
- Install deps: `npm ci`
- Start dev server: `npm run dev`
- Run checks locally:
  - Format: `npm run format:check`
  - Lint: `npm run lint`
  - Types: `npm run typecheck`
  - Tests: `npm run test` / `npm run test:coverage`
  - Storybook: `npm run storybook`

## Branching and Commits
- Branch names: `feature/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`
- Conventional Commits for PR titles and commit messages (CI enforces on PRs)
- Keep commits focused and logically grouped. Avoid unrelated changes.

## Code Style
- TypeScript strict mode is enabled; avoid `any` in public APIs
- Use `@/` aliases for local imports
- UI primitives under `components/ui/` follow shadcn policy — do not modify their structure directly; compose instead
- Run `npm run format` before pushing

## Testing
- Co-locate tests as `*.test.ts(x)` next to source
- Prefer React Testing Library for UI tests
- Keep fixtures deterministic

## Security
- Do not commit secrets; use `.env.local` (gitignored)
- MSW runs only in development
- CSP reporting endpoint is available at `/api/csp-reports`
- CI includes CodeQL, Semgrep, Gitleaks, OSV, Trivy, Scorecard

## Windows Notes
- Use Git Bash (bundled with Git for Windows) for Husky hooks
- All npm scripts are cross‑platform; avoid `make` on Windows (optional)
- Alternatively, use WSL2 with Ubuntu and Node 20.x

## Pull Request Checklist
- [ ] Tests added/updated where relevant
- [ ] Lint, typecheck, and tests pass locally
- [ ] No large diffs due to formatting (run Prettier)
- [ ] Screenshots for UI changes (attach to PR)
- [ ] Update README/docs if behavior changes

## Release Process
- Release Please manages versions and changelogs
- Merging the release PR will tag and publish artifacts

Thanks for contributing!
