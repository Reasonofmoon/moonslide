$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root "manifest.json"

if (-not (Test-Path $manifestPath)) {
  throw "manifest.json not found: $manifestPath"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$distDir = Join-Path $root "dist"
$zipName = "notebooklm-slide-command-helper-v$version.zip"
$zipPath = Join-Path $distDir $zipName

if (-not (Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

$include = @(
  "manifest.json",
  "popup.html",
  "popup.js",
  "content.js",
  "dna-templates.js",
  "_locales",
  "icons",
  "README.md",
  "PRIVACY.md",
  "LICENSE"
)

$temp = Join-Path $distDir "_package_tmp"
if (Test-Path $temp) {
  Remove-Item $temp -Recurse -Force
}
New-Item -ItemType Directory -Path $temp | Out-Null

foreach ($entry in $include) {
  $src = Join-Path $root $entry
  if (-not (Test-Path $src)) {
    throw "Missing required release file/folder: $entry"
  }
  Copy-Item $src -Destination (Join-Path $temp $entry) -Recurse -Force
}

Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zipPath -Force
Remove-Item $temp -Recurse -Force

Write-Output "Created package: $zipPath"
