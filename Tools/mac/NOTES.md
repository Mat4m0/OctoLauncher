# macOS port: maintainer notes

What we learned while porting OctoLauncher 1.5.0 to macOS and tuning OctoWoW on an M1 Pro
(November 2026). Read this before you change the Mac path, so you do not repeat the experiments.
Player and build instructions are in [README.md](README.md).

## Reference machine and result

- MacBook Pro M1 Pro, 16 GB, macOS 27.0. External LG 27MU67 4K screen, scaled "looks like
  2304x1296" (scale factor 2, panel 3840x2160).
- Client 1.18.1 build 7272 (WoW 1.12.1 build 5875).
- Result: 60 FPS (vsync cap), GPU 7.45 ms per frame, flat frame-time graph, sharp text, at
  4608x2592 maximized with 4x MSAA and `farClip 777`.

Game folder settings of the reference setup:
- `WTF/Config.wtf`: `gxResolution "4608x2592"`, `gxMaximize "1"`, `gxMultisample "4"`, `farClip "777"`.
- `mtld3d.conf` (next to `WoW.exe`): `cursor.software = true`, `color.hdr.enable = false`.
- `dlls.txt`: `SuperWoWhook.dll`, `mods/wow_turbo.dll`, plus the mods turned on in the launcher.
  wow_turbo comes from
  https://github.com/athei/wow-mods/releases/download/v1.13.3/wow_turbo-v1.13.3-sse.zip. It patches
  client code in memory; the ban risk is unknown. The launcher does not manage it but keeps it in
  `dlls.txt` as a custom DLL; delete its line there to remove it.

## The stack and why

| Layer | Choice | Why |
|---|---|---|
| Wine | [Mach9](https://github.com/athei/mach9) 0.4.0: arm64 Wine 11.21 with FEX for x86 code | Native arm64, notarized, no Rosetta (Rosetta ends after macOS 27) |
| Direct3D 9 | mtld3d v0.15.5 (bundled in Mach9), D3D9 on Metal | WoW 1.12 is its main target; selected with `WINEDLLOVERRIDES=d3d9=b`, because the game folder holds a Windows DXVK `d3d9.dll` |
| Chainloader | VanillaFixes (`VanillaFixes.exe WoW.exe`) | Loads the DLL mods from `dlls.txt` |
| CPU hot paths | wow_turbo v1.13.3-sse (optional, not an OctoWoW mod) | Moves x87 math to SSE, which FEX runs much faster; GC worker pool |

Rejected:
- **Rosetta Wine (Gcenx Wine Staging) + wined3d/OpenGL** (the first attempt, fork 1.3.6, August 2026):
  slow, and every DLL mod crashed with "illegal instruction" under Rosetta, so all mods were off.
- **Rosetta Wine + winerosetta + rosettax87 + DXVK/MoltenVK**: rosettax87 is fragile and depends on
  Rosetta. `libSiliconPatch` and `winerosetta` from that setup are not needed with Mach9.
- **DXVK on Mac**: the DXVK mod needs Vulkan; mtld3d replaces it. Hidden on Mac (`macUnsupported`).

## Findings that cost time

### Blurry or pixelated text and damage numbers
Wine's Mac driver draws in points unless Retina mode is on. WoW then rendered a 2228x1234 frame and
macOS stretched it ~1.7x to the panel. Fix: `HKCU\Software\Wine\Mac Driver` `RetinaMode=y` in the
prefix, plus `gxMaximize 1` and a resolution at full pixels (4608x2592 on this screen). mtld3d's
`render.panelFit` then renders at the panel's real pixels (it reported 4178x2354 for the window).
GPU time went from 3.6 to 7.45 ms, still far under the 16.7 ms budget.
The launcher sets `RetinaMode=y` before each Play unless the prefix already has a `RetinaMode` value
(`ensureRetinaMode` in `src/main/modules/macWine.ts`).

### Lag spikes
- Not the network: ping 26.7 ms, no jitter.
- Not the GPU: 3.4 ms per frame while FPS dropped.
- **Hardware cursor**: each hide/show of the hardware cursor delays mtld3d's next present by one
  refresh. WoW hides the cursor whenever a mouse button turns the camera, so every right-click gave
  a 33 ms frame. Fix: `cursor.software=true` (the launcher passes it in `MTLD3D_CONFIG`; the env var
  overrides `mtld3d.conf`). Keep `cursor.scale` on auto with Retina mode.
- **CPU side**: the main thread runs translated x86 code. `farClip 1500 -> 777` and wow_turbo
  removed the remaining clusters (53 FPS with spikes -> flat 59.5 FPS).
- macOS Game Mode turns on only in macOS fullscreen. Mach9 declares the games category and
  `LSSupportsGameMode`.

### Mods under Mach9
- Each alone and all together work: nampower, UnitXP_SP3, VanillaHelpers, transmogfix, SuperWoW.
  Also nampower + VanillaHelpers + SuperWoW + wow_turbo.
- **VanillaMultiMonitorFix makes WoW quit silently before Direct3D starts.** Hidden on Mac and kept
  out of `dlls.txt`.
- wow_turbo logs ~382 hooks; it leaves 1-2 functions to SuperWoW/VanillaHelpers by design.
- Not tested: wow_turbo together with UnitXP_SP3 and ClassicAPI.
- VanillaFixes reads `dlls.txt.cache`: full Windows paths of the prefix's `Z:` drive, joined with
  `\r\n` (for example `Z:\Users\me\Games\OctoWoW\SuperWoWhook.dll`). `syncVanillaFixesCache`
  writes it on Play.

### Launcher and packaging
- `npm run dev` lacks the `.env` values; run `npx electron-vite build && npx electron-vite preview
  --skipBuild` instead.
- `stormlib-node` does not build on macOS; it is an optional dependency, and `localePatch.ts` loads
  it lazily. Without it, old locale patches are not removed.
- Displays are only listed on Windows (PowerShell). The first-run seed uses Electron's
  `screen.getPrimaryDisplay()` x `scaleFactor`, so it gets full pixels on Mac too. The preferred
  monitor sync is skipped on Mac.
- The game is detected with `ps` (its `WoW.exe` command line), because the loader and Wine return
  before the game ends.
- Self-updates are off on Mac: no macOS update channel is published.
- `electron-builder --mac dir --arm64` with `CSC_IDENTITY_AUTO_DISCOVERY=false`, then
  `codesign --force --deep -s -` (ad-hoc). `spctl` rejects it, which is expected without a
  Developer ID; a local build has no quarantine flag, so it opens.
- userData stays `~/Library/Application Support/octo-launcher`, because the packaged `package.json`
  has no `productName`. Do not add one without migrating settings and the Wine prefix.
- **Never run `npx asar extract-file` inside the repository**: it writes into the current folder
  and once overwrote `package.json`.
- Mac window: `titleBarStyle: 'hidden'` with traffic lights, drawn window buttons hidden in
  `TopBar.tsx`, no menu-bar tray icon, `app.on('activate')` restores the window from the Dock.

### Remembering the WoW password
WoW 1.12 saves only the account name. Options were Keychain + a small Windows helper in the prefix
that types the password at the login screen, or macOS keystroke injection (needs Accessibility
permission, which an ad-hoc rebuild loses). Decision: dropped. A password manager + Ctrl+V works in
WoW under Wine.

## How to measure

- `MTL_HUD_ENABLED=1` when starting the launcher: Apple's Metal HUD with FPS, GPU time, draw calls,
  memory and a frame-time graph. Read spikes from the graph, not from the FPS number.
- `WINE_COMPATDB='exe=WoW.exe;d3d9=wined3d'` switches Mach9 to Wine's OpenGL renderer for an A/B
  comparison. (Not done yet: same-spot comparison mtld3d vs wined3d.)
- Mach9 sets `FEX_X87REDUCEDPRECISION=1` by default.
- Compare at the same spot in the world; zones differ a lot in draw calls (477 vs 1003 here).

## Restoring missing client files

The game folder once lost 9 MPQs. The client torrent `https://dl.octowow.st/download/client.torrent`
can fetch single files with aria2: `aria2c --select-file=<indexes> --dir=<game folder> <torrent>`
(file indexes from `aria2c -S <torrent>`).

## Open

- `npm run dist:mac` (DMG/ZIP) is not tested locally; only the `--mac dir` build is.
- A signed and notarized build needs a Developer ID.
- A real `stormlib-node` build for macOS.
- Same-spot A/B of mtld3d vs wined3d.
