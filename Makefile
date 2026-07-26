.DEFAULT_GOAL := help

APK_PATH := android/app/build/outputs/apk/debug/app-debug.apk
PS := powershell.exe -NoProfile -ExecutionPolicy Bypass -Command

.PHONY: help dev up preview build lint test android-sync apk install-apk reinstall-apk install-android devices

SETUP_PNPM := $$pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue; if (-not $$pnpm) { $$runtimeRoot = Join-Path $$env:LOCALAPPDATA 'OpenAI\Codex\runtimes\cua_node'; if (Test-Path $$runtimeRoot) { $$nodeBin = Get-ChildItem $$runtimeRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Join-Path $$_.FullName 'bin' }; if ($$nodeBin) { $$env:PATH = $$nodeBin + ';' + $$nodeBin + '\node_modules\corepack\shims;' + $$env:PATH } }; $$pnpm = Get-Command pnpm.cmd -ErrorAction Stop }
SETUP_ANDROID := $$toolsRoot = Join-Path (Get-Location) '.codex-android-tools'; $$jdkHome = Join-Path $$toolsRoot 'jdk21'; $$androidSdk = Join-Path $$toolsRoot 'android-sdk'; if (Test-Path (Join-Path $$jdkHome 'bin\java.exe')) { $$env:JAVA_HOME = $$jdkHome }; if (Test-Path $$androidSdk) { $$env:ANDROID_HOME = $$androidSdk; $$env:ANDROID_SDK_ROOT = $$androidSdk; $$env:PATH = $$jdkHome + '\bin;' + $$androidSdk + '\cmdline-tools\latest\bin;' + $$androidSdk + '\platform-tools;' + $$env:PATH }

help:
	@$(PS) "Write-Host 'Comandos principais:'; Write-Host '  make dev             Sobe o Vite local em http://127.0.0.1:5173'; Write-Host '  make apk             Gera APK debug e incrementa versionCode'; Write-Host '  make install-apk     Instala o APK debug em todos os Androids conectados via ADB'; Write-Host ''; Write-Host 'Aliases:'; Write-Host '  make up              Alias de dev'; Write-Host '  make reinstall-apk   Gera o APK e instala em todos os dispositivos conectados'; Write-Host '  make install-android Alias de reinstall-apk'; Write-Host ''; Write-Host 'Outros:'; Write-Host '  make build | lint | test | preview | devices | android-sync'"

dev:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run dev"

up: dev

preview:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run preview"

build:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run build"

lint:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run lint"

test:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run test"

android-sync:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run android:sync"

apk:
	@$(PS) "$(SETUP_PNPM); & $$pnpm.Source run android:apk"

devices:
	@$(PS) "$(SETUP_ANDROID); $$adb = Get-Command adb.exe -ErrorAction Stop; & $$adb.Source devices"

install-apk:
	@$(PS) "$(SETUP_ANDROID); & powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'scripts/install-android-apk.ps1' -ApkPath '$(APK_PATH)'"

reinstall-apk: apk install-apk

install-android: reinstall-apk
