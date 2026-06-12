$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot "logs"
$runnerPath = Join-Path $projectRoot "scripts\\run-build.ps1"

New-Item -ItemType Directory -Force $logDir | Out-Null

$taskName = "US-Iran-Monitor-Daily-1000"
$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runnerPath`""

$trigger = New-ScheduledTaskTrigger -Daily -At 10:00AM
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Rebuilds the US-Iran monitor page every day at 10:00." `
  -Force | Out-Null

Write-Host "Scheduled task registered: $taskName"
