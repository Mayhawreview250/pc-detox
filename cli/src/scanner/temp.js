import { runPS, parseJSON } from '../utils/powershell.js';

/**
 * Get folder size via PowerShell.
 * @param {string} path
 * @returns {number} Size in bytes
 */
function getFolderSize(path) {
  const result = runPS(
    `if (Test-Path '${path}') { (Get-ChildItem '${path}' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum } else { 0 }`,
    { timeout: 30000 }
  );
  const size = parseInt(result.stdout.trim(), 10);
  return isNaN(size) ? 0 : size;
}

/**
 * Scan for temporary and cache files.
 * @returns {object} { items: [...], totalSize: number }
 */
export async function scanTemp() {
  const items = [];

  // User TEMP folder
  const userTemp = process.env.TEMP || `${process.env.USERPROFILE}\\AppData\\Local\\Temp`;
  const userTempSize = getFolderSize(userTemp);
  if (userTempSize > 0) {
    items.push({
      name: 'User Temp Files',
      path: userTemp,
      size: userTempSize,
      risk: 'safe',
      type: 'temp',
    });
  }

  // Windows Temp
  const winTemp = 'C:\\Windows\\Temp';
  const winTempSize = getFolderSize(winTemp);
  if (winTempSize > 0) {
    items.push({
      name: 'Windows Temp Files',
      path: winTemp,
      size: winTempSize,
      risk: 'safe',
      type: 'temp',
      needsAdmin: true,
    });
  }

  // Chrome cache
  const chromeCache = `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Cache`;
  const chromeCacheSize = getFolderSize(chromeCache);
  if (chromeCacheSize > 0) {
    items.push({
      name: 'Chrome Cache',
      path: chromeCache,
      size: chromeCacheSize,
      risk: 'safe',
      type: 'browser',
    });
  }

  // Chrome Code Cache
  const chromeCodeCache = `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Code Cache`;
  const chromeCodeCacheSize = getFolderSize(chromeCodeCache);
  if (chromeCodeCacheSize > 0) {
    items.push({
      name: 'Chrome Code Cache',
      path: chromeCodeCache,
      size: chromeCodeCacheSize,
      risk: 'safe',
      type: 'browser',
    });
  }

  // Edge cache
  const edgeCache = `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data\\Default\\Cache`;
  const edgeCacheSize = getFolderSize(edgeCache);
  if (edgeCacheSize > 0) {
    items.push({
      name: 'Edge Cache',
      path: edgeCache,
      size: edgeCacheSize,
      risk: 'safe',
      type: 'browser',
    });
  }

  // Edge Code Cache
  const edgeCodeCache = `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data\\Default\\Code Cache`;
  const edgeCodeCacheSize = getFolderSize(edgeCodeCache);
  if (edgeCodeCacheSize > 0) {
    items.push({
      name: 'Edge Code Cache',
      path: edgeCodeCache,
      size: edgeCodeCacheSize,
      risk: 'safe',
      type: 'browser',
    });
  }

  // Chrome Cookies (requires confirmation — will log out of all sites)
  const chromeCookies = `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Cookies`;
  const chromeCookieResult = runPS(
    `if (Test-Path '${chromeCookies}') { (Get-Item '${chromeCookies}' -Force -ErrorAction SilentlyContinue).Length } else { 0 }`
  );
  const chromeCookieSize = parseInt(chromeCookieResult.stdout.trim(), 10) || 0;
  if (chromeCookieSize > 0) {
    items.push({
      name: 'Chrome Cookies (will log you out of all sites!)',
      path: chromeCookies,
      size: chromeCookieSize,
      risk: 'high',
      type: 'browser-cookies',
    });
  }

  // Edge Cookies (requires confirmation — will log out of all sites)
  const edgeCookies = `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data\\Default\\Cookies`;
  const edgeCookieResult = runPS(
    `if (Test-Path '${edgeCookies}') { (Get-Item '${edgeCookies}' -Force -ErrorAction SilentlyContinue).Length } else { 0 }`
  );
  const edgeCookieSize = parseInt(edgeCookieResult.stdout.trim(), 10) || 0;
  if (edgeCookieSize > 0) {
    items.push({
      name: 'Edge Cookies (will log you out of all sites!)',
      path: edgeCookies,
      size: edgeCookieSize,
      risk: 'high',
      type: 'browser-cookies',
    });
  }

  // Windows Icon Cache
  const iconCache = `${process.env.LOCALAPPDATA}\\IconCache.db`;
  const iconCacheResult = runPS(
    `if (Test-Path '${iconCache}') { (Get-Item '${iconCache}' -Force -ErrorAction SilentlyContinue).Length } else { 0 }`
  );
  const iconCacheSize = parseInt(iconCacheResult.stdout.trim(), 10) || 0;
  if (iconCacheSize > 0) {
    items.push({
      name: 'Windows Icon Cache',
      path: iconCache,
      size: iconCacheSize,
      risk: 'safe',
      type: 'system',
    });
  }

  // DNS Cache (flush only, no size)
  items.push({
    name: 'DNS Cache',
    path: 'DNS',
    size: 0,
    risk: 'safe',
    type: 'dns',
    description: 'Flush DNS resolver cache (ipconfig /flushdns)',
  });

  // Windows Update cache
  const wuCache = 'C:\\Windows\\SoftwareDistribution\\Download';
  const wuCacheSize = getFolderSize(wuCache);
  if (wuCacheSize > 0) {
    items.push({
      name: 'Windows Update Cache',
      path: wuCache,
      size: wuCacheSize,
      risk: 'low',
      type: 'system',
      needsAdmin: true,
    });
  }

  // Thumbnail cache
  const thumbCache = `${process.env.LOCALAPPDATA}\\Microsoft\\Windows\\Explorer`;
  const thumbResult = runPS(
    `if (Test-Path '${thumbCache}') { (Get-ChildItem '${thumbCache}' -Filter 'thumbcache_*' -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum } else { 0 }`
  );
  const thumbSize = parseInt(thumbResult.stdout.trim(), 10) || 0;
  if (thumbSize > 0) {
    items.push({
      name: 'Thumbnail Cache',
      path: thumbCache,
      size: thumbSize,
      risk: 'safe',
      type: 'system',
    });
  }

  // Recycle Bin size
  const rbResult = runPS(
    '(New-Object -ComObject Shell.Application).NameSpace(0xA).Items() | Measure-Object -Property Size -Sum | Select-Object -ExpandProperty Sum'
  );
  const rbSize = parseInt(rbResult.stdout.trim(), 10) || 0;
  if (rbSize > 0) {
    items.push({
      name: 'Recycle Bin',
      path: 'Recycle Bin',
      size: rbSize,
      risk: 'safe',
      type: 'recycle',
    });
  }

  // Prefetch
  const prefetchSize = getFolderSize('C:\\Windows\\Prefetch');
  if (prefetchSize > 0) {
    items.push({
      name: 'Prefetch Files',
      path: 'C:\\Windows\\Prefetch',
      size: prefetchSize,
      risk: 'low',
      type: 'system',
      needsAdmin: true,
    });
  }

  const totalSize = items.reduce((sum, i) => sum + i.size, 0);

  return { items, totalSize };
}
