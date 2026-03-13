import { createInterface } from 'readline';
import { riskLevel as formatRisk } from '../ui.js';

/**
 * Prompt user for confirmation before a destructive action.
 * @param {string} message - What will happen
 * @param {'safe'|'low'|'high'|'critical'} risk
 * @returns {Promise<boolean>}
 */
export async function confirmAction(message, risk = 'low') {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const riskLabel = formatRisk(risk);

  return new Promise((resolve) => {
    if (risk === 'critical') {
      process.stdout.write(`\n  ${riskLabel} ${message}\n`);
      process.stdout.write('  Type YES to confirm (anything else cancels): ');
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim() === 'YES');
      });
    } else {
      process.stdout.write(`\n  ${riskLabel} ${message}\n`);
      const defaultLabel = risk === 'safe' ? '[Y/n]' : '[y/N]';
      process.stdout.write(`  Continue? ${defaultLabel} `);
      rl.question('', (answer) => {
        rl.close();
        const a = answer.trim().toLowerCase();
        if (risk === 'safe') {
          resolve(a !== 'n' && a !== 'no');
        } else {
          resolve(a === 'y' || a === 'yes');
        }
      });
    }
  });
}

/**
 * Show a dry-run preview of actions without executing them.
 * @param {Array<{action: string, target: string, risk: string}>} actions
 */
export function dryRun(actions) {
  process.stdout.write('\n  --- DRY RUN (no changes will be made) ---\n\n');
  for (const action of actions) {
    const riskLabel = formatRisk(action.risk || 'safe');
    process.stdout.write(`  ${riskLabel} ${action.action}: ${action.target}\n`);
  }
  process.stdout.write('\n  --- END DRY RUN ---\n\n');
  return actions;
}

/**
 * Check if an app ID is in the essential list.
 * @param {string} appId
 * @param {string[]} essentialList
 * @returns {boolean}
 */
export function isEssential(appId, essentialList) {
  return essentialList.some(e =>
    appId.toLowerCase().includes(e.toLowerCase())
  );
}
