#!/usr/bin/env bash
set -euo pipefail

# Configure GitHub branch protection via gh CLI.
# Requirements:
# - gh CLI authenticated with repo:write
# - Admin permissions on the repository

OWNER_REPO=${OWNER_REPO:-"vitkuz573/RemoteMaster-Server"}
BRANCH=${BRANCH:-"main"}

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required: https://cli.github.com/" >&2
  exit 1
fi

echo "Applying branch protection on ${OWNER_REPO}@${BRANCH}..."

# Base protection: require PRs, code owner review, conversations resolved, etc.
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  \
  "/repos/${OWNER_REPO}/branches/${BRANCH}/protection" \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f required_pull_request_reviews.dismiss_stale_reviews=true \
  -f required_pull_request_reviews.require_code_owner_reviews=true \
  -f enforce_admins=true \
  -f restrictions= \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f required_conversation_resolution=true \
  -f required_status_checks.strict=true \
  -F required_status_checks.contexts[]=

# Try to discover latest CI job names and set required status checks.
echo "Discovering latest CI job names for required status checks..."

set +e
WORKFLOW_ID=$(gh api \
  "/repos/${OWNER_REPO}/actions/workflows/ci.yml" -q .id 2>/dev/null)

RUN_ID=""
if [[ -n "$WORKFLOW_ID" ]]; then
  RUN_ID=$(gh api \
    "/repos/${OWNER_REPO}/actions/workflows/${WORKFLOW_ID}/runs?branch=${BRANCH}&status=completed&per_page=1" \
    -q '.workflow_runs[0].id' 2>/dev/null)
fi

declare -a JOB_NAMES
if [[ -n "$RUN_ID" ]]; then
  # Extract job names from the latest completed run on the branch
  mapfile -t JOB_NAMES < <(gh api \
    "/repos/${OWNER_REPO}/actions/runs/${RUN_ID}/jobs" -q '.jobs[].name' 2>/dev/null)
fi
set -e

if [[ ${#JOB_NAMES[@]} -eq 0 ]]; then
  echo "Could not auto-detect job names; using defaults."
  JOB_NAMES=(
    "lint-typecheck-test (18.x)"
    "lint-typecheck-test (20.x)"
  )
fi

REQ_ARGS=("--method" "PATCH" "-H" "Accept: application/vnd.github+json" \
  "/repos/${OWNER_REPO}/branches/${BRANCH}/protection/required_status_checks" \
  "-f" "strict=true")

for name in "${JOB_NAMES[@]}"; do
  REQ_ARGS+=("-F" "contexts[]=${name}")
done

gh api "${REQ_ARGS[@]}"

echo "Done. Required checks set to: ${JOB_NAMES[*]}"
echo "Review settings in repository Settings → Branches."
