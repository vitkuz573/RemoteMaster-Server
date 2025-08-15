#!/usr/bin/env bash
set -euo pipefail

# Requires: GitHub CLI (gh) authenticated with repo:admin scope
# Usage:
#   OWNER_REPO="owner/repo" BRANCH="main" bash scripts/setup-branch-protection.sh

: "${OWNER_REPO:?OWNER_REPO is required, e.g. owner/repo}"
: "${BRANCH:=main}"

echo "Configuring branch protection for ${OWNER_REPO}:${BRANCH}"

gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${OWNER_REPO}/branches/${BRANCH}/protection" \
  -f required_pull_request_reviews.dismiss_stale_reviews=true \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f required_status_checks.strict=true \
  -f enforce_admins=true \
  -f restrictions=null \
  -F required_status_checks.contexts[]='CI / lint (20.x)' \
  -F required_status_checks.contexts[]='CI / typecheck (20.x)' \
  -F required_status_checks.contexts[]='CI / test (20.x)' \
  -F required_status_checks.contexts[]='CI / build' \
  -F required_status_checks.contexts[]='CodeQL / Analyze (javascript-typescript)'

echo "Done. Adjust required checks to match your workflow job names if needed."

