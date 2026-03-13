import { runPS, parseJSON } from '../utils/powershell.js';

/**
 * Scan for orphaned registry entries.
 * This is a safe, read-only scan of common orphan locations.
 * @returns {object} { items: [...], totalCount: number }
 */
export async function scanRegistry() {
  const items = [];

  // 1. Uninstall entries pointing to nonexistent paths
  const uninstallResult = runPS(
    `$items = @()
    $paths = @(
      'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
      'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
    )
    foreach ($path in $paths) {
      Get-ItemProperty $path -ErrorAction SilentlyContinue | ForEach-Object {
        $loc = $_.InstallLocation
        if ($loc -and $loc.Length -gt 3 -and !(Test-Path $loc)) {
          $items += [PSCustomObject]@{
            Name = $_.DisplayName
            Key = $_.PSPath -replace 'Microsoft.PowerShell.Core\\\\Registry::',''
            Path = $loc
            Type = 'UninstallOrphan'
          }
        }
      }
    }
    $items | ConvertTo-Json`,
    { timeout: 30000 }
  );

  const uninstallData = parseJSON(uninstallResult.stdout);
  if (uninstallData) {
    const entries = Array.isArray(uninstallData) ? uninstallData : [uninstallData];
    for (const entry of entries) {
      if (!entry.Name) continue;
      items.push({
        name: entry.Name,
        key: entry.Key || '',
        path: entry.Path || '',
        type: 'Orphaned uninstall entry',
        risk: 'low',
        description: `Uninstall entry points to missing folder: ${entry.Path}`,
      });
    }
  }

  // 2. Shared DLLs referencing nonexistent files
  const dllResult = runPS(
    `$items = @()
    $dllPath = 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\SharedDLLs'
    if (Test-Path $dllPath) {
      $props = Get-ItemProperty $dllPath -ErrorAction SilentlyContinue
      $props.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | ForEach-Object {
        if (!(Test-Path $_.Name)) {
          $items += [PSCustomObject]@{
            Name = Split-Path $_.Name -Leaf
            Key = $dllPath
            Path = $_.Name
            Type = 'SharedDLL'
          }
        }
      } | Select-Object -First 50
    }
    $items | Select-Object -First 20 | ConvertTo-Json`,
    { timeout: 20000 }
  );

  const dllData = parseJSON(dllResult.stdout);
  if (dllData) {
    const entries = Array.isArray(dllData) ? dllData : [dllData];
    for (const entry of entries) {
      if (!entry.Name) continue;
      items.push({
        name: entry.Name,
        key: entry.Key || '',
        path: entry.Path || '',
        type: 'Orphaned shared DLL reference',
        risk: 'low',
        description: `Shared DLL reference to missing file: ${entry.Path}`,
      });
    }
  }

  // 3. App Paths pointing to nonexistent executables
  const appPathResult = runPS(
    `$items = @()
    $base = 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths'
    if (Test-Path $base) {
      Get-ChildItem $base -ErrorAction SilentlyContinue | ForEach-Object {
        $default = (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).'(default)'
        if ($default -and $default.Length -gt 3 -and !(Test-Path $default)) {
          $items += [PSCustomObject]@{
            Name = $_.PSChildName
            Key = $_.PSPath -replace 'Microsoft.PowerShell.Core\\\\Registry::',''
            Path = $default
            Type = 'AppPath'
          }
        }
      }
    }
    $items | ConvertTo-Json`,
    { timeout: 20000 }
  );

  const appPathData = parseJSON(appPathResult.stdout);
  if (appPathData) {
    const entries = Array.isArray(appPathData) ? appPathData : [appPathData];
    for (const entry of entries) {
      if (!entry.Name) continue;
      items.push({
        name: entry.Name,
        key: entry.Key || '',
        path: entry.Path || '',
        type: 'Orphaned app path',
        risk: 'low',
        description: `App path points to missing executable: ${entry.Path}`,
      });
    }
  }

  return { items, totalCount: items.length };
}
