# OctoLauncher Build Guide (macOS)

OctoLauncher runs as a native Electron app on macOS. The WoW 1.12.1 client is
still a 32-bit Windows executable, so the launcher starts it through the free
Wine Staging runtime. Wine is an external prerequisite and is not bundled into
the application.

## Player prerequisites

### 1. Install Rosetta 2 on Apple Silicon

```bash
softwareupdate --install-rosetta --agree-to-license
```

Intel Macs do not need Rosetta.

### 2. Install free Wine Staging

With Homebrew:

```bash
brew install --cask --no-quarantine wine@staging
```

The current Homebrew Wine casks are scheduled to be disabled on September 1,
2026 because their upstream bundles do not pass Gatekeeper. The tested fallback
is to download Wine Staging from the Gcenx release page, move `Wine Staging.app`
to `/Applications`, and approve the trusted download locally. Wine remains an
external runtime so it can be updated independently from OctoLauncher.

Alternatively, download a current Wine Staging build from the
[macOS Wine builds](https://github.com/Gcenx/macOS_Wine_builds/releases) page.

OctoLauncher looks for Homebrew's `wine` command and for Wine Staging, Stable,
or Devel in `/Applications`. A custom build can be selected by setting
`OCTOLAUNCHER_WINE` to its `wine` executable before starting OctoLauncher.

Whisky is not supported. Its upstream project is archived and warns that its
older Wine runtime can have problems with DirectX 9 games such as WoW 1.12.1.

### 3. Install the native downloader

OctoLauncher 1.3.6 uses aria2 for client downloads. The official launcher
bundles a Windows build; the Mac fork uses Homebrew's native build so file paths
and symbolic links follow macOS rules.

```bash
brew install aria2
```

## Run from source

Use Node.js 20 and Xcode Command Line Tools:

```bash
xcode-select --install
npm ci
npm run dev
```

The legacy `stormlib-node` package is optional on macOS. It may print native
build warnings during installation, but a failure in that optional package does
not prevent the launcher from building.

On first run, use the suggested game directory:

```text
~/Games/OctoWoW
```

Confirm that it is an empty directory, download the client, and press **Play**.
OctoLauncher creates a disposable Wine prefix below its macOS application-data
directory. The downloaded game directory remains the source of truth and can be
backed up independently.

## Build the Apple Silicon app

```bash
npm run dist:mac
```

Artifacts are written to `distprod/` as an arm64 DMG and ZIP. Local unsigned
builds can be opened with Finder's **Open** context-menu action. Public releases
should be signed and notarized with an Apple Developer ID.

Launcher self-updates stay disabled until the release server publishes a macOS
update channel. Client, addon, and mod updates continue to work normally.

## macOS compatibility choices

- The launcher's bundled Windows DXVK mod is disabled on macOS. Wine owns the
  Direct3D translation layer, and a second `d3d9.dll` would conflict with it.
- VanillaFixes itself works under Wine, but its optional `dlls.txt` chainloader
  does not. The launcher disables injected DLL mods on macOS while preserving
  their files in the game directory.
- Windows Defender controls are hidden.
- Hardware and display detection use their existing safe macOS fallbacks.
- The current production client manifest uses complete files and requires no
  incremental MPQ mutation. If a future manifest contains incremental MPQ
  entries, the Mac launcher reports that limitation instead of loading the
  Windows-only native addon.

## Gameplay verification order

1. Download and verify the client.
2. Confirm that DXVK and injected DLL mods are shown as unavailable on macOS.
3. Launch through VanillaFixes and enter the world.
4. Confirm that quitting WoW restores the launcher when minimize-to-tray is on.
