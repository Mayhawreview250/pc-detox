# PC-Detox

```
 ██████╗  ██████╗      ██████╗ ███████╗████████╗ ██████╗ ██╗  ██╗
 ██╔══██╗██╔════╝      ██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗╚██╗██╔╝
 ██████╔╝██║           ██║  ██║█████╗     ██║   ██║   ██║ ╚███╔╝
 ██╔═══╝ ██║           ██║  ██║██╔══╝     ██║   ██║   ██║ ██╔██╗
 ██║     ╚██████╗      ██████╔╝███████╗   ██║   ╚██████╔╝██╔╝ ██╗
 ╚═╝      ╚═════╝      ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
         Detox your PC. No bloat. No ads. Just results.
```

[![Windows Only](https://img.shields.io/badge/platform-Windows-blue?logo=windows)](https://github.com/CRtheHILLS/pc-detox)
[![npm](https://img.shields.io/npm/v/pc-detox)](https://www.npmjs.com/package/pc-detox)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Windows only (for now).** Mac & Linux support is planned — star this repo to get notified.

## Quick Start

```bash
npx pc-detox
```

No install required. Just run it.

## Why PC-Detox?

Most PC cleaners are the problem they claim to solve. CCleaner bundles Avast. BleachBit has a confusing UI. Others are outright malware.

PC-Detox is different:

- **No installer** — runs directly with `npx`, nothing persists unless you want it
- **No ads, no upsells, no telemetry** — it's MIT licensed open source
- **Runs in your terminal** — transparent, auditable, no black-box magic
- **Built for real slowdowns** — bloatware, startup creep, registry junk, Korean banking security software

## Before & After

| | Before | After |
|---|---|---|
| Boot time | 5 min | 30 sec |
| RAM at idle | 4.2 GB | 1.8 GB |
| Startup apps | 23 | 6 |

*(Results vary by system. These are representative examples.)*

## Features

- **Full System Scan** — OS info, CPU, RAM, disk in one view
- **Quick Cleanup** — temp files, cache, reclaimable space
- **Bloatware Detector** — Samsung, Dell, HP, Lenovo crapware + Korean banking security software
- **Startup Manager** — see and disable startup items slowing your boot
- **Disk Analyzer** — find large folders and dev caches (node_modules, etc.)
- **Process Monitor** — top 15 memory hogs with category summary
- **Scheduled Tasks** — review and disable unnecessary scheduled tasks
- **Registry Cleanup** — orphaned registry entries from uninstalled apps
- **Security Check** — Windows Defender and firewall status

## Usage

```bash
npx pc-detox              # Interactive menu
npx pc-detox --dry-run    # Preview changes without executing
npx pc-detox --lang=ko    # Korean interface
npx pc-detox --no-color   # Disable color output
```

## Mac & Linux Coming Soon

This tool currently works on **Windows only**.

- 🍎 **Mac support** — coming soon
- 🐧 **Linux support** — coming soon

Star this repo to get notified when your OS is supported:
**https://github.com/CRtheHILLS/pc-detox**

## Requirements

- Windows 10 or 11
- Node.js 18+
- Some features require running as Administrator

## Contributing

PRs welcome. Open an issue first for large changes.

---

<!-- GitHub Topics: windows, pc-optimization, cli, cleanup, bloatware-removal,
     registry-cleaner, startup-manager, system-monitor, open-source,
     npx, nodejs, powershell, korean, pc-cleaner, performance -->
