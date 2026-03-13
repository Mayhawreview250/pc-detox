#!/usr/bin/env node

import { platform } from 'os';
import { detectLanguage } from '../src/i18n.js';
import { setColors } from '../src/ui.js';
import { run, parseFlags } from '../src/index.js';

// Windows-only check
if (platform() !== 'win32') {
  const os = platform();
  if (os === 'darwin') {
    console.log('\n  \uD83C\uDF4E Mac support coming soon! Star this repo to get notified.');
  } else {
    console.log('\n  \uD83D\uDC27 Linux support coming soon! Star this repo to get notified.');
  }
  console.log('  GitHub: https://github.com/CRtheHILLS/pc-detox\n');
  process.exit(1);
}

// Node.js version check
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`\n  PC-Detox requires Node.js 18 or higher.\n  Current version: ${process.version}\n`);
  process.exit(1);
}

// Parse flags
const flags = parseFlags();

// Handle --help
if (flags.help) {
  console.log(`
  PC-Detox - Turn your mass PC into a supercomputer

  Usage: npx pc-detox [options]

  Options:
    --dry-run     Preview changes without executing them
    --lang=ko     Set language (en, ko)
    --no-color    Disable colored output
    -h, --help    Show this help message

  Examples:
    npx pc-detox              Interactive menu
    npx pc-detox --dry-run    Safe preview mode
    npx pc-detox --lang=ko    Korean interface
`);
  process.exit(0);
}

// Configure
if (flags.noColor) {
  setColors(false);
}

detectLanguage();

// Handle graceful exit
process.on('SIGINT', () => {
  console.log('\n\n  Goodbye!\n');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error(`\n  Unexpected error: ${err.message}\n`);
  process.exit(1);
});

// Run
run(flags).catch((err) => {
  console.error(`\n  Fatal error: ${err.message}\n`);
  process.exit(1);
});
