param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [string]$Content,

    [switch]$Format
)

$ErrorActionPreference = "Stop"

$directory = Split-Path $Path -Parent

if (!(Test-Path $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

$content | Set-Content -Path $Path -Encoding UTF8

if ($Format) {
    dart format $Path
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Dart File Generated Successfully" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "File : $Path" -ForegroundColor Yellow