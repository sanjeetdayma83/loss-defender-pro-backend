param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

Write-Host ""
Write-Host "Paste Dart code below." -ForegroundColor Yellow
Write-Host "When finished press Ctrl+Z then Enter." -ForegroundColor Cyan
Write-Host ""

$content = [System.Console]::In.ReadToEnd()

if ([string]::IsNullOrWhiteSpace($content)) {
    Write-Host "No content received." -ForegroundColor Red
    exit
}

$folder = Split-Path $Path

if (!(Test-Path $folder)) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Set-Content `
    -Path $Path `
    -Value $content `
    -Encoding UTF8

dart format $Path

flutter analyze

Write-Host ""
Write-Host "Done." -ForegroundColor Green