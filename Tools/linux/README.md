# OctoLauncher on Linux (AppImage)

The Linux build is the same launcher packaged as an AppImage. The game client is still the Windows
`WoW.exe`, so the launcher starts it through Wine.

## What players need

- 64-bit Linux (x86_64). Built on Debian 11, so Ubuntu 20.04+, Debian 11+, Fedora, Arch and SteamOS work.
- Wine with 32-bit support (WoW 1.12 is a 32-bit program), or Proton (below):
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

## Proton

Settings has a Proton section on Linux. With "Start the game with Proton" on, the game runs through the chosen
Proton build instead of Wine (`proton run`, with `STEAM_COMPAT_CLIENT_INSTALL_PATH` and `STEAM_COMPAT_DATA_PATH`
set). The list shows every Proton the launcher finds:

- Steam's own builds: `steamapps/common/Proton*` under `~/.local/share/Steam`, `~/.steam/steam`, `~/.steam/root`
  or the Flatpak Steam folders;
- builds placed by hand (e.g. GE-Proton) in `compatibilitytools.d/` in the same Steam folders.

Proton runs the game in its own prefix, `proton-prefix/` in the launcher's settings folder (not `~/.wine`); the
first start builds it, which can take a minute. Proton needs `python3`. The Proton choice wins over
`OCTO_WINE_WRAPPER`; with Proton off, the variables below apply as before.

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
- The game starts in its own process scope (`systemd-run --user --scope`, or `setsid` without a user systemd), and
  without the launcher's AppImage and desktop-session variables, so it keeps running when the launcher closes and the
  taskbar shows it as its own window. The launcher also writes a hidden desktop entry,
  `~/.local/share/applications/octolauncher-game.desktop`, that matches the game window (`StartupWMClass=wow.exe`)
  to the icon read from the game's `WoW.exe` (kept as `game-icon.ico` in the launcher's settings folder). Without an
  icon in the exe, no entry is written.
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
