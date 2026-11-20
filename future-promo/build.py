# Futuristic promo (Hakol Hachadash + Mitsi): audio mix, timeline, graded 9:16 background track.
import json, subprocess, os, array, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
run = lambda a: subprocess.run(a, check=True)
dur = lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
FPS = 30
# --- narration timeline ---
t = 1.2; tl = []
for i in range(7):
    d = dur(f'audio/n{i}.wav'); tl.append([f'n{i}', round(t, 3), round(d, 3)]); t += d + 0.45
T = {k: (s, s + d) for k, s, d in tl}
# --- music: loop the 12s instrumental phrase once, then play through to the sung ending ---
L0, L1 = 6.168, 18.168            # phrase boundaries in the song
K = 2                             # extra loops
shift = (L1 - L0) * K             # video time = song time + shift (after the loops)
FILL = 21.94 + shift              # drum fill that leads into the ending
SING = 26.75 + shift              # sung "New Voice Studio"
END = round(32.112 + shift, 2)
parts = [f"[0:a]atrim=0:{L1},asetpts=PTS-STARTPTS[m0]"]
for k in range(K): parts.append(f"[0:a]atrim={L0}:{L1},asetpts=PTS-STARTPTS[m{k+1}]")
parts.append(f"[0:a]atrim={L0},asetpts=PTS-STARTPTS[m{K+1}]")
parts.append(''.join(f'[m{i}]' for i in range(K + 2)) + f"concat=n={K+2}:v=0:a=1[mus]")
run(['ffmpeg','-y','-loglevel','error','-i','audio/music.mp3','-filter_complex',';'.join(parts),'-map','[mus]','-ar','48000','audio/music_long.wav'])
# --- mix: music ducked under the narration, full level for the ending ---
ins = ['-i','audio/music_long.wav']; fl = []
up = T['n6'][1] + 0.1
fl.append(f"[0:a]volume='if(lt(t,1.0),0.7-0.38*t,if(lt(t,{up}),0.32,min(1.0,0.32+(t-{up})*1.7)))':eval=frame[mu]")
for i, (k, s, d) in enumerate(tl):
    ins += ['-i', f'audio/{k}.wav']; ms = int(s * 1000)
    fl.append(f"[{i+1}:a]adelay={ms}|{ms}[v{i}]")
fl.append(''.join(f'[v{i}]' for i in range(7)) + "amix=inputs=7:normalize=0,loudnorm=I=-15:TP=-1.5,aresample=48000,pan=stereo|c0=c0|c1=c0[vo]")
fl.append(f"[mu][vo]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95,afade=t=out:st={END-1.2}:d=1.2[o]")
run(['ffmpeg','-y','-loglevel','error'] + ins + ['-filter_complex',';'.join(fl),'-map','[o]','-t',str(END),'-c:a','aac','-b:a','192k','out/audio.m4a'])
# --- envelopes (30 fps): narration + music, for the on-screen waveforms ---
def env(args):
    raw = subprocess.check_output(['ffmpeg','-loglevel','error'] + args + ['-ac','1','-ar','12000','-f','s16le','-'])
    a = array.array('h', raw); per = 12000 // FPS; e = []
    for i in range(0, len(a), per):
        c = a[i:i+per]; e.append((sum(x*x for x in c) / max(1, len(c))) ** .5 / 32768)
    mx = max(e) or 1; return [round(min(1, v / mx * 1.25), 3) for v in e]
vins = []; vfl = []
for i, (k, s, d) in enumerate(tl):
    vins += ['-i', f'audio/{k}.wav']; ms = int(s * 1000); vfl.append(f"[{i}:a]adelay={ms}|{ms}[v{i}]")
vfl.append(''.join(f'[v{i}]' for i in range(7)) + "amix=inputs=7:normalize=0[o]")
voice = env(vins + ['-filter_complex', ';'.join(vfl), '-map', '[o]'])
music = env(['-i', 'audio/music_long.wav'])
# --- sections ---
cut = lambda k: round(T[k][0] - 0.3, 3)
SEC = {'intro': 0, 's1': cut('n1'), 's2': cut('n2'), 's3': cut('n3'), 's4': cut('n4'), 'tech': cut('n5'), 'brands': cut('n6'), 'end': round(FILL, 3)}
json.dump({'tl': tl, 'sec': SEC, 'fill': round(FILL, 3), 'sing': round(SING, 3), 'end': END, 'fps': FPS, 'voice': voice, 'music': music}, open('src/timeline.json', 'w'))
if '--audio-only' in sys.argv:
    print('audio only; end', END); sys.exit(0)
# --- background track: crop to 9:16, grade, slow drift, glitch on the cuts ---
order = ['intro', 's1', 's2', 's3', 's4', 'tech', 'brands', 'end']
bound = [SEC[k] for k in order] + [END]
def seg(name, clip, ss, length, cx, grade, speed=1.0, extra=''):
    out = f'out/seg_{name}.mp4'
    vf = (f"setpts={1/speed}*PTS,fps={FPS},crop=ih*9/16*0.94:ih*0.94:(iw-ih*9/16*0.94)*{cx}+sin(t*0.5)*ih*0.012:ih*0.03+cos(t*0.4)*ih*0.012,"
          f"scale=1080:1920:flags=lanczos,{grade}{extra},vignette=PI/4.5,format=yuv420p")
    run(['ffmpeg','-y','-loglevel','error','-ss',str(ss),'-i',f'clips/{clip}.mp4','-t',str(length + 0.2),'-vf',vf,'-frames:v',str(round(length * FPS)),'-an','-c:v','libx264','-preset','fast','-crf','16',out])
    return out
G_COOL = "eq=contrast=1.1:brightness=-0.07:saturation=1.05,colorbalance=rs=-0.06:bs=0.10:bm=0.05,unsharp=5:5:0.6"
G_WARM2COOL = "eq=contrast=1.12:brightness=-0.09:saturation=0.7,colorbalance=rs=-0.16:rm=-0.10:bs=0.22:bm=0.14,unsharp=5:5:0.6"
G_DARK = "eq=contrast=1.05:brightness=-0.22:saturation=0.9,colorbalance=bs=0.12:bm=0.06,gblur=sigma=6"
L = lambda a, b: round(SEC[b] - SEC[a], 4) if b != 'END' else round(END - SEC[a], 4)
segs = [seg('intro', 'c5', 0, L('intro', 's1'), .5, G_COOL, speed=5.6 / L('intro', 's1')),
        seg('s1', 'c1', 1.0, L('s1', 's2'), .5, G_COOL),
        seg('s2', 'c2', 2.0, L('s2', 's3'), .5, G_COOL),
        seg('s3', 'c3', 2.0, L('s3', 's4'), .45, G_COOL),
        seg('s4', 'c4', 6.0, L('s4', 'tech'), .22, G_WARM2COOL)]
q = L('tech', 'brands') / 4
for i, (c, ss, cx, g) in enumerate([('c1', 10, .5, G_COOL), ('c3', 9, .45, G_COOL), ('c2', 12, .5, G_COOL), ('c4', 30, .22, G_WARM2COOL)]):
    segs.append(seg(f'tech{i}', c, ss, q, cx, g))
segs.append(seg('brands', 'c5', 0, L('brands', 'end'), .5, G_COOL, speed=5.6 / L('brands', 'end')))
# ending: the chip clip forward + reversed, dark and soft, under the logos
run(['ffmpeg','-y','-loglevel','error','-i','clips/c5.mp4','-filter_complex','[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[o]','-map','[o]','-an','-c:v','libx264','-crf','14','out/c5loop.mp4'])
os.replace('out/c5loop.mp4', 'clips/c5loop.mp4')
segs.append(seg('end', 'c5loop', 0, L('end', 'END'), .5, G_DARK, speed=11.4 / L('end', 'END')))
open('out/concat.txt', 'w').write(''.join(f"file '{os.path.basename(s)}'\n" for s in segs))
gl = '+'.join(f"between(t,{b-0.10:.3f},{b+0.16:.3f})" for b in bound[1:-1])
run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','out/concat.txt','-vf',f"rgbashift=rh=14:bh=-14:gv=3:enable='{gl}',noise=alls=18:allf=t:enable='{gl}',format=yuv420p",'-c:v','libx264','-preset','medium','-crf','15','-r',str(FPS),'out/bg.mp4'])
print('sections', SEC, 'fill', FILL, 'sing', SING, 'end', END); print('bg', dur('out/bg.mp4'), 'audio', dur('out/audio.m4a'))
for k, s, d in tl: print(k, s, round(s + d, 2))
