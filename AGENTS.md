# Repository Guidelines

This document explains how to work with this Next.js 15 + TypeScript UI. Keep changes small, typed, and consistent with existing patterns.

## Project Structure & Module Organization

- `app/`: App Router routes (`page.tsx`, `layout.tsx`, feature folders like `login/`, `admin/`, `setup/`).
- `components/`: Reusable UI; shadcn-based components live under `components/ui/`.
- `hooks/`: Custom hooks (e.g., `use-auth.ts`, `use-api-availability.ts`).
- `lib/`: Cross-cutting utilities (`api-service.ts`, `app-config.ts`, `stores/`).
- `contexts/`: React contexts used across the app.
- `src/mocks/`: MSW handlers and Faker-powered data for local API mocking.
- `public/`: Static assets.  `scripts/`: build helpers (e.g., `generate-build-info.js`).

Example import: `import { Button } from '@/components/ui/button'`.

## Build, Test, and Development Commands

- `npm run dev`: Start dev server with Turbopack; generates `build-info.json`; MSW enabled.
- `npm run build`: Production build (also generates `build-info.json`).
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint (Next.js config).

Prereqs: Node 18+. Set env in `.env.local` (e.g., `NEXT_PUBLIC_API_URL=http://localhost:3001`).

## Coding Style & Naming Conventions

- **TypeScript**: Prefer explicit types; keep `any` out of public APIs.
- **ESLint**: Uses `next/core-web-vitals` + `next/typescript`. Fix issues before pushing.
- **Files**: kebab-case for filenames; `PascalCase` component names; hooks start with `use*`.
- **Imports**: Use `@/` root alias for local modules.
- **UI**: Use shadcn primitives under `components/ui/`; keep props minimal and typed.

## Testing Guidelines

- No formal test runner configured yet. Use MSW (`src/mocks`) for realistic local API behavior.
- If adding tests, co-locate as `*.test.ts(x)` next to source and prefer React Testing Library; keep fixtures deterministic.

## Commit & Pull Request Guidelines

- **Commits**: Imperative, concise subject (“Refactor auth redirect logic”); add a short body for rationale/impact.
- **Branches**: `feature/<scope>`, `fix/<scope>`, or `chore/<scope>`.
- **PRs**: Provide context, screenshots for UI changes, steps to validate, related issues (e.g., `Closes #123`). Ensure `npm run lint` passes.

## Security & Configuration Tips

- Never commit secrets; use `.env.local` (gitignored). MSW runs only in development.
- Access env via `app-config.ts`; keep config reads centralized and typed.

