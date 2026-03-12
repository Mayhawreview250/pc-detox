# OhMyComputer - 다음 할일

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

## 다음 구현

### 1단계: 원클릭 최적화 패널
- [ ] Explorer 재시작 버튼 (핸들 누적 정리)
- [ ] 불필요한 보안 프로그램 일괄 종료/서비스 비활성화
- [ ] 임시 파일 정리 (Temp, 브라우저 캐시)
- [ ] node_modules / .next / __pycache__ 등 개발 캐시 일괄 삭제

### 2단계: 폴더 분석 강화
- [ ] 폴더별 용량 계산 (트리맵 시각화)
- [ ] 프로그램별 폴더 설명 자동 매핑 (어떤 프로그램인지 한눈에)
- [ ] 오래된/미사용 폴더 감지
- [ ] 삭제 전 확인 다이얼로그 강화 (되돌릴 수 없음 경고)
- [ ] Program Files 잔여 폴더 정리 UI

### 3단계: 바이러스/보안 체크
- [ ] Windows Defender 상태 확인 및 스캔 트리거
- [ ] 의심스러운 프로세스 감지 (알려지지 않은 서명, 높은 리소스)
- [ ] 시작프로그램 관리 UI (활성화/비활성화 토글)
- [ ] 열린 포트 보안 점검

### 4단계: 네트워크/클라우드
- [ ] Google Drive 동기화 상태 상세 (용량, 동기화 파일 수)
- [ ] 네트워크 사용량 모니터링
- [ ] 연결된 외부 장치 목록

### 5단계: UX 개선
- [ ] 시스템 트레이 상주 (Electron 전환 고려)
- [ ] 알림 기능 (CPU 90% 초과, 디스크 부족 등)
- [ ] 다크모드
- [ ] 최적화 히스토리 로그

## 유지 프로그램 (삭제 금지)
- MagicLine4NX (전자세금계산서)
- SignKorea / KeySharp / AnySign4PC / DreamSecurity (공인인증서)
- 키움증권 영웅문4 (HTS)
- Google Drive
- Miniconda / Anaconda (개발)
- Obsidian, Eagle, FileZilla, foobar2000, VLC
- Kakao, Edge, Spotify
- NPKI 폴더 (인증서 저장)

## 확인 필요
- [ ] VOICEVOX — 사용 여부 확인
- [ ] Tenorshare — 사용 여부 확인

## 주의사항
- Google Drive: 사용자가 유지 원함, 건드리지 말 것
- 공인인증서 관련 프로그램 절대 삭제 금지
- 관리자 권한 필요 작업은 앱 내에서 UAC 프롬프트 연동 필요
- 재부팅 시: Windows 보안 업데이트(KB5079473) + ESTsoft 폴더 삭제 예약됨
