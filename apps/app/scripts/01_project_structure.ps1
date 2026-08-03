# ==========================================================
# Loss Defender Pro - Flutter Project Structure Generator
# Script: 01_project_structure.ps1
# ==========================================================

$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Creating Enterprise Flutter Structure"
Write-Host "==========================================" -ForegroundColor Cyan

# ----------------------------------------------------------
# Folders
# ----------------------------------------------------------

$folders = @(

# Assets
"assets",
"assets/images",
"assets/icons",
"assets/svg",
"assets/fonts",
"assets/lottie",
"assets/animations",
"assets/illustrations",
"assets/logos",
"assets/mock",
"assets/sounds",

# Lib Root
"lib",

# App
"lib/app",

# Config
"lib/config",
"lib/config/env",
"lib/config/constants",

# Core
"lib/core",
"lib/core/api",
"lib/core/network",
"lib/core/storage",
"lib/core/security",
"lib/core/helpers",
"lib/core/utils",
"lib/core/extensions",
"lib/core/services",
"lib/core/validators",
"lib/core/exceptions",

# Shared
"lib/shared",
"lib/shared/widgets",
"lib/shared/dialogs",
"lib/shared/forms",
"lib/shared/buttons",
"lib/shared/cards",
"lib/shared/loaders",

# Features
"lib/features",

# Routes
"lib/routes",

# Theme
"lib/theme",

# Localization
"lib/localization",

# Generated
"lib/generated"

)

foreach ($folder in $folders)
{
    New-Item `
        -ItemType Directory `
        -Force `
        -Path (Join-Path $ProjectRoot $folder) | Out-Null

    Write-Host "[Folder] $folder" -ForegroundColor Green
}

# ----------------------------------------------------------
# Starter Dart Files
# ----------------------------------------------------------

$files = @(

"lib/app/app.dart",
"lib/app/bootstrap.dart",

"lib/routes/app_router.dart",
"lib/routes/app_routes.dart",

"lib/theme/app_theme.dart",
"lib/theme/light_theme.dart",
"lib/theme/dark_theme.dart",
"lib/theme/app_colors.dart",
"lib/theme/app_typography.dart",

"lib/config/constants/app_constants.dart",

"lib/core/api/api_client.dart",

"lib/main.dart"

)

foreach ($file in $files)
{
    $path = Join-Path $ProjectRoot $file

    if (!(Test-Path $path))
    {
        New-Item `
            -ItemType File `
            -Path $path | Out-Null

        Write-Host "[File] $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Project Structure Created Successfully"
Write-Host "==========================================" -ForegroundColor Cyan