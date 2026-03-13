import { runPS, parseJSON } from '../utils/powershell.js';

/**
 * Scan system information.
 * @returns {object} System info
 */
export async function scanSystem() {
  const result = {
    os: {},
    cpu: {},
    ram: {},
    disks: [],
    uptime: '',
  };

  // OS info
  const osResult = runPS(
    'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture | ConvertTo-Json'
  );
  const osData = parseJSON(osResult.stdout);
  if (osData) {
    result.os = {
      name: osData.Caption?.trim() || 'Windows',
      version: osData.Version || '',
      build: osData.BuildNumber || '',
      arch: osData.OSArchitecture || '',
    };
  }

  // CPU info
  const cpuResult = runPS(
    'Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, LoadPercentage | ConvertTo-Json'
  );
  const cpuData = parseJSON(cpuResult.stdout);
  if (cpuData) {
    const cpu = Array.isArray(cpuData) ? cpuData[0] : cpuData;
    result.cpu = {
      name: cpu.Name?.trim() || 'Unknown',
      cores: cpu.NumberOfCores || 0,
      threads: cpu.NumberOfLogicalProcessors || 0,
      usage: cpu.LoadPercentage || 0,
    };
  }

  // RAM info
  const ramResult = runPS(
    'Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory | ConvertTo-Json'
  );
  const ramData = parseJSON(ramResult.stdout);
  if (ramData) {
    const totalKB = ramData.TotalVisibleMemorySize || 0;
    const freeKB = ramData.FreePhysicalMemory || 0;
    result.ram = {
      totalGB: (totalKB / 1024 / 1024).toFixed(1),
      freeGB: (freeKB / 1024 / 1024).toFixed(1),
      usedGB: ((totalKB - freeKB) / 1024 / 1024).toFixed(1),
      usagePercent: Math.round(((totalKB - freeKB) / totalKB) * 100),
    };
  }

  // Disk info
  const diskResult = runPS(
    "Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | Select-Object DeviceID, Size, FreeSpace, VolumeName | ConvertTo-Json"
  );
  const diskData = parseJSON(diskResult.stdout);
  if (diskData) {
    const disks = Array.isArray(diskData) ? diskData : [diskData];
    result.disks = disks.map(d => ({
      drive: d.DeviceID || '',
      label: d.VolumeName || '',
      totalGB: (d.Size / 1024 / 1024 / 1024).toFixed(1),
      freeGB: (d.FreeSpace / 1024 / 1024 / 1024).toFixed(1),
      usedGB: ((d.Size - d.FreeSpace) / 1024 / 1024 / 1024).toFixed(1),
      usagePercent: Math.round(((d.Size - d.FreeSpace) / d.Size) * 100),
    }));
  }

  // Uptime
  const uptimeResult = runPS(
    '(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime | Select-Object Days, Hours, Minutes | ConvertTo-Json'
  );
  const uptimeData = parseJSON(uptimeResult.stdout);
  if (uptimeData) {
    result.uptime = `${uptimeData.Days}d ${uptimeData.Hours}h ${uptimeData.Minutes}m`;
  }

  return result;
}

/**
 * Get a short system summary for the banner.
 * @returns {object} { os, cpu, ram, disk }
 */
export async function getSystemSummary() {
  const sys = await scanSystem();
  const mainDisk = sys.disks[0];
  // Shorten OS name: "Microsoft Windows 11 Home" -> "Windows 11 Home (26200)"
  let osShort = (sys.os.name || 'Windows').replace(/^Microsoft\s+/, '');
  if (sys.os.build) osShort += ` (${sys.os.build})`;

  // Shorten CPU: "12th Gen Intel(R) Core(TM) i3-1215U" -> "Intel Core i3-1215U"
  let cpuShort = (sys.cpu.name || 'Unknown CPU')
    .replace(/\(R\)/gi, '')
    .replace(/\(TM\)/gi, '')
    .replace(/\d+th Gen\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    os: osShort,
    cpu: cpuShort,
    ram: `${sys.ram.totalGB}GB`,
    disk: mainDisk ? `${mainDisk.freeGB}GB free` : '',
  };
}
