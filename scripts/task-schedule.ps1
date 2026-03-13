$tasks = @('KiwoomAutoStop','StockDailyAgent')
foreach ($name in $tasks) {
    $t = Get-ScheduledTask -TaskName $name -EA SilentlyContinue
    if ($t) {
        Write-Host "=== $name ===" -ForegroundColor Cyan
        $t.Triggers | ForEach-Object {
            Write-Host "  Type: $($_.CimClass.CimClassName)"
            Write-Host "  StartBoundary: $($_.StartBoundary)"
            Write-Host "  Repetition: $($_.Repetition.Interval) / $($_.Repetition.Duration)"
            Write-Host "  Enabled: $($_.Enabled)"
            Write-Host ""
        }
    }
}
