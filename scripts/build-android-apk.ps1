$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$toolsRoot = Join-Path $projectRoot ".codex-android-tools"
$jdkHome = Join-Path $toolsRoot "jdk21"
$androidSdk = Join-Path $toolsRoot "android-sdk"
$sdkManager = Join-Path $androidSdk "cmdline-tools\latest\bin\sdkmanager.bat"

if (-not (Test-Path (Join-Path $jdkHome "bin\java.exe"))) {
  throw "JDK local nao encontrado em $jdkHome. Instale um JDK 21+ ou recrie .codex-android-tools."
}

if (-not (Test-Path $sdkManager)) {
  throw "Android SDK local nao encontrado em $androidSdk. Instale o Android command-line tools antes de gerar o APK."
}

$env:JAVA_HOME = $jdkHome
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:PATH = "$jdkHome\bin;$androidSdk\cmdline-tools\latest\bin;$androidSdk\platform-tools;$env:PATH"

$localProperties = Join-Path $projectRoot "android\local.properties"
$sdkDir = $androidSdk -replace "\\", "\\"
"sdk.dir=$sdkDir" | Set-Content -Encoding ASCII -Path $localProperties

Set-Location $projectRoot
tsc -b
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
vite build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location (Join-Path $projectRoot "android")
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
