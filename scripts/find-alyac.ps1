Write-Host "=== 알약/ESTsoft 잔여 항목 검색 ===" -ForegroundColor Cyan

Write-Host "`n[프로세스]" -ForegroundColor Yellow
$procs = Get-Process | Where-Object { $_.ProcessName -match 'ALYac|ALTools|ESTsoft|ALSvc|ALUpdate|ALNotify|ALZip|AYAgent|AYUpdate|AYServiceNT' }
if ($procs) { $procs | Format-Table ProcessName, Id, Path -AutoSize } else { Write-Host "  없음" }

Write-Host "`n[서비스]" -ForegroundColor Yellow
$svcs = Get-Service | Where-Object { $_.DisplayName -match 'ALYac|ESTsoft|ALTools|ALSvc|ALUpdate|AYAgent|AYService' }
if ($svcs) { $svcs | Format-Table Name, DisplayName, Status -AutoSize } else { Write-Host "  없음" }

Write-Host "`n[예약 작업]" -ForegroundColor Yellow
$tasks = Get-ScheduledTask | Where-Object { $_.TaskName -match 'ALYac|ESTsoft|ALTools|ALUpdate|ALNotify|AYUpdate' }
if ($tasks) { $tasks | Format-Table TaskName, State -AutoSize } else { Write-Host "  없음" }

Write-Host "`n[시작프로그램 레지스트리]" -ForegroundColor Yellow
$runs = @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run','HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run')
foreach ($r in $runs) {
    $props = Get-ItemProperty $r -EA SilentlyContinue
    if ($props) {
        $props.PSObject.Properties | Where-Object { $_.Value -match 'ALYac|ESTsoft|ALTools|AYAgent' } | ForEach-Object {
            Write-Host "  $r\$($_.Name) -> $($_.Value)" -ForegroundColor Red
        }
    }
}

Write-Host "`n[잔여 폴더]" -ForegroundColor Yellow
$folders = @('C:\Program Files\ESTsoft','C:\Program Files (x86)\ESTsoft','C:\ProgramData\ESTsoft','C:\ProgramData\ALYac')
foreach ($f in $folders) {
    if (Test-Path $f) { Write-Host "  존재: $f" -ForegroundColor Red }
}
