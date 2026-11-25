#!/usr/bin/env bash
# Build the Linux AppImage in Docker from committed files (uncommitted edits are not included).
#   Tools/linux/build-appimage.sh [production|ptr] [git-ref]    ->  dist-linux/<mode>/
# Output: OctoLauncher-<version>.AppImage (PTR: OctoLauncher-PTR-<version>.AppImage) + latest-linux.yml.
set -euo pipefail
MODE=${1:-production}
REF=${2:-HEAD}
case "$MODE" in production|ptr) ;; *) echo "usage: $0 [production|ptr] [git-ref]" >&2; exit 2;; esac

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
WORK=.linux-build
OUT=dist-linux/$MODE
rm -rf "$WORK/extra" "$OUT"
mkdir -p "$WORK/aria2" "$WORK/extra/resources" "$OUT"

# 1. static aria2c (Docker caches it after the first build)
docker build --output "type=local,dest=$WORK/aria2" Tools/linux/aria2c
cp "$WORK/aria2/aria2c" "$WORK/extra/resources/aria2c"

# 2. context = the committed tree (exact paths, LF) + the aria2c binary
git -c core.autocrlf=false archive --format=tar -o "$WORK/context.tar" "$REF"
tar --append -f "$WORK/context.tar" --mode=0755 -C "$WORK/extra" resources/aria2c
# the PTR build files are export-ignore, so git archive leaves them out
if [ "$MODE" = ptr ]; then
  for f in .env.ptr electron-builder.ptr.yml; do git cat-file blob "$REF:$f" > "$WORK/extra/$f"; done
  tar --append -f "$WORK/context.tar" --mode=0644 -C "$WORK/extra" .env.ptr electron-builder.ptr.yml
fi

# 3. build
docker build -f Tools/linux/Dockerfile.appimage --build-arg "MODE=$MODE" \
  --output "type=local,dest=$OUT" - < "$WORK/context.tar"
ls -la "$OUT"
