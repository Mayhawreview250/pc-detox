Write-Host "=== Scheduled Tasks (non-Windows) ===" -ForegroundColor Cyan
$tasks = Get-ScheduledTask | Where-Object { $_.State -ne 'Disabled' -and $_.TaskPath -notmatch '\\Microsoft\\Windows\\' } | Sort-Object TaskPath, TaskName
foreach ($t in $tasks) {
    Write-Host "  [$($t.State)] $($t.TaskPath)$($t.TaskName)"
}
$winCount = (Get-ScheduledTask | Where-Object { $_.State -ne 'Disabled' -and $_.TaskPath -match '\\Microsoft\\Windows\\' }).Count
Write-Host "`nWindows core tasks: $winCount (normal, not shown)"
Write-Host "Non-Windows tasks: $($tasks.Count)"
