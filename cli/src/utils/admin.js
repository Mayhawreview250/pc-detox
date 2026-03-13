import { isAdmin, runPS } from './powershell.js';
import { warn, error } from '../ui.js';

/**
 * Check admin status and display appropriate message.
 * @returns {boolean}
 */
export function checkAdmin() {
  return isAdmin();
}

/**
 * Display a message when admin is required but not available.
 * @param {string} action - What action needs admin
 */
export function requireAdmin(action) {
  if (!isAdmin()) {
    warn(`"${action}" requires administrator privileges.`);
    warn('Please right-click your terminal and select "Run as administrator".');
    warn('Or run: Start-Process wt -Verb RunAs');
    return false;
  }
  return true;
}

/**
 * Request elevation via UAC prompt.
 * Restarts the current process as admin.
 * @returns {boolean} - false if user declined UAC
 */
export function requestElevation() {
  try {
    const nodeExe = process.execPath.replace(/\\/g, '\\\\');
    const script = process.argv[1].replace(/\\/g, '\\\\');
    const args = process.argv.slice(2).join(' ');

    runPS(
      `Start-Process '${nodeExe}' -ArgumentList '"${script}" ${args}' -Verb RunAs`
    );
    return true;
  } catch {
    error('Failed to request elevation. Please run as administrator manually.');
    return false;
  }
}
