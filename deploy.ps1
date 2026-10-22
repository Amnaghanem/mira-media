# Deploy Mira Media deck to GitHub + Vercel
# Run in PowerShell from this folder after GitHub CLI login.

$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;" + $env:Path

$repoName = "mira-media"
$root = $PSScriptRoot
Set-Location $root

Write-Host "`n=== Mira Media Deploy ===" -ForegroundColor Yellow

# 1. GitHub auth check
$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub login required. Complete this in your browser:" -ForegroundColor Cyan
  gh auth login --hostname github.com --git-protocol https --web
}

# 2. Commit any changes
if (git status --porcelain) {
  $env:GIT_AUTHOR_NAME = "Amna"
  $env:GIT_AUTHOR_EMAIL = "contact@miramedia.ae"
  $env:GIT_COMMITTER_NAME = "Amna"
  $env:GIT_COMMITTER_EMAIL = "contact@miramedia.ae"
  git add -A
  git commit -m "Update Mira Media deck"
}

# 3. Create GitHub repo and push (skip if remote exists)
$remote = git remote get-url origin 2>$null
if (-not $remote) {
  Write-Host "Creating GitHub repo: $repoName" -ForegroundColor Green
  gh repo create $repoName --public --source=. --remote=origin --push --description "Mira Media outdoor proposal deck"
} else {
  Write-Host "Pushing to existing remote..." -ForegroundColor Green
  git branch -M main 2>$null
  git push -u origin main 2>$null
  if ($LASTEXITCODE -ne 0) { git push -u origin master }
}

$repoUrl = gh repo view --json url -q .url
Write-Host "`nGitHub repo: $repoUrl" -ForegroundColor Green

Write-Host @"

=== Vercel (get your share link) ===
1. Open https://vercel.com/new
2. Sign in with GitHub
3. Import repo: $repoName
4. Click Deploy (no build settings needed - static site)
5. Your link will be: https://$repoName.vercel.app (or similar)

"@ -ForegroundColor Cyan

Write-Host "Done." -ForegroundColor Yellow
