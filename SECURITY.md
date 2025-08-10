# Security Policy

- Report vulnerabilities by opening a private security advisory on GitHub or emailing security@example.com.
- Please do not disclose security issues publicly until we have released a fix.
- For dependency updates, Dependabot is enabled. CI enforces lint, typecheck and tests.

## Supported Versions

We aim to support the latest minor version on the `main` branch. Security fixes are released via Release Please.

## Best Practices in Repo

- Strict TypeScript compiler settings
- ESLint with Next.js rules
- Commitlint + PR title checks (Conventional Commits)
- CI matrix for Node 18/20 with coverage artifacts
- Security headers and CSP via Next config
- Environment variable validation (Zod)
- Optional Docker image for production

