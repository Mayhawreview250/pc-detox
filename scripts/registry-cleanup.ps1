# Registry Cleanup Script - OhMyComputer
# 삭제된 프로그램의 잔여 레지스트리 키를 찾아서 정리합니다

Write-Host "=== 레지스트리 정리 시작 ===" -ForegroundColor Cyan

# 1. 삭제된 프로그램의 Uninstall 키 찾기
Write-Host "`n[1/4] 삭제된 프로그램 Uninstall 키 스캔..." -ForegroundColor Yellow
$paths = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall'
)
$orphanKeys = @()
foreach ($regPath in $paths) {
    $items = Get-ChildItem $regPath -EA SilentlyContinue
    foreach ($key in $items) {
        $name = $key.GetValue('DisplayName')
        $loc = $key.GetValue('InstallLocation')
        if ($loc -and $loc.Length -gt 3 -and !(Test-Path $loc) -and $name) {
            $orphanKeys += [PSCustomObject]@{Name=$name; Path=$loc; RegKey=$key.PSPath}
            Write-Host "  [orphan] $name -> $loc" -ForegroundColor Red
        }
    }
}
Write-Host "  발견: $($orphanKeys.Count)개 고아 키"

# 2. 삭제 대상 키워드 (오늘 삭제한 프로그램들)
$deleteKeywords = @(
    'AhnLab','ALZip','ALYac','ALTools','ESTsoft',
    'Samsung','VOICEVOX','Waves','ReasonLabs','Safer Web',
    'nProtect','INCA','Veraport','Delfino',
    'HGrid','sCourt','IPinside','iniLINE',
    'MarkAny','RaonSecure','SoftForum','Wedisk',
    'Tenorshare','Unidocs','Inzisoft',
    'OneDrive','YourPhone','Phone Link',
    'GomDownloader','iFormScan','InziiForm',
    'CrossEX','TouchEn','nxKey','Wizvera',
    'NKRunLite','NKAgent',
    'Eagle','Obsidian','VideoLAN','VLC'
)

# 3. HKLM/HKCU에서 삭제 대상 소프트웨어 키 찾기
Write-Host "`n[2/4] 삭제 대상 소프트웨어 레지스트리 키 스캔..." -ForegroundColor Yellow
$softwarePaths = @(
    'HKLM:\SOFTWARE',
    'HKLM:\SOFTWARE\WOW6432Node',
    'HKCU:\SOFTWARE'
)
$targetKeys = @()
foreach ($sp in $softwarePaths) {
    $children = Get-ChildItem $sp -EA SilentlyContinue | Select-Object -ExpandProperty PSChildName
    foreach ($child in $children) {
        foreach ($kw in $deleteKeywords) {
            if ($child -like "*$kw*") {
                $fullPath = "$sp\$child"
                $targetKeys += $fullPath
                Write-Host "  [target] $fullPath" -ForegroundColor Red
            }
        }
    }
}
Write-Host "  발견: $($targetKeys.Count)개 대상 키"

# 4. 시작프로그램에서 삭제된 앱 찾기
Write-Host "`n[3/4] 시작프로그램 잔여 항목 스캔..." -ForegroundColor Yellow
$runPaths = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run',
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce'
)
$startupOrphans = @()
foreach ($rp in $runPaths) {
    $props = Get-ItemProperty $rp -EA SilentlyContinue
    if ($props) {
        $props.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | ForEach-Object {
            $val = $_.Value
            foreach ($kw in $deleteKeywords) {
                if ($val -like "*$kw*") {
                    $startupOrphans += [PSCustomObject]@{RegPath=$rp; Name=$_.Name; Value=$val}
                    Write-Host "  [startup] $($_.Name) -> $val" -ForegroundColor Red
                }
            }
        }
    }
}
Write-Host "  발견: $($startupOrphans.Count)개 시작프로그램 잔여"

# 5. 실행 (DRY RUN 먼저 - 삭제는 확인 후)
Write-Host "`n[4/4] 정리 실행..." -ForegroundColor Yellow

$deleted = 0

# Orphan uninstall 키 삭제
foreach ($o in $orphanKeys) {
    try {
        Remove-Item $o.RegKey -Recurse -Force -EA Stop
        Write-Host "  [deleted] Uninstall: $($o.Name)" -ForegroundColor Green
        $deleted++
    } catch {
        Write-Host "  [skip] $($o.Name): $_" -ForegroundColor DarkYellow
    }
}

# Target software 키 삭제
foreach ($tk in $targetKeys) {
    try {
        Remove-Item $tk -Recurse -Force -EA Stop
        Write-Host "  [deleted] Software: $tk" -ForegroundColor Green
        $deleted++
    } catch {
        Write-Host "  [skip] $tk : $_" -ForegroundColor DarkYellow
    }
}

# Startup orphan 삭제
foreach ($so in $startupOrphans) {
    try {
        Remove-ItemProperty -Path $so.RegPath -Name $so.Name -Force -EA Stop
        Write-Host "  [deleted] Startup: $($so.Name)" -ForegroundColor Green
        $deleted++
    } catch {
        Write-Host "  [skip] $($so.Name): $_" -ForegroundColor DarkYellow
    }
}

Write-Host "`n=== 완료: $deleted 개 레지스트리 키 정리됨 ===" -ForegroundColor Cyan
