$ErrorActionPreference = "Stop"

$target = if ($args.Count -gt 0) { $args[0] } else { "help" }
$extraArgs = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] } else { @() }
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Set-Location $projectRoot

function Use-Pnpm {
  $pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
  if (-not $pnpm) {
    $runtimeRoot = Join-Path $env:LOCALAPPDATA "OpenAI\Codex\runtimes\cua_node"
    if (Test-Path $runtimeRoot) {
      $nodeBin = Get-ChildItem $runtimeRoot -Directory |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1 |
        ForEach-Object { Join-Path $_.FullName "bin" }

      if ($nodeBin) {
        $env:PATH = "$nodeBin;$nodeBin\node_modules\corepack\shims;$env:PATH"
      }
    }

    $pnpm = Get-Command pnpm.cmd -ErrorAction Stop
  }

  return $pnpm.Source
}

function Use-AndroidTools {
  $toolsRoot = Join-Path $projectRoot ".codex-android-tools"
  $jdkHome = Join-Path $toolsRoot "jdk21"
  $androidSdk = Join-Path $toolsRoot "android-sdk"

  if (Test-Path (Join-Path $jdkHome "bin\java.exe")) {
    $env:JAVA_HOME = $jdkHome
  }

  if (Test-Path $androidSdk) {
    $env:ANDROID_HOME = $androidSdk
    $env:ANDROID_SDK_ROOT = $androidSdk
    $env:PATH = "$jdkHome\bin;$androidSdk\cmdline-tools\latest\bin;$androidSdk\platform-tools;$env:PATH"
  }
}

function Show-Help {
  Write-Host "Comandos principais:"
  Write-Host "  .\make dev          Sobe o Vite local em http://127.0.0.1:5173"
  Write-Host "  .\make apk          Gera APK debug e incrementa versionCode"
  Write-Host "  .\make install-apk  Instala o APK debug no Android conectado via ADB"
  Write-Host ""
  Write-Host "Aliases:"
  Write-Host "  .\make up           Alias de dev"
  Write-Host "  .\make reinstall-apk Gera o APK e instala no dispositivo conectado"
  Write-Host ""
  Write-Host "Outros:"
  Write-Host "  .\make build | lint | test | preview | devices | android-sync"
}

switch ($target) {
  "help" {
    Show-Help
  }
  "dev" {
    & (Use-Pnpm) run dev @extraArgs
  }
  "up" {
    & (Use-Pnpm) run dev @extraArgs
  }
  "preview" {
    & (Use-Pnpm) run preview @extraArgs
  }
  "build" {
    & (Use-Pnpm) run build @extraArgs
  }
  "lint" {
    & (Use-Pnpm) run lint @extraArgs
  }
  "test" {
    & (Use-Pnpm) run test @extraArgs
  }
  "android-sync" {
    & (Use-Pnpm) run android:sync @extraArgs
  }
  "apk" {
    & (Use-Pnpm) run android:apk @extraArgs
  }
  "devices" {
    Use-AndroidTools
    $adb = Get-Command adb.exe -ErrorAction Stop
    & $adb.Source devices @extraArgs
  }
  "install-apk" {
    Use-AndroidTools
    $apkPath = Join-Path $projectRoot "android/app/build/outputs/apk/debug/app-debug.apk"
    if (-not (Test-Path $apkPath)) {
      throw "APK nao encontrado em $apkPath. Rode '.\make apk' primeiro."
    }

    $adb = Get-Command adb.exe -ErrorAction Stop
    & $adb.Source install -r $apkPath @extraArgs
  }
  "reinstall-apk" {
    & $PSCommandPath apk
    & $PSCommandPath install-apk @extraArgs
  }
  default {
    throw "Alvo desconhecido: $target. Rode '.\make help'."
  }
}
