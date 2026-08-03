# ============================================
# Loss Defender Pro - Enterprise Structure
# ============================================

$Root = Split-Path -Parent $PSScriptRoot

function New-Folder($path) {
    New-Item -ItemType Directory -Force -Path (Join-Path $Root $path) | Out-Null
}

function New-Dart($path) {
    $full = Join-Path $Root $path
    if (!(Test-Path $full)) {
        New-Item -ItemType File -Force -Path $full | Out-Null
    }
}

# ============================================
# FEATURES
# ============================================

$features = @(
"authentication",
"splash",
"dashboard",
"companies",
"warehouses",
"users",
"orders",
"recordings",
"scanner",
"evidence",
"claims",
"returns",
"analytics",
"notifications",
"profile",
"settings",
"plans",
"reports"
)

foreach($feature in $features){

    $base = "lib/features/$feature"

    $folders = @(
    "$base/data",
    "$base/data/models",
    "$base/data/repositories",
    "$base/data/datasources",

    "$base/domain",
    "$base/domain/entities",
    "$base/domain/repositories",
    "$base/domain/usecases",

    "$base/presentation",
    "$base/presentation/pages",
    "$base/presentation/widgets",
    "$base/presentation/providers",
    "$base/presentation/controllers",
    "$base/presentation/dialogs",

    "$base/routes"
    )

    foreach($folder in $folders){
        New-Folder $folder
    }

    $files = @(
    "$base/presentation/pages/${feature}_page.dart",
    "$base/presentation/providers/${feature}_provider.dart",
    "$base/presentation/controllers/${feature}_controller.dart",
    "$base/data/models/${feature}_model.dart",
    "$base/data/repositories/${feature}_repository.dart",
    "$base/data/datasources/${feature}_remote_datasource.dart",
    "$base/domain/entities/${feature}_entity.dart",
    "$base/domain/repositories/i_${feature}_repository.dart",
    "$base/domain/usecases/get_${feature}.dart",
    "$base/routes/${feature}_routes.dart"
    )

    foreach($file in $files){
        New-Dart $file
    }
}

# ============================================
# SHARED
# ============================================

$sharedFolders = @(
"lib/shared/widgets",
"lib/shared/widgets/buttons",
"lib/shared/widgets/cards",
"lib/shared/widgets/charts",
"lib/shared/widgets/dialogs",
"lib/shared/widgets/forms",
"lib/shared/widgets/inputs",
"lib/shared/widgets/loaders",
"lib/shared/widgets/tables",
"lib/shared/widgets/video",
"lib/shared/widgets/scanner",

"lib/shared/constants",
"lib/shared/extensions",
"lib/shared/models",
"lib/shared/utils"
)

foreach($folder in $sharedFolders){
    New-Folder $folder
}

# ============================================
# CORE
# ============================================

$coreFolders = @(
"lib/core/api",
"lib/core/network",
"lib/core/storage",
"lib/core/services",
"lib/core/security",
"lib/core/logger",
"lib/core/database",
"lib/core/helpers",
"lib/core/utils",
"lib/core/validators",
"lib/core/mixins",
"lib/core/errors"
)

foreach($folder in $coreFolders){
    New-Folder $folder
}

$coreFiles = @(
"lib/core/api/api_client.dart",
"lib/core/network/network_info.dart",
"lib/core/storage/secure_storage.dart",
"lib/core/storage/local_storage.dart",
"lib/core/logger/app_logger.dart",
"lib/core/errors/app_exception.dart",
"lib/core/errors/failure.dart"
)

foreach($file in $coreFiles){
    New-Dart $file
}

# ============================================
# CONFIG
# ============================================

$configFolders = @(
"lib/config",
"lib/config/constants",
"lib/config/env"
)

foreach($folder in $configFolders){
    New-Folder $folder
}

$configFiles = @(
"lib/config/constants/app_constants.dart",
"lib/config/constants/api_constants.dart",
"lib/config/env/environment.dart"
)

foreach($file in $configFiles){
    New-Dart $file
}

# ============================================
# ROUTES
# ============================================

$routeFiles = @(
"lib/routes/app_router.dart",
"lib/routes/app_routes.dart",
"lib/routes/route_guard.dart"
)

foreach($file in $routeFiles){
    New-Dart $file
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "Enterprise Structure Created"
Write-Host "===================================" -ForegroundColor Green