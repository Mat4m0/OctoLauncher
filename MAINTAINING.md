# Maintaining the macOS fork

This is a downstream macOS port of the public OctoWoW launcher. The canonical
Mac release lives on `main`. `origin` is this GitHub repository and `upstream`
is the OctoWoW source repository.

## Upstream constraint

OctoWoW has published releases with rewritten Git history. For example, the
local 1.2.2 source and upstream 1.3.6 have no common Git ancestor. Do not merge
`upstream/main` into `main` with `--allow-unrelated-histories`; that produces a
misleading history and makes later updates harder.

Treat each upstream release as a source snapshot:

1. Fetch `upstream` and record its commit and launcher version.
2. Tag the last tested Mac release before changing the source.
3. Create a temporary `port/<version>` branch from the new upstream commit.
4. Replay the small macOS changes by concern: packaging, Wine runtime, then UI
   and documentation. Resolve changes against the new upstream implementation
   instead of preserving old code mechanically.
5. Run the Windows build check, the macOS typecheck and package build, and the
   gameplay checklist in `BUILD_MAC.md`.
6. Move `main` to the tested port, tag it as `mac-v<upstream-version>.<revision>`,
   and publish the DMG and ZIP checksums.

Useful comparison commands:

```bash
git fetch upstream main
git log -1 --oneline upstream/main
git diff --stat main upstream/main
git diff --name-status main upstream/main
```

## Release policy

- Keep the downloaded game directory as canonical player data. Never bundle
  game files, credentials, or a Wine prefix in launcher releases.
- Keep Wine external. Prefer current Gcenx Wine builds; do not depend on the
  archived Whisky project.
- Keep macOS launcher self-updates disabled until releases are signed,
  notarized, and published through a Mac update channel.
- Publish unsigned builds only as clearly labeled personal/testing releases.
- Record the exact upstream commit in each GitHub release.

## Versioning

Use `mac-v<upstream-version>.<revision>` for tags. The first preserved port is
`mac-v1.2.2.1`. Increment the final number only for Mac-specific rebuilds of the
same upstream version.
