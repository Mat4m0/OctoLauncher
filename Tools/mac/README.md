# OctoLauncher on macOS

The macOS build is the same launcher as a native Electron app. The game client is still the Windows
`WoW.exe`, so the launcher starts it through Wine. What we tried, measured and learned while
porting is in [NOTES.md](NOTES.md).

## What players need

- An Apple Silicon Mac with macOS 26.4 or later.
- [Mach9](https://mach9.app) in `/Applications`. Mach9 is a free, notarized Wine for Apple Silicon. It
  needs no Rosetta, and it draws Direct3D 9 with Metal through mtld3d, the fastest renderer for
  WoW 1.12 on a Mac.
- aria2 for client downloads: `brew install aria2`.

The launcher looks for Wine in this order: `OCTO_WINE_WRAPPER`, Mach9, then Wine Staging/Stable/Devel
in `/Applications` (Gcenx builds, which run through Rosetta 2), then Homebrew's `wine`.

## How the game is started

- Prefix: `~/Library/Application Support/octo-launcher/wine-prefix` (or `WINEPREFIX`). The first start
  builds it, which takes about a minute.
- `WINEDLLOVERRIDES=d3d9=b`: Wine's own d3d9 (mtld3d in Mach9) instead of the Windows dxvk
  `d3d9.dll` in the game folder. A `d3d9` rule you set yourself wins.
- `WINEDEBUG=-all` unless you set it.
- Retina mode: each Play makes sure `RetinaMode=y` is set under `HKCU\Software\Wine\Mac Driver`, so
  WoW draws at the panel's pixels instead of being stretched by macOS (blurry text otherwise). A
  `RetinaMode` value already in the prefix (also `n`) is left alone.
- A new install (empty `Config.wtf`) starts WoW in a maximized window at the screen's full pixel size
  (for example 4608x2592 on a 4K screen scaled to "looks like 2304x1296") with 4x anti-aliasing.
- `MTLD3D_CONFIG=cursor.software=true` (appended to yours unless it names `cursor.software`):
  mtld3d draws the cursor in an overlay window, because each hide/show of the hardware cursor
  (WoW hides it while a mouse button turns the camera) delays the next frame by one refresh.
- VanillaFixes reads `dlls.txt.cache` with Windows paths; the launcher writes it with the prefix's
  `Z:` drive paths.
- The game is detected as running by its `WoW.exe` command line in `ps`.

## Mods

- Hidden on macOS and kept out of `dlls.txt` (their files stay): **DXVK** (needs Vulkan; mtld3d
  replaces it) and **VanillaMultiMonitorFix** (WoW quits at startup with it under Wine).
- Tested under Mach9: VanillaFixes, nampower, UnitXP_SP3, VanillaHelpers, transmogfix and SuperWoW,
  each alone and all together.
- A DLL you add to `dlls.txt` yourself stays there. If WoW quits right after start, turn mods off one
  at a time to find the one that breaks.

## The app window

- Native macOS window buttons (traffic lights); the drawn Windows buttons are hidden.
- On Play the launcher window hides, the Dock icon stays; click the Dock icon to bring it back.
  There is no menu-bar icon.
- Launcher self-updates are published for Windows only. Rebuild the app for a new version.

## Performance notes (M1 Pro, 4K screen, measured 2026-11-25)

| Setup | Result |
|---|---|
| No Retina mode, 2228x1234 window, MSAA 4 | 53 FPS, GPU 3.4 ms, clusters of 33 ms frames |
| + software cursor, `farClip 777` | fewer spikes on right-click camera turns |
| Retina mode, maximized 4608x2592, MSAA 4 | 60 FPS (vsync cap), GPU 7.5 ms, flat frame graph, sharp text |

The GPU has room to spare; stutter comes from the CPU side (x86 code translated by FEX, asset
loading). Lower `farClip` and fewer addons help most. macOS Game Mode turns on only in macOS
fullscreen (green button).

## Troubleshooting

| Problem | Fix |
|---|---|
| Blurry or pixelated text | Check that `RetinaMode` is `y`: `WINEPREFIX=~/Library/Application\ Support/octo-launcher/wine-prefix /Applications/Mach9.app/Contents/Resources/wine/bin/wine reg query 'HKCU\Software\Wine\Mac Driver'`. In `WTF/Config.wtf`: `gxMaximize "1"` and a resolution at full pixels. |
| Hitch when you hold a mouse button | `cursor.software = true` in `mtld3d.conf` next to `WoW.exe` (the launcher sets it through `MTLD3D_CONFIG`). |
| Too slow at full pixels | Lower `gxMultisample` to 2, or set `render.scale` in `mtld3d.conf` (MetalFX upscaling). |
| "Mach9 is needed" | Mach9 is not in `/Applications`, or was renamed. |

Useful variables when you start the launcher from a terminal:

| Variable | Use |
|---|---|
| `MTL_HUD_ENABLED=1` | Apple's Metal overlay with frame rate, GPU time and a frame-time graph |
| `WINE_COMPATDB='exe=WoW.exe;d3d9=wined3d'` | Mach9: Wine's OpenGL renderer instead of mtld3d, to compare |
| `MTLD3D_CONFIG='key=value;…'` | mtld3d options (see `mtld3d.conf` next to `WoW.exe`) |

For example:

```sh
MTL_HUD_ENABLED=1 /Applications/OctoLauncher.app/Contents/MacOS/OctoLauncher
```

## Build

```sh
npm install        # stormlib-node is optional and does not build on macOS
npm run dev        # run from source
npm run dist:mac   # unsigned arm64 DMG and ZIP in distprod/
```

Install a local build in `/Applications` (ad-hoc signed; it opens because a local build has no
quarantine flag, but Gatekeeper would block a copy downloaded from the internet):

```sh
npx electron-vite build
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dir --arm64
codesign --force --deep -s - distprod/mac-arm64/OctoLauncher.app
rm -rf /Applications/OctoLauncher.app && ditto distprod/mac-arm64/OctoLauncher.app /Applications/OctoLauncher.app
```

The app keeps its data in `~/Library/Application Support/octo-launcher` (settings, Wine prefix) and
logs in `~/Library/Logs/octo-launcher/main.log`.

`stormlib-node` only serves the removal of old locale patches; without it nothing is removed.
