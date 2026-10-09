#!/usr/bin/env python3
"""Chapter 1 base video: stock clips -> 9:16, graded, dissolved on a fixed timeline.
Usage: build_base.py [out.mp4]   (timeline T must match overlay.html)"""
import subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'work', 'base.mp4')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
X = 0.5            # dissolve length (s); each dissolve starts at the boundary
FPS = 24

# boundaries on the global timeline
T = [0, 4.6, 8.2, 12.6, 18.2, 21.0, 22.6, 28.0, 37.0, 48.0, 58.5]

# (clip, src start, speed, crop-x fraction, zoom, extra grade filters)
COOL = 'colorbalance=rs=-.05:bs=.07:rm=-.04:bm=.06'
WARM = 'colorbalance=rs=.08:bs=-.07:rm=.06:bm=-.05'
SEGS = [
 ('man',    0.2, 1.0, .52, 1.00, f'eq=saturation=.35:contrast=1.08:brightness=-.10,{COOL}'),
 ('man',    5.2, 1.0, .52, 1.00, f'eq=saturation=.30:contrast=1.08:brightness=-.06,{COOL}'),
 ('coffee', 2.0, 1.0, .72, 1.00, f'eq=saturation=.45:contrast=1.06:brightness=-.04,{COOL}'),
 ('woman',  0.3, 1.0, .36, 1.00, 'eq=gamma=1.8:saturation=.5:contrast=1.04:brightness=.02'),
 ('forest', 3.0, 1.0, .55, 1.00, f"eq=saturation='0.3+0.85*clip(t/2.4,0,1)':brightness=.03:eval=frame,{WARM}"),
 ('dream',  3.0, 1.0, .50, 1.00, f'gblur=sigma=2,eq=saturation=.8:brightness=.04,{WARM}'),
 ('forest', 8.0, 1.0, .55, 1.00, f'eq=saturation=1.15:contrast=1.04:brightness=.02,{WARM}'),
 ('forest', 16.0, .8, .55, 1.05,
   f"eq=saturation='1.25*(1-clip((t-5.4)/1.6,0,1))+0.22*clip((t-5.4)/1.6,0,1)':brightness=.03:eval=frame,{WARM}"),
 ('coffee', 11.0, .85, .70, 1.25, f'eq=saturation=.28:contrast=1.08:brightness=-.10,{COOL}'),
 ('woman',  7.8, .70, .36, 1.00, 'eq=gamma=1.7:saturation=.35:contrast=1.04:brightness=.01'),
]
assert len(SEGS) == len(T) - 1

cmd = ['ffmpeg', '-nostdin', '-loglevel', 'error', '-y']
filt = []
for i, (clip, ss, speed, cx, zoom, grade) in enumerate(SEGS):
    D = T[i + 1] - T[i]
    ln = D + (X if i < len(SEGS) - 1 else 0)          # output length of this segment
    cmd += ['-ss', f'{ss}', '-t', f'{ln * speed:.3f}', '-i', os.path.join(SRC, clip + '.mp4')]
    H = int(round(1920 * zoom / 2) * 2)
    filt.append(
        f'[{i}:v]setpts=(PTS-STARTPTS)/{speed},fps={FPS},scale=-2:{H},'
        f'crop=1080:1920:(iw-1080)*{cx}:(ih-1920)*0.5,setsar=1,{grade},'
        f'vignette=angle=PI/4.2,noise=alls=10:allf=t,format=yuv420p,settb=AVTB[v{i}]')
last = 'v0'
for i in range(1, len(SEGS)):
    nxt = f'x{i}'
    filt.append(f'[{last}][v{i}]xfade=transition=fade:duration={X}:offset={T[i]}[{nxt}]')
    last = nxt
cmd += ['-filter_complex', ';'.join(filt), '-map', f'[{last}]', '-an',
        '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', OUT]
subprocess.run(cmd, check=True)
print('ok', OUT)
