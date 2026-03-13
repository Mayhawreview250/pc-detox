# OhMyComputer - 다음 할일

## 프로젝트 비전
**"엄마도 쓸 수 있는 컴퓨터 정리 앱"**
- 전문 용어 없이, 버튼 하나로, 뭘 지워도 되는지 쉽게 알려주는 앱
- 전세계 누구나 컴퓨터가 느려졌을 때 꺼내 쓸 수 있는 직관적인 전광판
- Mac 스타일 모던 UI, 시각적으로 아름답게

## 완료
- [x] 프로젝트 초기 셋업 (Next.js + Tailwind, Mac 스타일 UI)
- [x] 시스템 모니터링 (CPU/메모리/디스크 실시간)
- [x] 프로세스 모니터 (서버/보안/앱 분류, 종료 기능)
- [x] 폴더 탐색기 (경로 탐색, 프로젝트/캐시 자동 분류)
- [x] 클라우드 드라이브 상태 (Google Drive, OneDrive 감지)
- [x] 보안 프로그램 정리 (HGrid, sCourt, NOS, IPinside 서비스 비활성화)
- [x] Explorer 핸들 과부하 진단 및 재시작
- [x] OneDrive → 로컬 전환 (바탕화면/문서 폴더 백업 해제)
- [x] 외장하드(E:) 백업 완료 (바탕화면, 문서, 사진)
- [x] OneDrive 제거
- [x] 불필요 프로그램 대량 정리 (삼성앱 23개, 농협 보안, ALZip/ALYac/ALTools, 기타 보안 프로그램)
- [x] 7-Zip 설치 (ALZip 대체)
- [x] Temp/브라우저캐시/Windows업데이트캐시 정리
- [x] ESTsoft 잔여 폴더 재부팅 시 자동 삭제 예약
- [x] C: 루트 정리 (OneDriveTemp, Temp, tmp, Config.Msi, SCAN, Wallpaper, inetpub, Tenorshare 삭제)
- [x] C: 루트 로그/잔여 파일 정리 (DumpStack, setup.log, bootTel 등)
- [x] Program Files 정리 (AhnLab, ESTsoft, ReasonLabs, Samsung, VOICEVOX, Waves, Wizvera 등 삭제)
- [x] Program Files에서 Eagle, Obsidian, VLC 삭제 (사용자 결정)
- [x] WSL/Ubuntu 제거 (현재 앱에 불필요)
- [x] INZISOFT, common_attachment, Python314 — 확인 보류

## 다음 구현

### 1단계: 원클릭 최적화 패널
- [ ] Explorer 재시작 버튼 (핸들 누적 정리)
- [ ] 불필요한 보안 프로그램 일괄 종료/서비스 비활성화
- [ ] 임시 파일 정리 (Temp, 브라우저 캐시)
- [ ] node_modules / .next / __pycache__ 등 개발 캐시 일괄 삭제
- [ ] 레지스트리 정리 (삭제된 프로그램 잔여 키, 빈 키, 잘못된 경로 감지 및 정리)

### 2단계: 폴더 분석 강화
- [ ] 폴더별 용량 계산 (트리맵 시각화)
- [ ] 프로그램별 폴더 설명 자동 매핑 (어떤 프로그램인지 한눈에)
- [ ] 오래된/미사용 폴더 감지
- [ ] 삭제 전 확인 다이얼로그 강화 (되돌릴 수 없음 경고)
- [ ] Program Files 잔여 폴더 정리 UI

### 3단계: 보안 센터 (바이러스/보안)
- [ ] Windows Defender 상태 한눈에 표시 (켜짐/꺼짐, 최신 업데이트 여부)
- [ ] 원클릭 바이러스 스캔 (빠른 스캔 / 전체 스캔) — Defender 연동
- [ ] 스캔 결과를 쉬운 말로 번역 ("깨끗해요" / "이거 수상해요, 치료할까요?")
- [ ] 의심스러운 프로세스 자동 감지 (알려지지 않은 서명, 높은 리소스)
- [ ] 시작프로그램 관리 UI (활성화/비활성화 토글)
- [ ] 열린 포트 보안 점검
- [ ] 방화벽 상태 확인

### 4단계: 네트워크/클라우드
- [ ] Google Drive 동기화 상태 상세 (용량, 동기화 파일 수)
- [ ] 네트워크 사용량 모니터링
- [ ] 연결된 외부 장치 목록

### 5단계: UX 개선
- [ ] 시스템 트레이 상주 (Electron 전환 고려)
- [ ] 알림 기능 (CPU 90% 초과, 디스크 부족 등)
- [ ] 다크모드
- [ ] 최적화 히스토리 로그

## 재부팅 후 할 일
- [ ] Program Files (x86) 잔여 보안 폴더 16개 삭제 (ESTsoft, HGrid, INCA, iniLINE, IPinside, MarkAny, RaonSecure, SManager, SoftForum, Wizvera, Wedisk, Tenorshare, Unidocs, Inzisoft, Samsung, Application Verifier)
- [ ] 탐색기 왼쪽 Linux 항목 사라졌는지 확인 (안 사라졌으면 레지스트리 제거)
- [ ] C: 루트 INZISOFT, common_attachment, Python314 정리 여부 결정

## 유지 프로그램 (삭제 금지)
- MagicLine4NX (전자세금계산서)
- SignKorea / KeySharp / AnySign4PC / DreamSecurity (공인인증서)
- 키움증권 영웅문4 (HTS)
- Google Drive
- Miniconda / Anaconda (개발)
- FileZilla, foobar2000
- Kakao, Edge, Spotify
- NPKI 폴더 (인증서 저장)

## 주의사항
- Google Drive: 사용자가 유지 원함, 건드리지 말 것
- 공인인증서 관련 프로그램 절대 삭제 금지
- 관리자 권한 필요 작업은 앱 내에서 UAC 프롬프트 연동 필요
- 재부팅 시: Windows 보안 업데이트(KB5079473) + ESTsoft 폴더 삭제 예약됨
