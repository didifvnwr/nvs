#!/bin/bash
# Build a working folder for the Mitsi 3D video studio (ad 26 pipeline).
# Usage:  export MITSI_SP=/tmp/mitsi-studio ; bash mitsi-ads/studio/setup.sh
# Creates $MITSI_SP/ads (the page server root: html, three.js, fonts, GLB models, timeline/mouth json, frames)
# and $MITSI_SP/cat (per-character mono mixes + RMS logs used for lip-sync).
set -e
: "${MITSI_SP:=/tmp/mitsi-studio}"
R=$(cd "$(dirname "$0")/../.." && pwd)          # repo root (nvs)
A=$R/mitsi-ads
mkdir -p "$MITSI_SP/ads" "$MITSI_SP/cat"
W=$MITSI_SP/ads
cp -r "$A/studio/three" "$W/"
ln -sfn "$R/mitsi-ai/src/fonts" "$W/fonts"
cp "$A/src/mouth3d2.js" "$A/src/ad26.html" "$W/"
cp "$A/studio/logo_svg.txt" "$A/studio/whoosh.wav" "$W/"
# models: short names used by the pages
cp "$A/cat3d/mitsi-cat-3d-rigged.glb"   "$W/cat-m2.glb"   # Mitsi (grey tabby, glasses)
cp "$A/cat3d/mitsi-catf-3d-rigged.glb"  "$W/cat-f2.glb"   # ginger female cat
cp "$A/cat3d/mitsi-catb-3d-rigged.glb"  "$W/cat-b.glb"    # business cat (26 basic clips only)
cp "$A/cat3d/mitsi-dog-3d-rigged.glb"   "$W/dog.glb"      # professor dog
cp "$A/cat3d/mitsi-lion-3d-rigged.glb"  "$W/lion.glb"     # bored lion
cp "$A/cat3d/mitsi-mouse-3d-rigged.glb" "$W/mouse.glb"    # scholar mouse
# latest ad-26 timeline + mouth envelopes, so the page renders right away
cp "$A/audio/ad26/ad26tl.json" "$A/audio/ad26/mouth26.json" "$W/" 2>/dev/null || true
echo "studio ready in $MITSI_SP  (render test:  cd $A/src && MITSI_SP=$MITSI_SP node render.js test 26 5,30)"
