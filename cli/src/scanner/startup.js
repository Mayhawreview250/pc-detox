import { runPS, parseJSON } from '../utils/powershell.js';

/**
 * Scan startup programs from multiple sources.
 * @returns {object} { items: [...], totalCount: number }
 */
export async function scanStartup() {
  const items = [];

  // Method 1: CIM startup commands
  const cimResult = runPS(
    'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User | ConvertTo-Json'
  );
  const cimData = parseJSON(cimResult.stdout);
  if (cimData) {
    const entries = Array.isArray(cimData) ? cimData : [cimData];
    for (const entry of entries) {
      if (!entry.Name) continue;
      items.push({
        name: entry.Name,
        command: entry.Command || '',
        location: entry.Location || '',
        user: entry.User || 'All Users',
        source: 'WMI',
        canDisable: true,
      });
    }
  }

  // Method 2: Registry Run keys (HKCU)
  const hkcuResult = runPS(
    "Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -ErrorAction SilentlyContinue | Select-Object * -ExcludeProperty PS* | ConvertTo-Json"
  );
  const hkcuData = parseJSON(hkcuResult.stdout);
  if (hkcuData && typeof hkcuData === 'object') {
    for (const [name, command] of Object.entries(hkcuData)) {
      if (name.startsWith('PS') || typeof command !== 'string') continue;
      // Skip if already found via CIM
      if (items.some(i => i.name === name)) continue;
      items.push({
        name,
        command,
        location: 'HKCU\\...\\Run',
        user: 'Current User',
        source: 'Registry',
        canDisable: true,
      });
    }
  }

  // Method 3: Registry Run keys (HKLM)
  const hklmResult = runPS(
    "Get-ItemProperty -Path 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -ErrorAction SilentlyContinue | Select-Object * -ExcludeProperty PS* | ConvertTo-Json"
  );
  const hklmData = parseJSON(hklmResult.stdout);
  if (hklmData && typeof hklmData === 'object') {
    for (const [name, command] of Object.entries(hklmData)) {
      if (name.startsWith('PS') || typeof command !== 'string') continue;
      if (items.some(i => i.name === name)) continue;
      items.push({
        name,
        command,
        location: 'HKLM\\...\\Run',
        user: 'All Users',
        source: 'Registry',
        canDisable: true,
        needsAdmin: true,
      });
    }
  }

  // Method 4: Startup folder items
  const startupResult = runPS(
    `Get-ChildItem "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\Startup" -ErrorAction SilentlyContinue | Select-Object Name, FullName | ConvertTo-Json`
  );
  const startupData = parseJSON(startupResult.stdout);
  if (startupData) {
    const entries = Array.isArray(startupData) ? startupData : [startupData];
    for (const entry of entries) {
      if (!entry.Name) continue;
      items.push({
        name: entry.Name.replace(/\.\w+$/, ''),
        command: entry.FullName || '',
        location: 'Startup Folder',
        user: 'Current User',
        source: 'StartupFolder',
        canDisable: true,
      });
    }
  }

  return { items, totalCount: items.length };
}
