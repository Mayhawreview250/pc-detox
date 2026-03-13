import { runPS } from '../utils/powershell.js';
import { confirmAction } from '../utils/safety.js';
import { isAdmin } from '../utils/powershell.js';
import { success, warn, error, info, progress, formatBytes } from '../ui.js';

/**
 * Clean temp files for a given item.
 * @param {object} item - { name, path, size, risk, type, needsAdmin }
 * @param {boolean} isDryRun
 * @returns {object} { cleaned: boolean, freedBytes: number }
 */
async function cleanItem(item, isDryRun = false) {
  if (item.needsAdmin && !isAdmin()) {
    warn(`Skipping "${item.name}" — requires admin privileges.`);
    return { cleaned: false, freedBytes: 0 };
  }

  if (isDryRun) {
    info(`[DRY RUN] Would clean: ${item.name} (${formatBytes(item.size)})`);
    return { cleaned: false, freedBytes: 0 };
  }

  if (item.type === 'recycle') {
    // Empty recycle bin
    const result = runPS(
      'Clear-RecycleBin -Force -ErrorAction SilentlyContinue',
      { timeout: 30000 }
    );
    if (result.exitCode === 0) {
      success(`Emptied Recycle Bin (${formatBytes(item.size)})`);
      return { cleaned: true, freedBytes: item.size };
    } else {
      error(`Failed to empty Recycle Bin: ${result.stderr}`);
      return { cleaned: false, freedBytes: 0 };
    }
  }

  // DNS cache: flush via ipconfig
  if (item.type === 'dns') {
    const result = runPS('ipconfig /flushdns', { timeout: 10000 });
    if (result.exitCode === 0) {
      success(`Flushed DNS cache`);
      return { cleaned: true, freedBytes: 0 };
    } else {
      error(`Failed to flush DNS cache: ${result.stderr}`);
      return { cleaned: false, freedBytes: 0 };
    }
  }

  // Browser cookies: single file, not a folder
  if (item.type === 'browser-cookies') {
    const result = runPS(
      `Remove-Item '${item.path}' -Force -ErrorAction SilentlyContinue`,
      { timeout: 15000 }
    );
    if (result.exitCode === 0 || !result.stderr) {
      success(`Cleaned ${item.name} (${formatBytes(item.size)})`);
      return { cleaned: true, freedBytes: item.size };
    } else {
      warn(`Could not delete ${item.name} — browser may be open.`);
      return { cleaned: false, freedBytes: 0 };
    }
  }

  // For folders: delete contents, not the folder itself
  const result = runPS(
    `Remove-Item '${item.path}\\*' -Recurse -Force -ErrorAction SilentlyContinue`,
    { timeout: 60000 }
  );

  if (result.exitCode === 0 || !result.stderr) {
    success(`Cleaned ${item.name} (${formatBytes(item.size)})`);
    return { cleaned: true, freedBytes: item.size };
  } else {
    // Partial success is common (locked files)
    warn(`Partially cleaned ${item.name} — some files were in use.`);
    return { cleaned: true, freedBytes: Math.floor(item.size * 0.7) };
  }
}

/**
 * Execute cleanup for selected temp/cache items.
 * @param {object[]} items - Items from scanTemp()
 * @param {boolean} isDryRun
 * @returns {object} { totalFreed: number, itemsCleaned: number }
 */
export async function executeCleanup(items, isDryRun = false) {
  let totalFreed = 0;
  let itemsCleaned = 0;

  for (const item of items) {
    const confirmed = await confirmAction(
      `Clean ${item.name}? (${formatBytes(item.size)})`,
      item.risk || 'safe'
    );

    if (!confirmed) {
      info(`Skipped: ${item.name}`);
      continue;
    }

    const spinner = progress(`Cleaning ${item.name}...`);
    spinner.start();

    const result = await cleanItem(item, isDryRun);

    spinner.stop();

    if (result.cleaned) {
      totalFreed += result.freedBytes;
      itemsCleaned++;
    }
  }

  return { totalFreed, itemsCleaned };
}

/**
 * Quick cleanup: clean all safe items without individual prompts.
 * Still asks for one confirmation at the beginning.
 * @param {object[]} items
 * @param {boolean} isDryRun
 */
export async function quickCleanup(items, isDryRun = false) {
  const safeItems = items.filter(i => i.risk === 'safe' && !i.needsAdmin);
  const totalSize = safeItems.reduce((sum, i) => sum + i.size, 0);

  if (safeItems.length === 0) {
    info('No safe items to clean.');
    return { totalFreed: 0, itemsCleaned: 0 };
  }

  info(`Found ${safeItems.length} safe items (${formatBytes(totalSize)})`);

  const confirmed = await confirmAction(
    `Clean all ${safeItems.length} safe items? (${formatBytes(totalSize)})`,
    'safe'
  );

  if (!confirmed) {
    info('Cleanup cancelled.');
    return { totalFreed: 0, itemsCleaned: 0 };
  }

  let totalFreed = 0;
  let itemsCleaned = 0;

  const spinner = progress('Cleaning safe items...');
  spinner.start();

  for (const item of safeItems) {
    const result = await cleanItem(item, isDryRun);
    if (result.cleaned) {
      totalFreed += result.freedBytes;
      itemsCleaned++;
    }
  }

  spinner.stop();

  return { totalFreed, itemsCleaned };
}
