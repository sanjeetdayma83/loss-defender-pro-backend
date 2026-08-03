Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host " Loss Defender Dev Check"
Write-Host "===============================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/4] Flutter Analyze..." -ForegroundColor Yellow
flutter analyze

if($LASTEXITCODE -ne 0){
    Write-Host ""
    Write-Host "Analyze Failed." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "[2/4] Pub Get..." -ForegroundColor Yellow
flutter pub get

Write-Host ""
Write-Host "[3/4] Formatting..." -ForegroundColor Yellow

Get-ChildItem lib -Recurse -Filter *.dart |
ForEach-Object{
    dart format $_.FullName | Out-Null
}

Write-Host ""
Write-Host "[4/4] Finished" -ForegroundColor Green

Write-Host ""
Write-Host "Project Healthy" -ForegroundColor Green