param(
    [Parameter(Mandatory = $true)]
    [string]$Module,

    [Parameter(Mandatory = $true)]
    [string]$Name,

    [string]$BasePath = "lib"
)

$moduleFolder = $Module.ToLower()

$fileName = ($Name -replace '([a-z0-9])([A-Z])','$1_$2').ToLower()

$target = Join-Path $BasePath "shared\$moduleFolder\models\$fileName.dart"

$content = @"
class $Name {

  const $Name();

}
"@

& ".\scripts\generators\Write-DartFile.ps1" `
    -Path $target `
    -Content $content `
    -Format

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host " Model Generated Successfully"
Write-Host "======================================" -ForegroundColor Green
Write-Host "Module : $Module"
Write-Host "Model  : $Name"
Write-Host "File   : $target"