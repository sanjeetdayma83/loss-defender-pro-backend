param(
    [Parameter(Position=0)]
    [string]$Command,

    [Parameter(Position=1)]
    [string]$Argument
)

$Root = Split-Path $PSScriptRoot -Parent

switch ($Command.ToLower()) {

    "write" {

        if ([string]::IsNullOrWhiteSpace($Argument)) {
            Write-Host "Usage: LDP Write <file.dart>" -ForegroundColor Yellow
            exit
        }

        $File = Join-Path $Root $Argument

        $Dir = Split-Path $File

        if (!(Test-Path $Dir)) {
            New-Item -ItemType Directory -Force -Path $Dir | Out-Null
        }

        Write-Host ""
        Write-Host "Paste Dart code below." -ForegroundColor Cyan
        Write-Host "Press Ctrl+Z then Enter when finished." -ForegroundColor Yellow
        Write-Host ""

        $Content = [Console]::In.ReadToEnd()

        Set-Content `
            -Path $File `
            -Value $Content `
            -Encoding UTF8

        dart format $File

        flutter analyze

        Write-Host ""
        Write-Host "Saved Successfully." -ForegroundColor Green
    }

    "read" {

        if (!(Test-Path (Join-Path $Root $Argument))) {
            Write-Host "File not found." -ForegroundColor Red
            exit
        }

        Get-Content (Join-Path $Root $Argument) -Raw | Set-Clipboard

        Write-Host "Copied to clipboard." -ForegroundColor Green
    }

    "share" {

        if (!(Test-Path (Join-Path $Root $Argument))) {
            Write-Host "File not found." -ForegroundColor Red
            exit
        }

        $Path = Join-Path $Root $Argument

        @"
===== FILE =====
$Argument

===== CONTENT =====

$(Get-Content $Path -Raw)
"@ | Set-Clipboard

        Write-Host "Ready to paste into ChatGPT." -ForegroundColor Green
    }

    "analyze" {

        flutter analyze

    }

    "run" {

        flutter run

    }

    "clean" {

        flutter clean
        flutter pub get

    }

    "doctor" {

        flutter doctor -v

    }

    default {

        Write-Host ""
        Write-Host "===================================" -ForegroundColor Cyan
        Write-Host " Loss Defender Pro CLI v1" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Commands"
        Write-Host ""
        Write-Host "LDP Write <file>"
        Write-Host "LDP Read <file>"
        Write-Host "LDP Share <file>"
        Write-Host "LDP Analyze"
        Write-Host "LDP Run"
        Write-Host "LDP Clean"
        Write-Host "LDP Doctor"
        Write-Host ""
    }
}