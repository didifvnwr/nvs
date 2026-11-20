#!/bin/bash
# Render a standalone studio ad (ad26-style page) in both native formats and mux with voice + music.
# Usage: MITSI_SP=/tmp/mitsi-studio bash mitsi-ads/studio/render-ad.sh <N> <voice-mix.wav> <out-basename> [music.mp3]
#   e.g. bash render-ad.sh 26 ../audio/throne-mix.wav mitsi-ad-26-the-kings-server-room
# Needs $MITSI_SP/ads/ad<N>.html and $MITSI_SP/ads/ad<N>tl.json ({"end":seconds,...}).
set -e
: "${MITSI_SP:=/tmp/mitsi-studio}"; export MITSI_SP
N=$1; VOICE=$(realpath "$2"); OUT=$3
A=$(cd "$(dirname "$0")/.." && pwd); MUS=${4:-$A/audio/music/blues-3.mp3}
W=$MITSI_SP/ads; cd "$A/src"; cp ad$N.html "$W/" 2>/dev/null || true
END=$(python3 -c "import json;print(json.load(open('$W/ad${N}tl.json'))['end'])"); T=$(python3 -c "print(int($END*24))")
ffmpeg -y -loglevel error -i "$VOICE" -i "$MUS" -filter_complex "[0:a]loudnorm=I=-15:TP=-1.5,aresample=48000,apad=whole_dur=$END[v];[1:a]atrim=0:$END,asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I=-29:TP=-3,afade=t=in:d=0.5,afade=t=out:st=$(python3 -c "print($END-2.5)"):d=2.5[m];[v][m]amix=inputs=2:normalize=0:duration=longest,atrim=0:$END[o]" -map "[o]" -c:a aac -b:a 192k "$W/audio$N.m4a"
for AD in $N ${N}w; do
  rm -rf "$W/frames$AD"
  for i in 0 1 2 3; do a=$((T*i/4)); e=$((T*(i+1)/4)); node render.js full $AD $a $e > "$W/r${AD}_$i.log" 2>&1 & done
  wait
  if [ "$AD" = "${N}w" ]; then SC="1920:1080"; F="$A/$OUT-16x9.mp4"; else SC="1080:1920"; F="$A/$OUT-9x16.mp4"; fi
  ffmpeg -y -loglevel error -framerate 24 -i "$W/frames$AD/f%05d.jpg" -i "$W/audio$N.m4a" -frames:v $T -vf "scale=$SC:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 20 -c:a copy -shortest -movflags +faststart "$F"
  echo "$F $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")"
done
