$tasks = Get-ScheduledTask | Where-Object { $_.TaskName -match 'HTS' -and $_.TaskName -notmatch 'AutoStop' }
foreach ($t in $tasks) {
    Write-Host "Removing: $($t.TaskName)"
    Unregister-ScheduledTask -TaskName $t.TaskName -TaskPath $t.TaskPath -Confirm:$false
    Write-Host "Done"
}
# Verify KiwoomAutoStop still exists
$keep = Get-ScheduledTask -TaskName 'KiwoomAutoStop' -EA SilentlyContinue
if ($keep) { Write-Host "KiwoomAutoStop OK - still active" -ForegroundColor Green }
