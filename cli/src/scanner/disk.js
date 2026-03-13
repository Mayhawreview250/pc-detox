import { runPS, parseJSON } from '../utils/powershell.js';

/**
 * Scan disk for large folders and dev caches.
 * @returns {object} { largeFolders: [...], devCaches: [...], totalWaste: number }
 */
export async function scanDisk() {
  const userProfile = process.env.USERPROFILE;

  // Top 20 largest folders in user directory (1 level deep)
  const largeFolderResult = runPS(
    `Get-ChildItem '${userProfile}' -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object {
      $size = (Get-ChildItem $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
      [PSCustomObject]@{ Name = $_.Name; Path = $_.FullName; Size = [long]$size }
    } | Sort-Object Size -Descending | Select-Object -First 20 | ConvertTo-Json`,
    { timeout: 120000 }
  );

  const largeFolders = [];
  const largeFolderData = parseJSON(largeFolderResult.stdout);
  if (largeFolderData) {
    const entries = Array.isArray(largeFolderData) ? largeFolderData : [largeFolderData];
    for (const entry of entries) {
      if (!entry.Name || !entry.Size || entry.Size < 1024 * 1024) continue; // Skip < 1MB
      largeFolders.push({
        name: entry.Name,
        path: entry.Path,
        size: entry.Size,
      });
    }
  }

  // Dev caches: node_modules, .next, __pycache__, .cache, dist, build
  const devCacheResult = runPS(
    `$targets = @('node_modules', '.next', '__pycache__', '.cache', '.nuxt', '.turbo', 'dist', 'build', '.gradle', '.m2')
    $found = @()
    Get-ChildItem '${userProfile}' -Directory -Recurse -Depth 4 -Force -ErrorAction SilentlyContinue |
      Where-Object { $targets -contains $_.Name } |
      ForEach-Object {
        $size = (Get-ChildItem $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 10MB) {
          $found += [PSCustomObject]@{ Name = $_.Name; Path = $_.FullName; Size = [long]$size }
        }
      }
    $found | Sort-Object Size -Descending | Select-Object -First 30 | ConvertTo-Json`,
    { timeout: 180000 }
  );

  const devCaches = [];
  const devCacheData = parseJSON(devCacheResult.stdout);
  if (devCacheData) {
    const entries = Array.isArray(devCacheData) ? devCacheData : [devCacheData];
    for (const entry of entries) {
      if (!entry.Name || !entry.Size) continue;
      devCaches.push({
        name: entry.Name,
        path: entry.Path,
        size: entry.Size,
        risk: entry.Name === 'node_modules' || entry.Name === '__pycache__' || entry.Name === '.cache'
          ? 'safe' : 'low',
      });
    }
  }

  const totalWaste = devCaches.reduce((sum, d) => sum + d.size, 0);

  return { largeFolders, devCaches, totalWaste };
}
