$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root "dist"
$ManifestPath = Join-Path $Dist "manifest.json"
$ReleaseDir = Join-Path $Root "releases"

if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "dist/manifest.json was not found. Run npm run build first."
}

$Manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version
$ZipPath = Join-Path $ReleaseDir "ipe-chrome-v$Version.zip"

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
if (Test-Path -LiteralPath $ZipPath) {
  Remove-Item -LiteralPath $ZipPath -Force
}

Compress-Archive -Path (Join-Path $Dist "*") -DestinationPath $ZipPath -CompressionLevel Optimal
Write-Output "Created $ZipPath"
