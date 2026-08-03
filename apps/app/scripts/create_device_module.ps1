$module = "device"

$base = "lib/shared/$module"

$folders = @(
    "$base",
    "$base/models",
    "$base/services",
    "$base/providers",
    "$base/repositories",
    "$base/widgets",
    "$base/pages"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
        Write-Host "Created Folder: $folder" -ForegroundColor Green
    }
}

$files = @{
    "$base/models/device_model.dart" = ""
    "$base/services/device_service.dart" = ""
    "$base/providers/device_provider.dart" = ""
    "$base/repositories/device_repository.dart" = ""
    "$base/widgets/device_status_card.dart" = ""
    "$base/widgets/device_selector_dialog.dart" = ""
    "$base/pages/device_page.dart" = ""
}

foreach ($file in $files.Keys) {
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Path $file | Out-Null
        Write-Host "Created File: $file" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Yellow
Write-Host " Device Module Created Successfully " -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Yellow