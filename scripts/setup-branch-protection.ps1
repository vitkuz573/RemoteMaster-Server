Param(
  [Parameter(Mandatory=$true)][string]$OwnerRepo,
  [string]$Branch = "main",
  [switch]$IncludeChromatic
)

Write-Host "Configuring branch protection for $OwnerRepo:$Branch" -ForegroundColor Cyan

$argsList = @(
  "-X","PUT",
  "-H","Accept: application/vnd.github+json",
  "/repos/$OwnerRepo/branches/$Branch/protection",
  "-f","required_pull_request_reviews.dismiss_stale_reviews=true",
  "-f","required_pull_request_reviews.required_approving_review_count=1",
  "-f","required_status_checks.strict=true",
  "-f","enforce_admins=true",
  "-f","restrictions=null",
  "-F","required_status_checks.contexts[]=CI / lint (20.x)",
  "-F","required_status_checks.contexts[]=CI / typecheck (20.x)",
  "-F","required_status_checks.contexts[]=CI / test (20.x)",
  "-F","required_status_checks.contexts[]=CI / build",
  "-F","required_status_checks.contexts[]=CodeQL / Analyze (javascript-typescript)"
)

if ($IncludeChromatic) {
  $argsList += @("-F","required_status_checks.contexts[]=Chromatic")
}

gh api @argsList

Write-Host "Done. Adjust required checks to match your workflow job names if needed." -ForegroundColor Green

