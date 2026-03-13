Write-Host "=== Installed Apps ===" -ForegroundColor Cyan
$apps = Get-AppxPackage | Select-Object Name | Sort-Object Name
foreach ($app in $apps) {
    $n = $app.Name
    $cat = ""
    if ($n -match 'Samsung') { $cat = "[SAMSUNG]" }
    elseif ($n -match 'Xbox|GamingApp|GameBar') { $cat = "[XBOX]" }
    elseif ($n -match 'BingWeather|BingNews|BingFinance|BingSports|MicrosoftSolitaire|Clipchamp|Todos|PowerAutomateDesktop|Family') { $cat = "[MS-BLOAT]" }
    elseif ($n -match 'Spotify|Disney|TikTok|Instagram|Facebook|LinkedIn|Netflix') { $cat = "[AD-BUNDLE]" }
    elseif ($n -match 'ZuneMusic|ZuneVideo|People|YourPhone|Phone') { $cat = "[MEDIA]" }
    elseif ($n -match 'OneDrive') { $cat = "[ONEDRIVE]" }
    elseif ($n -match 'Microsoft\.Windows|WindowsStore|WindowsCalculator|WindowsCamera|WindowsAlarms|WindowsNotepad|WindowsTerminal') { $cat = "[WIN-CORE]" }
    elseif ($n -match 'Microsoft') { $cat = "[MS-OTHER]" }
    else { $cat = "[3RD]" }
    Write-Host "  $cat $n"
}
Write-Host "`nTotal: $($apps.Count)" -ForegroundColor Cyan
