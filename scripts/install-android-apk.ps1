param(
  [string]$ApkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$toolsRoot = Join-Path $projectRoot ".codex-android-tools"
$jdkHome = Join-Path $toolsRoot "jdk21"
$androidSdk = Join-Path $toolsRoot "android-sdk"

if (Test-Path (Join-Path $jdkHome "bin\java.exe")) {
  $env:JAVA_HOME = $jdkHome
}
if (Test-Path $androidSdk) {
  $env:ANDROID_HOME = $androidSdk
  $env:ANDROID_SDK_ROOT = $androidSdk
  $env:PATH = "$jdkHome\bin;$androidSdk\platform-tools;$env:PATH"
}

$apk = Join-Path $projectRoot $ApkPath
if (-not (Test-Path $apk)) {
  throw "APK nao encontrado em $apk. Rode make apk primeiro."
}

$adb = Get-Command adb.exe -ErrorAction Stop
$deviceLines = @(& $adb.Source devices)
if ($LASTEXITCODE -ne 0) {
  throw "Nao foi possivel listar os dispositivos Android via ADB."
}

$devices = @(
  $deviceLines | Select-Object -Skip 1 | ForEach-Object {
    $parts = $_.ToString().Trim() -split "\s+"
    if ($parts.Count -ge 2 -and $parts[1] -eq "device") {
      $parts[0]
    }
  } | Where-Object { $_ }
)

if ($devices.Count -eq 0) {
  $visibleDevices = $deviceLines | Select-Object -Skip 1 | Where-Object { $_.ToString().Trim() }
  $details = if ($visibleDevices) { "`n`nListagem do ADB:`n$($visibleDevices -join "`n")" } else { "" }
  throw "Nenhum dispositivo Android com status 'device' foi encontrado. Confira make devices e a autorizacao USB.$details"
}

$failedDevices = [System.Collections.Generic.List[string]]::new()
foreach ($serial in $devices) {
  Write-Host "Instalando APK em $serial..."
  & $adb.Source -s $serial install -r $apk
  if ($LASTEXITCODE -ne 0) {
    $failedDevices.Add($serial)
    Write-Warning "Falha ao instalar o APK em $serial."
    continue
  }
  Write-Host "APK instalado em $serial."
}

if ($failedDevices.Count -gt 0) {
  throw "A instalacao falhou nestes dispositivos: $($failedDevices -join ", ")."
}

Write-Host "APK instalado em $($devices.Count) dispositivo(s)."
