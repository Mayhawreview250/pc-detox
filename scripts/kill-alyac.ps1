# 알약/ESTsoft 완전 제거
Write-Host "=== 알약 완전 제거 ===" -ForegroundColor Cyan

# 1. 서비스 중지 및 삭제
Write-Host "`n[1] 서비스 중지..." -ForegroundColor Yellow
$services = @('ALUpdateService','ALYac_RTSrv','ALYac_UpdSrv','ALYac_WSSrv')
foreach ($svc in $services) {
    Stop-Service $svc -Force -EA SilentlyContinue
    sc.exe delete $svc 2>$null
    Write-Host "  $svc 제거됨" -ForegroundColor Green
}

# 2. 프로세스 종료
Write-Host "`n[2] 프로세스 종료..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -match 'ALYac|ALNotify|AYAgent|AYUpdate|ALUpdate|AYLaunch' } | Stop-Process -Force -EA SilentlyContinue
Write-Host "  프로세스 종료됨" -ForegroundColor Green

# 3. 시작프로그램 제거
Write-Host "`n[3] 시작프로그램 제거..." -ForegroundColor Yellow
Remove-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run' -Name 'ALYac' -Force -EA SilentlyContinue
Remove-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run' -Name 'ALNotify' -Force -EA SilentlyContinue
Write-Host "  시작프로그램 항목 제거됨" -ForegroundColor Green

# 4. 폴더 삭제
Write-Host "`n[4] 잔여 폴더 삭제..." -ForegroundColor Yellow
$folders = @('C:\Program Files\ESTsoft','C:\Program Files (x86)\ESTsoft','C:\ProgramData\ESTsoft','C:\ProgramData\ALYac')
foreach ($f in $folders) {
    if (Test-Path $f) {
        Remove-Item $f -Recurse -Force -EA SilentlyContinue
        if (Test-Path $f) {
            Write-Host "  잠김 (재부팅 후 삭제): $f" -ForegroundColor DarkYellow
        } else {
            Write-Host "  삭제됨: $f" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== 완료 ===" -ForegroundColor Cyan
