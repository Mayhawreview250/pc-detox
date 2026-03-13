import { banner, menu, heading, table, info, success, warn, error, progress, formatBytes, newline, pressAnyKey, prompt, riskLevel } from './ui.js';
import { t } from './i18n.js';
import { getSystemSummary, scanSystem } from './scanner/system.js';
import { scanBloatware } from './scanner/bloatware.js';
import { scanTemp } from './scanner/temp.js';
import { scanStartup } from './scanner/startup.js';
import { scanProcesses } from './scanner/processes.js';
import { scanScheduled } from './scanner/scheduled.js';
import { scanRegistry } from './scanner/registry.js';
import { scanDisk } from './scanner/disk.js';
import { executeCleanup, quickCleanup } from './actions/cleanup.js';
import { removeApp, disableStartup as disableStartupAction, disableScheduledTask } from './actions/remove.js';
import { cleanRegistry } from './actions/registry.js';
import { isAdmin } from './utils/powershell.js';
import { runPS } from './utils/powershell.js';

/**
 * Parse CLI flags.
 */
export function parseFlags() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    noColor: args.includes('--no-color'),
    lang: args.find(a => a.startsWith('--lang='))?.split('=')[1] || null,
    help: args.includes('--help') || args.includes('-h'),
  };
}

/**
 * Show the main menu choices.
 */
function getMenuChoices() {
  return [
    { key: '1', icon: '\u{1F9F9}', label: t('menuDetoxScan'), desc: t('menuDetoxScanDesc') },
    { key: '2', icon: '\u{1F680}', label: t('menuStartup'), desc: t('menuStartupDesc') },
    { key: '3', icon: '\u2699\uFE0F', label: t('menuProcesses'), desc: t('menuProcessesDesc') },
    { key: '4', icon: '\u26A1', label: t('menuOneClick'), desc: t('menuOneClickDesc') },
    { key: '0', icon: '\u274C', label: t('menuExit'), desc: '' },
  ];
}

/**
 * Handle: Full System Scan
 */
async function handleFullScan(isDryRun) {
  heading('Full System Scan');

  // System info
  const sysSpinner = progress(t('scanSystem'));
  sysSpinner.start();
  const sys = await scanSystem();
  sysSpinner.succeed('System information collected');

  table(['Property', 'Value'], [
    ['OS', `${sys.os.name} (Build ${sys.os.build})`],
    ['CPU', `${sys.cpu.name} (${sys.cpu.cores}C/${sys.cpu.threads}T) — ${sys.cpu.usage}% usage`],
    ['RAM', `${sys.ram.usedGB}/${sys.ram.totalGB} GB (${sys.ram.usagePercent}% used)`],
    ['Uptime', sys.uptime],
    ...sys.disks.map(d => [`Disk ${d.drive}`, `${d.usedGB}/${d.totalGB} GB (${d.usagePercent}% used, ${d.freeGB} GB free)`]),
  ]);
  newline();

  // Temp files
  const tempSpinner = progress(t('scanTemp'));
  tempSpinner.start();
  const temp = await scanTemp();
  tempSpinner.succeed(`Temp/cache scan: ${temp.items.length} items, ${formatBytes(temp.totalSize)} reclaimable`);

  // Bloatware
  const bloatSpinner = progress(t('scanBloatware'));
  bloatSpinner.start();
  const bloat = await scanBloatware();
  bloatSpinner.succeed(`Bloatware scan: ${bloat.totalFound} removable apps found`);

  // Startup
  const startupSpinner = progress(t('scanStartup'));
  startupSpinner.start();
  const startup = await scanStartup();
  startupSpinner.succeed(`Startup scan: ${startup.totalCount} startup items`);

  newline();
  heading('Summary');
  info(`Reclaimable space: ${formatBytes(temp.totalSize)}`);
  info(`Removable apps: ${bloat.totalFound}`);
  info(`Startup items: ${startup.totalCount}`);

  if (isAdmin()) {
    success('Running as administrator — all features available');
  } else {
    warn('Not running as admin — some features limited');
  }

  await pressAnyKey();
}

/**
 * Handle: Quick Cleanup
 */
async function handleQuickCleanup(isDryRun) {
  heading('Quick Cleanup');

  if (isDryRun) warn(t('dryRunMode'));

  const spinner = progress(t('scanTemp'));
  spinner.start();
  const temp = await scanTemp();
  spinner.succeed(`Found ${temp.items.length} items (${formatBytes(temp.totalSize)})`);
  newline();

  if (temp.items.length === 0) {
    success(t('noIssuesFound'));
    await pressAnyKey();
    return;
  }

  table(
    ['Item', 'Size', 'Risk'],
    temp.items.map(i => [
      i.name + (i.needsAdmin ? ' [admin]' : ''),
      formatBytes(i.size),
      riskLevel(i.risk),
    ])
  );
  newline();

  info(`Total reclaimable: ${formatBytes(temp.totalSize)}`);
  newline();

  const choice = await prompt('Clean (a)ll safe items, (s)elect individually, or (c)ancel?');

  if (choice.toLowerCase() === 'a') {
    const result = await quickCleanup(temp.items, isDryRun);
    newline();
    success(`Cleaned ${result.itemsCleaned} items, freed ${formatBytes(result.totalFreed)}`);
  } else if (choice.toLowerCase() === 's') {
    const result = await executeCleanup(temp.items, isDryRun);
    newline();
    success(`Cleaned ${result.itemsCleaned} items, freed ${formatBytes(result.totalFreed)}`);
  } else {
    info(t('cancelled'));
  }

  await pressAnyKey();
}

/**
 * Handle: Bloatware Detector
 */
async function handleBloatware(isDryRun) {
  heading('Bloatware Detector');

  if (isDryRun) warn(t('dryRunMode'));

  const spinner = progress(t('scanBloatware'));
  spinner.start();
  const result = await scanBloatware();
  spinner.succeed(`Found ${result.totalFound} removable apps`);
  newline();

  if (result.totalFound === 0) {
    success(t('noIssuesFound'));
    await pressAnyKey();
    return;
  }

  for (const cat of result.categories) {
    heading(`${cat.name} (${cat.apps.length} apps)`);
    table(
      ['App', 'Risk', 'Description'],
      cat.apps.map(a => [a.displayName, riskLevel(a.risk), a.description])
    );
    newline();
  }

  const choice = await prompt('Enter app number to remove, (a)ll safe apps, or (c)ancel:');

  if (choice.toLowerCase() === 'a') {
    const safeApps = result.categories.flatMap(c => c.apps.filter(a => a.risk === 'safe'));
    let removed = 0;
    for (const app of safeApps) {
      if (await removeApp(app, isDryRun)) removed++;
    }
    success(`Removed ${removed} of ${safeApps.length} apps`);
  } else if (choice.toLowerCase() !== 'c') {
    info(t('cancelled'));
  }

  await pressAnyKey();
}

/**
 * Handle: Startup Manager
 */
async function handleStartup(isDryRun) {
  heading('Startup Manager');

  if (isDryRun) warn(t('dryRunMode'));

  const spinner = progress(t('scanStartup'));
  spinner.start();
  const result = await scanStartup();
  spinner.succeed(`Found ${result.totalCount} startup items`);
  newline();

  if (result.totalCount === 0) {
    success('No startup items found.');
    await pressAnyKey();
    return;
  }

  table(
    ['#', 'Name', 'Source', 'User'],
    result.items.map((item, i) => [
      String(i + 1),
      item.name,
      item.source,
      item.user,
    ])
  );
  newline();

  const choice = await prompt('Enter number to disable, or (c)ancel:');
  const idx = parseInt(choice, 10) - 1;

  if (idx >= 0 && idx < result.items.length) {
    await disableStartupAction(result.items[idx], isDryRun);
  } else if (choice.toLowerCase() !== 'c') {
    warn(t('invalidChoice'));
  }

  await pressAnyKey();
}

/**
 * Handle: Disk Space Analyzer
 */
async function handleDisk() {
  heading('Disk Space Analyzer');

  const spinner = progress(t('scanDisk'));
  spinner.start();
  const result = await scanDisk();
  spinner.succeed('Disk analysis complete');
  newline();

  if (result.largeFolders.length > 0) {
    heading('Largest Folders in User Directory');
    table(
      ['Folder', 'Size'],
      result.largeFolders.map(f => [f.name, formatBytes(f.size)])
    );
    newline();
  }

  if (result.devCaches.length > 0) {
    heading('Development Caches (safe to remove)');
    table(
      ['Path', 'Size', 'Risk'],
      result.devCaches.map(f => [
        f.path.replace(process.env.USERPROFILE, '~'),
        formatBytes(f.size),
        riskLevel(f.risk),
      ])
    );
    newline();
    info(`Total dev cache: ${formatBytes(result.totalWaste)}`);
  }

  if (result.devCaches.length === 0 && result.largeFolders.length === 0) {
    success(t('noIssuesFound'));
  }

  await pressAnyKey();
}

/**
 * Handle: Process Monitor
 */
async function handleProcesses() {
  heading('Process Monitor');

  const spinner = progress(t('scanProcesses'));
  spinner.start();
  const result = await scanProcesses();
  spinner.succeed(`Top ${result.processes.length} processes by memory usage`);
  newline();

  if (result.summary) {
    const s = result.summary;
    const toGB = (mb) => (mb / 1024).toFixed(1);
    heading('Category Summary');
    table(
      ['Category', 'Processes', 'Memory'],
      [
        ['Browser',     String(s.browser),     `${toGB(s.browserMemoryMB)} GB`],
        ['Development', String(s.development),  `${toGB(s.developmentMemoryMB)} GB`],
        ['System',      String(s.system),       `${toGB(s.systemMemoryMB)} GB`],
        ['Background',  String(s.background),   `${toGB(s.backgroundMemoryMB)} GB`],
        ['Other',       String(s.other),        `${toGB(s.otherMemoryMB)} GB`],
      ]
    );
    newline();
    heading('Top 15 by Memory');
  }

  table(
    ['Name', 'PID', 'Memory', 'CPU Time', 'Category'],
    result.processes.slice(0, 15).map(p => [
      p.name + (p.isEssential ? ' *' : ''),
      String(p.pid),
      `${p.memoryMB} MB`,
      `${p.cpuTime}s`,
      p.category,
    ])
  );
  newline();
  info('* = system essential process (do not terminate)');

  await pressAnyKey();
}

/**
 * Handle: Scheduled Tasks
 */
async function handleScheduled(isDryRun) {
  heading('Scheduled Tasks');

  if (isDryRun) warn(t('dryRunMode'));

  const spinner = progress(t('scanScheduled'));
  spinner.start();
  const result = await scanScheduled();
  spinner.succeed(`Found ${result.userCount} non-system tasks (${result.totalCount} total)`);
  newline();

  if (result.tasks.length === 0) {
    success('No user-configurable scheduled tasks found.');
    await pressAnyKey();
    return;
  }

  table(
    ['#', 'Task', 'State', 'Category'],
    result.tasks.map((task, i) => [
      String(i + 1),
      task.name,
      task.state,
      task.category,
    ])
  );
  newline();

  const choice = await prompt('Enter number to disable, or (c)ancel:');
  const idx = parseInt(choice, 10) - 1;

  if (idx >= 0 && idx < result.tasks.length) {
    if (!result.tasks[idx].canDisable) {
      warn('This is a system task and should not be disabled.');
    } else {
      await disableScheduledTask(result.tasks[idx], isDryRun);
    }
  } else if (choice.toLowerCase() !== 'c') {
    warn(t('invalidChoice'));
  }

  await pressAnyKey();
}

/**
 * Handle: Registry Cleanup
 */
async function handleRegistry(isDryRun) {
  heading('Registry Cleanup');

  if (isDryRun) warn(t('dryRunMode'));

  const spinner = progress(t('scanRegistry'));
  spinner.start();
  const result = await scanRegistry();
  spinner.succeed(`Found ${result.totalCount} orphaned entries`);
  newline();

  if (result.totalCount === 0) {
    success(t('noIssuesFound'));
    await pressAnyKey();
    return;
  }

  table(
    ['Name', 'Type', 'Risk'],
    result.items.map(i => [i.name, i.type, riskLevel(i.risk)])
  );
  newline();

  const choice = await prompt('Clean (a)ll entries, or (c)ancel:');

  if (choice.toLowerCase() === 'a') {
    const cleanResult = await cleanRegistry(result.items, isDryRun);
    success(`Cleaned ${cleanResult.cleaned} entries`);
  } else {
    info(t('cancelled'));
  }

  await pressAnyKey();
}

/**
 * Handle: Security Check
 */
async function handleOneClickCleanup(isDryRun) {
  heading('\u26A1 One-Click Cleanup');

  if (isDryRun) warn(t('dryRunMode'));

  const tempSpinner = progress('Scanning junk files...');
  tempSpinner.start();
  const temp = await scanTemp();
  tempSpinner.succeed(`Junk files: ${temp.items.length} items (${formatBytes(temp.totalSize)})`);

  const regSpinner = progress('Scanning registry...');
  regSpinner.start();
  const reg = await scanRegistry();
  regSpinner.succeed(`Registry: ${reg.totalCount} orphaned entries`);

  newline();

  const totalItems = temp.items.length + reg.totalCount;

  heading('Summary');
  info(`Total items to clean: ${totalItems}`);
  info(`Estimated space to free: ${formatBytes(temp.totalSize)}`);
  newline();

  if (totalItems === 0) {
    success('Your PC is already clean! Nothing to do.');
    await pressAnyKey();
    return;
  }

  if (temp.items.length > 0) {
    table(['Junk Files', 'Size', 'Risk'], temp.items.map(i => [
      i.name, formatBytes(i.size), riskLevel(i.risk)
    ]));
    newline();
  }

  const choice = await prompt('Clean all safe items? (y)es / (n)o:');

  if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
    if (temp.items.length > 0) {
      const result = await quickCleanup(temp.items.filter(i => i.risk === 'safe'), isDryRun);
      success(`Junk: cleaned ${result.itemsCleaned} items, freed ${formatBytes(result.totalFreed)}`);
    }
    if (reg.totalCount > 0) {
      const regResult = await cleanRegistry(reg.items, isDryRun);
      success(`Registry: cleaned ${regResult.cleaned} entries`);
    }
    newline();
    success('\u2728 One-Click Cleanup complete! Your PC feels lighter.');
  } else {
    info(t('cancelled'));
  }

  await pressAnyKey();
}

async function handleSecurity() {
  heading('Security Check');

  const spinner = progress(t('scanSecurity'));
  spinner.start();

  // Defender status
  const defenderResult = runPS(
    'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated, QuickScanEndTime | ConvertTo-Json',
    { timeout: 15000 }
  );

  spinner.succeed('Security scan complete');
  newline();

  const defender = defenderResult.stdout ? JSON.parse(defenderResult.stdout.trim()) : null;

  if (defender) {
    table(['Setting', 'Status'], [
      ['Antivirus Enabled', defender.AntivirusEnabled ? '\u2705 Yes' : '\u274C No'],
      ['Real-Time Protection', defender.RealTimeProtectionEnabled ? '\u2705 Yes' : '\u274C No'],
      ['Signatures Updated', defender.AntivirusSignatureLastUpdated ? new Date(defender.AntivirusSignatureLastUpdated).toLocaleDateString() : 'Unknown'],
      ['Last Quick Scan', defender.QuickScanEndTime ? new Date(defender.QuickScanEndTime).toLocaleDateString() : 'Never'],
    ]);

    if (!defender.AntivirusEnabled) {
      error('Windows Defender is DISABLED! Enable it immediately.');
    } else if (!defender.RealTimeProtectionEnabled) {
      warn('Real-time protection is off. Consider enabling it.');
    } else {
      success('Windows Defender is active and protecting your PC.');
    }
  } else {
    warn('Could not read Windows Defender status.');
  }

  // Firewall status
  newline();
  const fwResult = runPS(
    "Get-NetFirewallProfile | Select-Object Name, Enabled | ConvertTo-Json"
  );
  const fwData = fwResult.stdout ? JSON.parse(fwResult.stdout.trim()) : null;

  if (fwData) {
    const profiles = Array.isArray(fwData) ? fwData : [fwData];
    heading('Firewall Status');
    table(['Profile', 'Enabled'], profiles.map(p => [
      p.Name,
      p.Enabled ? '\u2705 Yes' : '\u274C No',
    ]));
  }

  await pressAnyKey();
}

/**
 * Main application loop.
 */
export async function run(flags = {}) {
  // Get system summary for banner
  const sysSummary = await getSystemSummary();

  while (true) {
    console.clear();
    banner(sysSummary);

    if (flags.dryRun) {
      newline();
      warn(t('dryRunMode'));
    }

    newline();
    info(t('greeting'));

    const choice = await menu(getMenuChoices());

    switch (choice) {
      case '1': await handleBloatware(flags.dryRun); break;
      case '2': await handleStartup(flags.dryRun); break;
      case '3': await handleProcesses(); break;
      case '4': await handleOneClickCleanup(flags.dryRun); break;
      case '0':
      case 'q':
      case 'exit':
        newline();
        success(t('exit'));
        newline();
        process.exit(0);
      default:
        warn(t('invalidChoice'));
        await pressAnyKey();
    }
  }
}
