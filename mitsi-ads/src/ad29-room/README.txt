Ad 29 "support group" – the released version (community-center room, Mitsi = studio cat-m2.glb, Omer's voice).
Separate from src/ad29.html (an all-animal-cast variant that was not released).
Build: put the wavs from audio/ad29/room + audio/ad29/{m1,i1,m2,c5}.wav (as n_m1,n_i1,n_m2,n_c5) next to build2.py, run it
(writes data2.json + final_audio2.wav with blues), then serve this folder with three@0.160 in node_modules, cat-m2.glb,
mouth3d2.js, heebo-300/800.ttf and the Heebo woff2 files, and run: node capture.js 1080 1920 out/v  /  node capture.js 1920 1080 out/h
Uses the studio three.js r170 (mitsi-ads/studio/three copied to ./three) – r160 mis-measured Mitsi's height and put the mouth on the neck. Mitsi mouth: x0 -.025 (face centerline).
