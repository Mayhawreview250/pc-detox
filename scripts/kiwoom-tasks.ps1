Get-ScheduledTask | Where-Object { $_.TaskName -match 'Kiwoom|Stock|HTS' -or $_.TaskName -match 'AutoStop' } | ForEach-Object {
    Write-Host "Task: $($_.TaskName)" -ForegroundColor Cyan
    Write-Host "  State: $($_.State)"
    $_.Actions | ForEach-Object {
        Write-Host "  Execute: $($_.Execute)"
        Write-Host "  Args: $($_.Arguments)"
        Write-Host "  WorkDir: $($_.WorkingDirectory)"
    }
    Write-Host ""
}
