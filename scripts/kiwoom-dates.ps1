$tasks = Get-ScheduledTask | Where-Object { $_.TaskName -match 'Kiwoom|Stock|AutoStop' -or $_.TaskName -match 'HTS' }
foreach ($t in $tasks) {
    $info = $t | Get-ScheduledTaskInfo -EA SilentlyContinue
    Write-Host "=== $($t.TaskName) ===" -ForegroundColor Cyan
    Write-Host "  State: $($t.State)"
    Write-Host "  LastRun: $($info.LastRunTime)"
    Write-Host "  NextRun: $($info.NextRunTime)"
    Write-Host "  Date: $($t.Date)"
    Write-Host ""
}
