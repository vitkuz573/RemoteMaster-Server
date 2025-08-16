# RemoteMaster Server UI

<!-- badges:start -->
[![CI](https://github.com/vitkuz573/RemoteMaster-Server/actions/workflows/ci.yml/badge.svg)](https://github.com/vitkuz573/RemoteMaster-Server/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/vitkuz573/RemoteMaster-Server/branch/main/graph/badge.svg)](https://app.codecov.io/gh/vitkuz573/RemoteMaster-Server)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/vitkuz573/RemoteMaster-Server/badge)](https://securityscorecards.dev/viewer/?uri=github.com/vitkuz573/RemoteMaster-Server)
<!-- badges:end -->

A modern React application built with Next.js 15 and shadcn UI, featuring enterprise-grade authentication, organizational management, and host monitoring capabilities.

## 🚀 Features

- **Modern UI/UX** - Built with shadcn UI components for consistent design
- **Enterprise Authentication** - SSO and credential-based login systems
- **Organizational Management** - Multi-tenant architecture with organizational units
- **Host Monitoring** - Real-time status monitoring and management
- **Responsive Design** - Works seamlessly across all devices
- **Dark Mode Support** - Built-in theme switching
- **Accessibility** - WCAG compliant with proper ARIA attributes

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Type Safety**: TypeScript
- **Authentication**: Custom SSO implementation

## 📦 Architecture

### Core Components
- `LoadingSpinner` - Consistent loading states across the application
- `StatusIndicator` - Status badges with icons for host monitoring
- `NotificationPanel` - Notification system using shadcn Popover
- `ModeToggle` - Toggle component for mode switching

### Key Features
- **Portal-free Popovers** - Using shadcn Popover instead of manual portals
- **Consistent Loading States** - Reusable LoadingSpinner component
- **Status Management** - Proper status indicators with badges and icons
- **Form Handling** - Ready for react-hook-form integration
- **Error Boundaries** - Proper error handling throughout the app

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd remotemaster-server
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
remotemaster-server/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── login/             # Authentication pages
│   ├── admin/             # Admin panel
│   └── layout.tsx         # Root layout
├── components/
│   └── ui/                # shadcn UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── popover.tsx
│       ├── loading-spinner.tsx
│       ├── status-indicator.tsx
│       ├── notification-panel.tsx
│       └── mode-toggle.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── contexts/              # React contexts
└── public/                # Static assets
```

## 🎨 Design System

This project uses shadcn UI as the foundation for all UI components, ensuring:

- **Consistency** - Unified design language across all components
- **Accessibility** - Built-in ARIA attributes and keyboard navigation
- **Customization** - Easy theming with Tailwind CSS
- **Performance** - Optimized bundle size and rendering

### Component Usage

```typescript
// Loading states
import { LoadingSpinner } from '@/components/ui/loading-spinner';
<LoadingSpinner size="lg" text="Loading data..." />

// Status indicators
import { StatusIndicator } from '@/components/ui/status-indicator';
<StatusIndicator status="online" showText size="md" />

// Notifications
import { NotificationPanel } from '@/components/ui/notification-panel';
<NotificationPanel notifications={notifications} enabled={true} count={3} />

// Mode toggles
import { ModeToggle } from '@/components/ui/mode-toggle';
<ModeToggle modes={modes} value={value} onValueChange={handleChange} />
```

## 🔧 Development

### API Mocking with MSW

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) for API mocking in development:

- **Automatic in Development**: MSW automatically runs when `NODE_ENV === 'development'`
- **Real HTTP Requests**: Intercepts real `fetch()` requests at the network level
- **No Code Changes**: Your API service code works the same with real and mock data
- **Realistic Responses**: Returns realistic mock data with proper delays

### Available Scripts

- `npm run dev` - Start development server (with MSW enabled)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` / `npm run format:check` - Prettier formatting (write/check)

### Makefile Shortcuts

If you prefer `make`:

- `make install` → install dependencies (`npm ci`)
- `make dev` → start dev server
- `make lint` / `make typecheck` → lint and TS check
- `make test`, `make test-watch`, `make test-coverage` → run tests
- `make ci` → lint + typecheck + coverage (mirrors CI)

### Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting
- **shadcn UI** - Consistent component patterns
- **React Best Practices** - Modern React patterns and hooks

## 🧪 CI Overview

- Matrix: Node `20.x`, `22.x` for lint, typecheck, and tests.
- Build job: runs `npm run build` on Node from `.nvmrc` with cached `.next/cache`.
- Coverage: Vitest coverage uploaded to Codecov (token optional; does not fail CI).
- Optimizations: PRs/doc-only changes are ignored to save minutes.
- Merge Queue: CI supports `merge_group` events for GitHub Merge Queue.
- Security: CodeQL + Semgrep (scheduled), Trivy container scan with path filters.
- Scorecard: OSSF Scorecard runs weekly and on push.
- PR annotations: reviewdog posts ESLint and TypeScript comments inline on diffs.
- Workflow lint: `actionlint` validates GitHub Actions workflows.
- Audit policy: fail on HIGH severity on `main/master`; advisory in PRs.
- SBOM: CycloneDX JSON is generated from the Docker image and uploaded as an artifact.
- Standalone artifact: Next.js `output: 'standalone'` produces artifacts for preview/deploy.
 - Release artifacts: on `v*` tags, CI builds the standalone app and Docker image, pushes to GHCR, and attaches the SBOM.
 - Harden Runner: all workflows use network policies (egress audit) to reduce supply‑chain risk.

### Release Publishing

- Create a `vX.Y.Z` tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`.
- The `Release Artifacts` workflow produces:
  - Standalone deployment artifact (`.next/standalone`, `.next/static`, `public`).
  - Docker image in GHCR: `ghcr.io/<owner>/<repo>:vX.Y.Z`.
  - SBOM for the image (CycloneDX) as an artifact.

### Pinning and Hardening

- The `Ensure Actions Pinned` workflow (manual/scheduled) verifies actions are pinned by SHA.
- `step-security/harden-runner` with egress audit is enabled in all workflows.

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker

Build and run a production image:

```bash
docker build -t remotemaster-server-ui .
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://api.example.com" \
  remotemaster-server-ui
```

### Windows Notes

- Use Git Bash (bundled with Git for Windows) or WSL2 for full compatibility with Husky hooks and shell scripts.
- Все npm-скрипты кроссплатформенные и работают в PowerShell/CMD/Git Bash. Makefile — опционален (требует make).
- Скрипт защиты ветки доступен и для PowerShell: `scripts/setup-branch-protection.ps1`.

Примеры:

```powershell
# PowerShell
npm ci
npm run format:check; npm run lint; npm run typecheck; npm run test
npm run storybook

# Настройка защиты ветки (требует gh auth login)
./scripts/setup-branch-protection.ps1 -OwnerRepo "vitkuz573/RemoteMaster-Server" -Branch "master" -IncludeChromatic
```

### Environment Variables

Create a `.env.local` file (see `.env.example` for all options):

```env
# API Configuration
NEXT_PUBLIC_API_URL=your-api-url
```

**Note:** MSW (Mock Service Worker) automatically runs in development mode for API mocking.

Environment variables are validated with Zod at startup. Invalid or missing values fall back to safe defaults in development and should be explicitly configured in production.

### E2E Tests

- Install Playwright and its browsers after dependencies:
  - `npm i -D @playwright/test @axe-core/playwright`
  - `npx playwright install --with-deps`
- Run: `npx playwright test` (or set `E2E_BASE_URL` for non‑default URL)

### Security & Scanning

- CI runs `npm audit` (prod deps), CodeQL SAST, Semgrep, Trivy container scan.
- CSP is enabled with reporting endpoint at `/api/csp-reports` (report‑only header in dev).
- Client error reporting can be enabled via `NEXT_PUBLIC_ERROR_REPORTING_ENABLED=true`.
- Serves security.txt at `/.well-known/security.txt` (see SECURITY.md / GitHub policy link).

## 🤝 Contributing

Please read AGENTS.md for repository guidelines, coding standards, and PR process.

1. Follow the existing code patterns
2. Use shadcn UI components for new features
3. Maintain TypeScript type safety
4. Add proper error handling
5. Test accessibility features

## 📦 Releases

This repo uses Release Please to automate versioning and changelogs.

- Commit using clear, conventional types (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- When changes land on `main`/`master`, Release Please opens a release PR that bumps the version and updates `CHANGELOG.md`.
- Merge the release PR to create a Git tag and GitHub Release. No manual version edits are needed.

Branch protection (recommended): require PRs, passing CI checks, and enable auto‑merge. You can also auto‑merge Dependabot PRs for safe updates (configured in `.github/workflows/dependabot-auto-merge.yml`).

Helper script (requires GitHub CLI):

```bash
# set or export OWNER_REPO and BRANCH if different
bash scripts/setup-branch-protection.sh
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please refer to:
- [shadcn UI Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
