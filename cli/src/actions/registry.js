import { runPS } from '../utils/powershell.js';
import { isAdmin } from '../utils/powershell.js';
import { confirmAction } from '../utils/safety.js';
import { success, warn, error, info, progress } from '../ui.js';

/**
 * Remove an orphaned registry entry.
 * @param {object} item - { name, key, path, type, risk }
 * @param {boolean} isDryRun
 * @returns {boolean}
 */
export async function removeRegistryEntry(item, isDryRun = false) {
  if (!isAdmin()) {
    warn(`Skipping "${item.name}" — registry cleanup requires admin privileges.`);
    return false;
  }

  const confirmed = await confirmAction(
    `Remove orphaned registry entry for "${item.name}"?\n    Key: ${item.key}`,
    item.risk === 'high' ? 'high' : 'low'
  );

  if (!confirmed) {
    info(`Skipped: ${item.name}`);
    return false;
  }

  if (isDryRun) {
    info(`[DRY RUN] Would remove registry key for: ${item.name}`);
    return false;
  }

  const spinner = progress(`Removing registry entry for ${item.name}...`);
  spinner.start();

  // Create backup first
  const backupPath = `${process.env.TEMP}\\omc_reg_backup_${Date.now()}.reg`;
  const backupResult = runPS(
    `reg export "${item.key}" "${backupPath}" /y 2>$null`,
    { timeout: 10000 }
  );

  if (backupResult.exitCode === 0) {
    info(`Backup saved to: ${backupPath}`);
  }

  // Remove the key
  const result = runPS(
    `Remove-Item -Path 'Registry::${item.key}' -Recurse -Force -ErrorAction SilentlyContinue`,
    { timeout: 15000 }
  );

  spinner.stop();

  if (result.exitCode === 0) {
    success(`Removed: ${item.name}`);
    return true;
  } else {
    error(`Failed to remove ${item.name}: ${result.stderr}`);
    return false;
  }
}

/**
 * Clean multiple orphaned registry entries.
 * @param {object[]} items
 * @param {boolean} isDryRun
 * @returns {object} { cleaned: number, failed: number }
 */
export async function cleanRegistry(items, isDryRun = false) {
  if (!isAdmin()) {
    warn('Registry cleanup requires administrator privileges.');
    warn('Please restart as administrator to use this feature.');
    return { cleaned: 0, failed: 0 };
  }

  let cleaned = 0;
  let failed = 0;

  for (const item of items) {
    const result = await removeRegistryEntry(item, isDryRun);
    if (result) cleaned++;
    else failed++;
  }

  return { cleaned, failed };
}
