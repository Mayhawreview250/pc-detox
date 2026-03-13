# Remove bloatware apps
Write-Host "=== Removing bloatware ===" -ForegroundColor Cyan

$removeApps = @(
    'FACEBOOK.317180B0BB486',
    'Microsoft.BingWeather',
    'Microsoft.PowerAutomateDesktop',
    'Microsoft.Todos',
    'Microsoft.Copilot',
    'Microsoft.Whiteboard',
    'Microsoft.MicrosoftPowerBIForWindows',
    'Microsoft.WindowsMaps',
    'Microsoft.WindowsFeedbackHub',
    'Microsoft.Edge.GameAssist',
    'Microsoft.XboxGameCallableUI',
    'Microsoft.XboxGameOverlay',
    'Microsoft.XboxGamingOverlay',
    'Microsoft.XboxIdentityProvider',
    'Microsoft.XboxSpeechToTextOverlay',
    'SAMSUNGELECTRONICSCO.LTD.SmartThingsWindows',
    'ALZipShell',
    'MSTeams',
    'Sidia.LiveWallpaper',
    'MicrosoftCorporationII.WindowsSubsystemForLinux',
    'Microsoft.BingSearch'
)

$removed = 0
foreach ($app in $removeApps) {
    $pkg = Get-AppxPackage -Name $app -EA SilentlyContinue
    if ($pkg) {
        try {
            $pkg | Remove-AppxPackage -EA Stop
            Write-Host "  [OK] $app" -ForegroundColor Green
            $removed++
        } catch {
            Write-Host "  [FAIL] $app : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  [SKIP] $app (not found)" -ForegroundColor DarkGray
    }
}

# Remove QuickSearch scheduled tasks
Write-Host "`n=== Removing scheduled tasks ===" -ForegroundColor Cyan
$taskPatterns = @('QuickSearchIndexer', 'Opera scheduled', 'Samsung')
$allTasks = Get-ScheduledTask -EA SilentlyContinue
foreach ($pattern in $taskPatterns) {
    $matches = $allTasks | Where-Object { $_.TaskName -match $pattern -or $_.TaskPath -match $pattern }
    foreach ($t in $matches) {
        try {
            Unregister-ScheduledTask -TaskName $t.TaskName -TaskPath $t.TaskPath -Confirm:$false -EA Stop
            Write-Host "  [OK] Task: $($t.TaskName)" -ForegroundColor Green
            $removed++
        } catch {
            Write-Host "  [FAIL] Task: $($t.TaskName) : $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Done: $removed items removed ===" -ForegroundColor Cyan
