import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runPS, parseJSON } from '../utils/powershell.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '..', 'data');

function loadEssentialProcesses() {
  const raw = readFileSync(join(dataDir, 'essential.json'), 'utf8');
  return JSON.parse(raw).processes || [];
}

/**
 * Categorize a process.
 */
function categorize(name, essential) {
  const lower = name.toLowerCase();
  if (essential.some(e => e.toLowerCase() === lower)) return 'system';
  if (['msmpeng', 'nissrv', 'securityhealth', 'smartscreen'].some(s => lower.includes(s))) return 'security';
  if (['code', 'node', 'python', 'java', 'git', 'npm', 'docker', 'wsl'].some(s => lower.includes(s))) return 'development';
  if (['chrome', 'firefox', 'edge', 'opera', 'brave'].some(s => lower.includes(s))) return 'browser';
  if (['teams', 'slack', 'discord', 'zoom', 'skype'].some(s => lower.includes(s))) return 'communication';
  if (['steam', 'epic', 'riot', 'battle.net'].some(s => lower.includes(s))) return 'gaming';
  if (['svchost', 'runtime', 'dllhost', 'backgroundtask'].some(s => lower.includes(s))) return 'background';
  return 'other';
}

/**
 * Scan running processes.
 * @returns {object} { processes: [...], summary: {...} }
 */
export async function scanProcesses() {
  const essential = loadEssentialProcesses();

  const result = runPS(
    'Get-Process | Select-Object Name, Id, CPU, WorkingSet64, Description | Sort-Object WorkingSet64 -Descending | Select-Object -First 15 | ConvertTo-Json',
    { timeout: 15000 }
  );

  const data = parseJSON(result.stdout);
  if (!data) {
    return { processes: [], summary: {}, error: 'Failed to scan processes' };
  }

  const procs = (Array.isArray(data) ? data : [data]).map(p => ({
    name: p.Name || 'Unknown',
    pid: p.Id || 0,
    cpuTime: p.CPU ? p.CPU.toFixed(1) : '0.0',
    memoryMB: p.WorkingSet64 ? (p.WorkingSet64 / 1024 / 1024).toFixed(0) : '0',
    description: p.Description || '',
    category: categorize(p.Name || '', essential),
    isEssential: essential.some(e => e.toLowerCase() === (p.Name || '').toLowerCase()),
  }));

  const categoryMemory = (cat) => procs.filter(p => p.category === cat).reduce((sum, p) => sum + parseInt(p.memoryMB, 10), 0);
  const otherProcs = procs.filter(p => !['system', 'browser', 'development', 'background'].includes(p.category));

  const summary = {
    total: procs.length,
    system: procs.filter(p => p.category === 'system').length,
    systemMemoryMB: categoryMemory('system'),
    browser: procs.filter(p => p.category === 'browser').length,
    browserMemoryMB: categoryMemory('browser'),
    development: procs.filter(p => p.category === 'development').length,
    developmentMemoryMB: categoryMemory('development'),
    background: procs.filter(p => p.category === 'background').length,
    backgroundMemoryMB: categoryMemory('background'),
    other: otherProcs.length,
    otherMemoryMB: otherProcs.reduce((sum, p) => sum + parseInt(p.memoryMB, 10), 0),
    totalMemoryMB: procs.reduce((sum, p) => sum + parseInt(p.memoryMB, 10), 0),
  };

  return { processes: procs, summary };
}
