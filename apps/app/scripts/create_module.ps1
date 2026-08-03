param(
    [Parameter(Mandatory = $true)]
    [string]$Module
)

$moduleLower = $Module.ToLower()
$moduleClass = (Get-Culture).TextInfo.ToTitleCase($moduleLower)

$base = "lib/features/$moduleLower"

$folders = @(
    "$base",
    "$base/constants",
    "$base/types",
    "$base/interfaces",
    "$base/data",
    "$base/data/models",
    "$base/data/repositories",
    "$base/data/datasources",
    "$base/presentation",
    "$base/presentation/pages",
    "$base/presentation/widgets",
    "$base/presentation/providers",
    "$base/presentation/controllers"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "Created Folder : $folder" -ForegroundColor Green
    }
}

$files = @{
"$base/$moduleLower.dart" = ""
"$base/constants/${moduleLower}_constants.dart" = ""
"$base/types/${moduleLower}_types.dart" = ""
"$base/interfaces/${moduleLower}_repository.dart" = ""

"$base/data/models/${moduleLower}_model.dart" = @"
class ${moduleClass}Model {

}
"@

"$base/data/repositories/${moduleLower}_repository.dart" = @"
class ${moduleClass}Repository {

}
"@

"$base/data/datasources/${moduleLower}_datasource.dart" = @"
class ${moduleClass}Datasource {

}
"@

"$base/presentation/providers/${moduleLower}_provider.dart" = @"
class ${moduleClass}Provider {

}
"@

"$base/presentation/controllers/${moduleLower}_controller.dart" = @"
class ${moduleClass}Controller {

}
"@

"$base/presentation/widgets/${moduleLower}_card.dart" = @"
import 'package:flutter/material.dart';

class ${moduleClass}Card extends StatelessWidget {

  const ${moduleClass}Card({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox();
  }
}
"@

"$base/presentation/pages/${moduleLower}_page.dart" = @"
import 'package:flutter/material.dart';

class ${moduleClass}Page extends StatelessWidget {

  const ${moduleClass}Page({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('$moduleClass Page'),
      ),
    );
  }
}
"@
}

foreach ($file in $files.Keys) {

    if (!(Test-Path $file)) {

        $content = $files[$file]

        Set-Content -Path $file -Value $content

        Write-Host "Created File : $file" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Host " Module [$moduleClass] Created" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Yellow