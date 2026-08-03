param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

if (!(Test-Path $Path)) {
    Write-Host "File not found: $Path" -ForegroundColor Red
    exit
}

$content = Get-Content $Path -Raw

$text = @"
===== FILE =====
$Path

===== CONTENT =====

$content
"@

$text | Set-Clipboard

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Copied to Clipboard Successfully" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host $Path -ForegroundColor Cyan