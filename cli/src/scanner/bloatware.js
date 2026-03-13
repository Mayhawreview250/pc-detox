import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runPS, parseJSON } from '../utils/powershell.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '..', 'data');

/**
 * Load bloatware database.
 */
function loadBloatwareDB() {
  const raw = readFileSync(join(dataDir, 'bloatware.json'), 'utf8');
  return JSON.parse(raw);
}

/**
 * Load essential apps list.
 */
function loadEssentialApps() {
  const raw = readFileSync(join(dataDir, 'essential.json'), 'utf8');
  return JSON.parse(raw).apps;
}

/**
 * Match an installed app name against a pattern (supports wildcards).
 */
function matchPattern(appName, pattern) {
  const regex = new RegExp(
    '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    'i'
  );
  return regex.test(appName);
}

/**
 * Scan for bloatware apps.
 * @returns {object} { categories: [...], totalFound: number }
 */
export async function scanBloatware() {
  const db = loadBloatwareDB();
  const essential = loadEssentialApps();

  // Get installed UWP/AppX packages
  const result = runPS(
    'Get-AppxPackage | Select-Object Name, PackageFullName, Publisher, IsFramework | ConvertTo-Json',
    { timeout: 60000 }
  );

  const installed = parseJSON(result.stdout);
  if (!installed) {
    return { categories: [], totalFound: 0, error: 'Failed to scan installed apps' };
  }

  const apps = Array.isArray(installed) ? installed : [installed];
  // Filter out framework packages
  const userApps = apps.filter(a => !a.IsFramework);

  const categories = [];
  let totalFound = 0;

  for (const [catKey, catData] of Object.entries(db)) {
    const matches = [];

    for (const bloatApp of catData.apps) {
      const found = userApps.filter(a => matchPattern(a.Name, bloatApp.id));
      for (const f of found) {
        // Skip essential apps
        if (essential.some(e => f.Name.includes(e))) continue;

        matches.push({
          id: f.Name,
          fullName: f.PackageFullName,
          displayName: bloatApp.name,
          risk: bloatApp.risk,
          description: bloatApp.description || '',
          publisher: f.Publisher || '',
        });
      }
    }

    if (matches.length > 0) {
      categories.push({
        key: catKey,
        name: catData.name,
        apps: matches,
      });
      totalFound += matches.length;
    }
  }

  return { categories, totalFound };
}
