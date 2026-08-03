param(
    [Parameter(Mandatory=$true)]
    [string]$Path,

    [Parameter(Mandatory=$true)]
    [string]$Content
)

$directory = Split-Path $Path

if(!(Test-Path $directory)){
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

$Content | Set-Content -Path $Path -Encoding UTF8

dart format $Path

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " File Written Successfully"
Write-Host "===================================" -ForegroundColor Cyan
Write-Host $Path -ForegroundColor Green