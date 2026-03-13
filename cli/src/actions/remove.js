import { runPS } from '../utils/powershell.js';
import { confirmAction } from '../utils/safety.js';
import { success, warn, error, info, progress } from '../ui.js';

/**
 * Remove an AppX package.
 * @param {object} app - { id, fullName, displayName, risk }
 * @param {boolean} isDryRun
 * @returns {boolean} success
 */
export async function removeApp(app, isDryRun = false) {
  const confirmed = await confirmAction(
    `Remove "${app.displayName}" (${app.id})?`,
    app.risk || 'safe'
  );

  if (!confirmed) {
    info(`Skipped: ${app.displayName}`);
    return false;
  }

  if (isDryRun) {
    info(`[DRY RUN] Would remove: ${app.displayName}`);
    return false;
  }

  const spinner = progress(`Removing ${app.displayName}...`);
  spinner.start();

  const result = runPS(
    `Get-AppxPackage '${app.id}' | Remove-AppxPackage -ErrorAction SilentlyContinue`,
    { timeout: 60000 }
  );

  spinner.stop();

  if (result.exitCode === 0 && !result.stderr) {
    success(`Removed: ${app.displayName}`);
    return true;
  } else {
    error(`Failed to remove ${app.displayName}: ${result.stderr || 'Unknown error'}`);
    return false;
  }
}

/**
 * Remove multiple apps from a category.
 * @param {object[]} apps - Array of apps to remove
 * @param {boolean} isDryRun
 * @returns {object} { removed: number, failed: number }
 */
export async function removeApps(apps, isDryRun = false) {
  let removed = 0;
  let failed = 0;

  for (const app of apps) {
    const result = await removeApp(app, isDryRun);
    if (result) removed++;
    else failed++;
  }

  return { removed, failed };
}

/**
 * Disable a startup program.
 * @param {object} item - { name, command, location, source }
 * @param {boolean} isDryRun
 * @returns {boolean}
 */
export async function disableStartup(item, isDryRun = false) {
  const confirmed = await confirmAction(
    `Disable startup item "${item.name}"?`,
    'low'
  );

  if (!confirmed) {
    info(`Skipped: ${item.name}`);
    return false;
  }

  if (isDryRun) {
    info(`[DRY RUN] Would disable: ${item.name}`);
    return false;
  }

  let result;

  if (item.source === 'Registry') {
    // Remove from registry Run key
    const hive = item.location.includes('HKCU') ? 'HKCU' : 'HKLM';
    result = runPS(
      `Remove-ItemProperty -Path '${hive}:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${item.name}' -ErrorAction SilentlyContinue`
    );
  } else if (item.source === 'StartupFolder') {
    // Delete shortcut from startup folder
    result = runPS(
      `Remove-Item '${item.command}' -Force -ErrorAction SilentlyContinue`
    );
  } else {
    warn(`Cannot disable "${item.name}" — unsupported source: ${item.source}`);
    return false;
  }

  if (result.exitCode === 0) {
    success(`Disabled: ${item.name}`);
    return true;
  } else {
    error(`Failed to disable ${item.name}: ${result.stderr}`);
    return false;
  }
}

/**
 * Disable a scheduled task.
 * @param {object} task - { name, path }
 * @param {boolean} isDryRun
 * @returns {boolean}
 */
export async function disableScheduledTask(task, isDryRun = false) {
  const confirmed = await confirmAction(
    `Disable scheduled task "${task.name}"?`,
    'low'
  );

  if (!confirmed) {
    info(`Skipped: ${task.name}`);
    return false;
  }

  if (isDryRun) {
    info(`[DRY RUN] Would disable: ${task.name}`);
    return false;
  }

  const result = runPS(
    `Disable-ScheduledTask -TaskName '${task.name}' -TaskPath '${task.path}' -ErrorAction SilentlyContinue`,
    { timeout: 15000 }
  );

  if (result.exitCode === 0) {
    success(`Disabled: ${task.name}`);
    return true;
  } else {
    error(`Failed to disable ${task.name}: ${result.stderr}`);
    return false;
  }
}
