const messages = {
  en: {
    greeting: 'What would you like to do?',
    promptChoice: 'Enter your choice:',
    exit: 'Goodbye! Your PC thanks you.',
    invalidChoice: 'Invalid choice. Please try again.',
    scanning: 'Scanning...',
    scanComplete: 'Scan complete!',
    noIssuesFound: 'No issues found. Your system looks great!',
    itemsFound: '{count} items found',
    totalSize: 'Total size: {size}',
    confirmDelete: 'Are you sure you want to delete these items?',
    confirmRemove: 'Are you sure you want to remove this app?',
    deleted: 'Successfully deleted!',
    removed: 'Successfully removed!',
    cancelled: 'Action cancelled.',
    needsAdmin: 'This action requires administrator privileges.',
    dryRunMode: 'DRY RUN mode — no changes will be made.',
    safeMode: '[Safe Mode ON] — Every action requires your confirmation',
    pressEnter: 'Press Enter to continue...',
    notWindows: 'PC-Detox is designed for Windows only. Detected: {os}',

    // Menu items
    menuFullScan: 'Full System Scan',
    menuFullScanDesc: 'Analyze everything at once',
    menuQuickCleanup: 'Quick Cleanup',
    menuQuickCleanupDesc: 'Temp files, cache, trash',
    menuBloatware: 'Bloatware Detector',
    menuBloatwareDesc: 'Find & remove unnecessary apps',
    menuDetoxScan: 'PC Detox Scan',
    menuDetoxScanDesc: 'Find & remove apps you don\'t need',
    menuOneClick: 'One-Click Cleanup',
    menuOneClickDesc: 'Junk, cache, registry — all at once',
    menuStartup: 'Startup Manager',
    menuStartupDesc: 'Speed up boot time',
    menuDisk: 'Disk Space Analyzer',
    menuDiskDesc: "Find what's eating your storage",
    menuProcesses: 'Process Monitor',
    menuProcessesDesc: "See what's running right now",
    menuScheduled: 'Scheduled Tasks',
    menuScheduledDesc: 'Review automated tasks',
    menuRegistry: 'Registry Cleanup',
    menuRegistryDesc: 'Remove leftover registry entries',
    menuSecurity: 'Security Check',
    menuSecurityDesc: 'Windows Defender status & scan',
    menuExit: 'Exit',

    // Scanner
    scanSystem: 'Scanning system information...',
    scanBloatware: 'Scanning installed apps...',
    scanTemp: 'Scanning temporary files...',
    scanStartup: 'Scanning startup programs...',
    scanProcesses: 'Scanning running processes...',
    scanScheduled: 'Scanning scheduled tasks...',
    scanRegistry: 'Scanning registry...',
    scanDisk: 'Analyzing disk usage...',
    scanSecurity: 'Checking security status...',

    // Results
    tempFiles: 'Temporary files',
    browserCache: 'Browser cache',
    windowsUpdate: 'Windows Update cache',
    recycleBin: 'Recycle Bin',
    reclaimable: 'Total reclaimable space',
    startupPrograms: 'Startup programs',
    runningProcesses: 'Running processes',
    scheduledTasks: 'Scheduled tasks',

    // Actions
    cleanSelected: 'Clean selected items',
    removeSelected: 'Remove selected apps',
    disableStartup: 'Disable selected startup items',
    cleanAll: 'Clean all safe items',
  },
  ko: {
    greeting: '무엇을 도와드릴까요?',
    promptChoice: '선택하세요:',
    exit: '안녕히 가세요! PC가 감사해합니다.',
    invalidChoice: '잘못된 선택입니다. 다시 시도해주세요.',
    scanning: '스캔 중...',
    scanComplete: '스캔 완료!',
    noIssuesFound: '문제가 없습니다. 시스템 상태가 좋습니다!',
    itemsFound: '{count}개 항목 발견',
    totalSize: '총 크기: {size}',
    confirmDelete: '이 항목들을 삭제하시겠습니까?',
    confirmRemove: '이 앱을 제거하시겠습니까?',
    deleted: '삭제 완료!',
    removed: '제거 완료!',
    cancelled: '작업이 취소되었습니다.',
    needsAdmin: '이 작업은 관리자 권한이 필요합니다.',
    dryRunMode: '테스트 모드 — 실제 변경은 없습니다.',
    safeMode: '[안전 모드 켜짐] — 모든 작업은 확인 후 실행됩니다',
    pressEnter: '계속하려면 Enter를 누르세요...',
    notWindows: 'PC-Detox는 Windows 전용입니다. 감지된 OS: {os}',

    menuFullScan: '전체 시스템 스캔',
    menuFullScanDesc: '한번에 모든 것을 분석',
    menuQuickCleanup: '빠른 정리',
    menuQuickCleanupDesc: '임시 파일, 캐시, 휴지통',
    menuBloatware: '불필요한 앱 탐지',
    menuBloatwareDesc: '불필요한 앱 찾기 및 제거',
    menuDetoxScan: 'PC 디톡스 스캔',
    menuDetoxScanDesc: '필요 없는 앱 찾아서 제거',
    menuOneClick: '원클릭 정리',
    menuOneClickDesc: '정크, 캐시, 레지스트리 — 한번에',
    menuStartup: '시작 프로그램 관리',
    menuStartupDesc: '부팅 속도 향상',
    menuDisk: '디스크 공간 분석',
    menuDiskDesc: '저장 공간을 차지하는 항목 찾기',
    menuProcesses: '프로세스 모니터',
    menuProcessesDesc: '현재 실행 중인 프로그램',
    menuScheduled: '예약된 작업',
    menuScheduledDesc: '자동 실행 작업 검토',
    menuRegistry: '레지스트리 정리',
    menuRegistryDesc: '남은 레지스트리 항목 제거',
    menuSecurity: '보안 검사',
    menuSecurityDesc: 'Windows Defender 상태 확인',
    menuExit: '종료',

    scanSystem: '시스템 정보 스캔 중...',
    scanBloatware: '설치된 앱 스캔 중...',
    scanTemp: '임시 파일 스캔 중...',
    scanStartup: '시작 프로그램 스캔 중...',
    scanProcesses: '실행 중인 프로세스 스캔 중...',
    scanScheduled: '예약된 작업 스캔 중...',
    scanRegistry: '레지스트리 스캔 중...',
    scanDisk: '디스크 사용량 분석 중...',
    scanSecurity: '보안 상태 확인 중...',

    tempFiles: '임시 파일',
    browserCache: '브라우저 캐시',
    windowsUpdate: 'Windows Update 캐시',
    recycleBin: '휴지통',
    reclaimable: '회수 가능한 총 공간',
    startupPrograms: '시작 프로그램',
    runningProcesses: '실행 중인 프로세스',
    scheduledTasks: '예약된 작업',

    cleanSelected: '선택한 항목 정리',
    removeSelected: '선택한 앱 제거',
    disableStartup: '선택한 시작 항목 비활성화',
    cleanAll: '안전한 항목 모두 정리',
  },
};

let currentLang = 'en';

/**
 * Detect system locale and set language.
 */
export function detectLanguage() {
  const env = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || '';
  if (env.startsWith('ko')) {
    currentLang = 'ko';
  }

  // Check command line arg
  const langArg = process.argv.find(a => a.startsWith('--lang='));
  if (langArg) {
    const lang = langArg.split('=')[1];
    if (messages[lang]) {
      currentLang = lang;
    }
  }
}

/**
 * Get current language.
 */
export function getLang() {
  return currentLang;
}

/**
 * Set language.
 */
export function setLang(lang) {
  if (messages[lang]) {
    currentLang = lang;
  }
}

/**
 * Translate a key with optional interpolation.
 * @param {string} key
 * @param {object} params - { count: 5, size: "1.2 GB" }
 * @returns {string}
 */
export function t(key, params = {}) {
  let msg = messages[currentLang]?.[key] || messages.en[key] || key;
  for (const [k, v] of Object.entries(params)) {
    msg = msg.replace(`{${k}}`, v);
  }
  return msg;
}
