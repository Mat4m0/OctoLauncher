# OctoLauncher on Linux (AppImage)

The Linux build is the same launcher packaged as an AppImage. The game client is still the Windows
`WoW.exe`, so the launcher starts it through Wine.

## What players need

- 64-bit Linux (x86_64). Built on Debian 11, so Ubuntu 20.04+, Debian 11+, Fedora, Arch and SteamOS work.
- Wine with 32-bit support (WoW 1.12 is a 32-bit program):
  - Debian/Ubuntu: `sudo dpkg --add-architecture i386 && sudo apt update && sudo apt install wine wine32`
  - Arch: enable the `multilib` repository, then `sudo pacman -S wine`
  - Fedora: `sudo dnf install wine`
- FUSE 2 for AppImages. Ubuntu 22.04+ needs `sudo apt install libfuse2`. Without it, start the AppImage
  with `--appimage-extract-and-run`.

Run it (the website hands it out as `OctoLauncher.AppImage`):

```sh
chmod +x OctoLauncher.AppImage
./OctoLauncher.AppImage
```

## Settings (environment variables, all optional)

| Variable | Default on Linux | Use |
|---|---|---|
| `OCTO_WINE_WRAPPER` | `wine` | Command that runs the game (e.g. `wine-staging`, a Proton `wine` path). `none` = start `WoW.exe` directly, for when the whole launcher already runs inside Wine or Proton. |
| `OCTO_LAUNCH_WRAPPER_ARGS` | (empty) | Extra arguments placed before the game exe. |
| `WINEPREFIX` | Wine's default (`~/.wine`) | Wine prefix for the game. |
| `WINEDLLOVERRIDES` | `d3d9=n,b` when the dxvk mod is on | Set automatically so Wine uses the dxvk `d3d9.dll`; a `d3d9` rule you set yourself wins. |
| `OCTO_GAME_EXE`, `OCTO_LOADER_EXE` | `WoW.exe`, `VanillaFixes.exe` | Different exe names. |

Example: `WINEPREFIX=~/.local/share/octowow ./OctoLauncher.AppImage`

dxvk (Vulkan rendering) needs working Vulkan drivers (Mesa RADV/ANV or the NVIDIA driver). Without
Vulkan, leave dxvk off; Wine then renders through its own Direct3D-to-OpenGL layer.

## Differences from Windows

- No antivirus helper (Windows Defender only).
- No automatic monitor detection for the multi-monitor fix, and no Vulkan check (dxvk stays off on fresh installs).
- The game is detected as running by scanning `/proc` for the Wine `WoW.exe` process.
- Downloads use a bundled static `aria2c` (built by `aria2c/Dockerfile` from pinned aria2 + OpenSSL sources).

## Building

Needs Docker. Builds from committed files only:

```sh
Tools/linux/build-appimage.sh production   # -> dist-linux/production/OctoLauncher-<version>.AppImage + latest-linux.yml
Tools/linux/build-appimage.sh ptr          # -> dist-linux/ptr/OctoLauncher-PTR-<version>.AppImage + latest-linux.yml
```

## Publishing

The AppImage is published next to the Windows build on the launcher update feed: `OctoLauncher-<version>.AppImage`
plus `latest-linux.yml` (Linux launchers read `latest-linux.yml`; Windows launchers keep reading `latest.yml`).
A stable `OctoLauncher.AppImage` link follows `latest-linux.yml` for the website's Linux download.
