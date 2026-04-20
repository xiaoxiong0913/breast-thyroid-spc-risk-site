$ErrorActionPreference = "Stop"

$bundleRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoName = "breast-thyroid-spc-risk-site"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is not installed."
}

Push-Location $bundleRoot
try {
    if (-not (Test-Path ".git")) {
        git init -b main | Out-Null
    }

    git add .
    if (-not (git diff --cached --quiet)) {
        git commit -m "Prepare Render risk calculator service"
    }

    gh repo create $repoName --public --source . --remote origin --push
    Write-Host ""
    Write-Host "GitHub repo created and pushed."
    Write-Host "Next: open Render and create or update the Web Service from this repo."
}
finally {
    Pop-Location
}
