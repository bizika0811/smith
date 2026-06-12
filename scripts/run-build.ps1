$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = (Get-Command node).Source
$scriptPath = Join-Path $projectRoot "scripts\\build.mjs"
$logDir = Join-Path $projectRoot "logs"
$logPath = Join-Path $logDir "scheduled-build.log"

New-Item -ItemType Directory -Force $logDir | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$timestamp] Starting scheduled build" | Out-File -FilePath $logPath -Append -Encoding utf8

Push-Location $projectRoot
try {
  & $nodePath $scriptPath *>> $logPath
  $done = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "[$done] Build completed" | Out-File -FilePath $logPath -Append -Encoding utf8
}
catch {
  $failed = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "[$failed] Build failed: $($_.Exception.Message)" | Out-File -FilePath $logPath -Append -Encoding utf8
  throw
}
finally {
  Pop-Location
}
