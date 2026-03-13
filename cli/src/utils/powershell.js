import { execSync, execFileSync, spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

/**
 * Execute a PowerShell command synchronously.
 * @param {string} command - PowerShell command to execute
 * @param {object} options - { timeout, encoding, maxBuffer }
 * @returns {{ stdout: string, stderr: string, exitCode: number }}
 */
export function runPS(command, options = {}) {
  const {
    timeout = 30000,
    maxBuffer = 1024 * 1024 * 10,
  } = options;

  const psArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-Command',
    `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${command}`,
  ];

  try {
    const stdout = execFileSync('powershell.exe', psArgs, {
      timeout,
      maxBuffer,
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return { stdout: stdout || '', stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || '',
      exitCode: err.status || 1,
    };
  }
}

/**
 * Execute a PowerShell command asynchronously.
 * @param {string} command
 * @param {object} options
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
 */
export function runPSAsync(command, options = {}) {
  const { timeout = 60000 } = options;

  return new Promise((resolve) => {
    const psArgs = [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-Command',
      `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${command}`,
    ];

    const child = spawn('powershell.exe', psArgs, {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString('utf8'); });
    child.stderr.on('data', (data) => { stderr += data.toString('utf8'); });

    const timer = setTimeout(() => {
      child.kill();
      resolve({ stdout, stderr: stderr + '\nCommand timed out', exitCode: -1 });
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code || 0 });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: err.message, exitCode: 1 });
    });
  });
}

/**
 * Run a PowerShell command with admin elevation.
 * This will trigger a UAC prompt.
 * @param {string} command
 * @returns {{ stdout: string, stderr: string, exitCode: number }}
 */
export function runPSAdmin(command) {
  // Write command to a temp script, run elevated, capture output to temp file
  const tempScript = `${process.env.TEMP}\\omc_admin_${Date.now()}.ps1`;
  const tempOutput = `${process.env.TEMP}\\omc_admin_out_${Date.now()}.txt`;
  const tempError = `${process.env.TEMP}\\omc_admin_err_${Date.now()}.txt`;

  const scriptContent = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
  ${command} | Out-File -FilePath '${tempOutput}' -Encoding UTF8
} catch {
  $_.Exception.Message | Out-File -FilePath '${tempError}' -Encoding UTF8
  exit 1
}
`;

  try {
    writeFileSync(tempScript, scriptContent, 'utf8');

    execSync(
      `powershell.exe -NoProfile -Command "Start-Process powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \\"${tempScript}\\"' -Verb RunAs -Wait"`,
      { timeout: 120000, windowsHide: true }
    );

    const stdout = existsSync(tempOutput) ? readFileSync(tempOutput, 'utf8') : '';
    const stderr = existsSync(tempError) ? readFileSync(tempError, 'utf8') : '';
    const exitCode = stderr ? 1 : 0;

    // Cleanup
    [tempScript, tempOutput, tempError].forEach(f => {
      try { unlinkSync(f); } catch {}
    });

    return { stdout, stderr, exitCode };
  } catch (err) {
    return { stdout: '', stderr: err.message, exitCode: 1 };
  }
}

/**
 * Check if current process has admin rights.
 * @returns {boolean}
 */
export function isAdmin() {
  try {
    const result = runPS(
      '([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)'
    );
    return result.stdout.trim().toLowerCase() === 'true';
  } catch {
    return false;
  }
}

/**
 * Parse PowerShell object output (ConvertTo-Json) into JS object.
 * @param {string} output
 * @returns {any}
 */
export function parseJSON(output) {
  try {
    return JSON.parse(output.trim());
  } catch {
    return null;
  }
}
