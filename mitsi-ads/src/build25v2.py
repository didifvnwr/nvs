# Ad 25 v2: faster re-recorded lines, tight gaps, time-warp new real time -> v1 story time
import json, subprocess, re, os
SP = '/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad'
os.chdir('/home/user/nvs/mitsi-ads/audio/ad25')
old = json.load(open('v1/timeline.json'))
O = {k: (s, d) for k, s, d in old['tl']}
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
def pauses(f):
    out = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=n=-38dB:d=0.14', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]; e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    return [(a + b) / 2 for a, b in zip(s, e)]
seq = [('d1', .4), ('f1', .2), ('m1', .12), ('d2', .3), ('d3', .2), ('f2', .2), ('d4', .12), ('m2', .3), ('d5', .2), ('m3', .2),
       ('d6', .3), ('f3', .15), ('d7', .3), ('m4', .2), ('d8', .2), ('m5', .2), ('ball', .05), ('d9', .2), ('d10', .35), ('m6', .45), ('bark1', .25)]
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
A = [(0, 0)]
for k, s, d in tl:
    os_, od = O[k]; A.append((s, os_))
    if k[0] in 'dfm' and k[1:].isdigit():
        pn, po = pauses(k + '.wav'), pauses('v1/' + k + '.wav')
        if len(pn) == len(po):
            for a, b in zip(pn, po): A.append((s + a, os_ + b))
        else: print('inner mismatch', k, len(pn), len(po))
    A.append((s + d, os_ + od))
A.sort()
def inv(o):
    for i in range(1, len(A)):
        (n0, o0), (n1, o1) = A[i - 1], A[i]
        if o0 <= o <= o1 and o1 > o0: return n0 + (o - o0) * (n1 - n0) / (o1 - o0)
    return A[-1][0] + (o - A[-1][1])
rs = [round(inv(s), 3) for _, s, _ in old['rings']]; rings = [['ring', x, round(min(2.0, (rs[i+1] - x - .08) if i+1 < len(rs) else 1.3), 3)] for i, x in enumerate(rs)]
cuts = [round(inv(c), 2) for c in [0, 10.2, 14.8, 25.8, 33.1, 50.0, 55.1, 68.4, 75.3, 81.1]]
json.dump({'tl': tl, 'rings': rings, 'end': round(t, 2)}, open('timeline.json', 'w'))
json.dump([[round(a, 3), round(b, 3)] for a, b in A], open(SP + '/cat/warp25.json', 'w'))
tl_all = tl + rings
src = {'ring': '../sfx/ring.mp3'}
def mix(keys, out, ar=44100, mono=False):
    ins = []; fl = []; n = 0
    for k, st, du in tl_all:
        c = k[0] if k[0] in 'dfm' and k[1:].isdigit() else 'x'
        if keys and c not in keys: continue
        ins += ['-i', src.get(k, k + '.wav')]; ms = int(st * 1000)
        pre = f'atrim=0:{du},afade=t=out:st={max(0,du-0.15)}:d=0.15,volume=0.22,' if k == 'ring' else 'volume=0.8,' if k == 'ball' else ''
        fl.append(f'[{n}:a]{pre}aresample={ar},adelay={ms}|{ms}[a{n}]'); n += 1
    fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest' + (',pan=mono|c0=c0' if mono else '') + '[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(ar), out], check=True)
mix(None, '../professor-mix.wav')
o = {}
for c in 'dfm':
    w = SP + '/cat/' + c + '25.wav'; mix(c, w, 24000, True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', w, '-af', f'asetnsamples=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file={SP}/cat/rms{c}25.txt', '-f', 'null', '-'])
    v = [float(x) if x != '-inf' else -100 for x in re.findall(r'RMS_level=(\S+)', open(SP + '/cat/rms' + c + '25.txt').read())]
    o[c] = [round(max(0, min(1, (x + 42) / 24)), 2) for x in v]
json.dump(o, open(SP + '/cat/mouth25.json', 'w'))
b = open('/home/user/nvs/mitsi-ads/src/build.py').read()
b = re.sub(r"('25w?':\{)'m':'[^']*'", lambda m: m.group(1) + "'m':U+'c7c0e382-____________3.mp3'", b)
b = re.sub(r"('25w?':\{[^}]*'cuts':)\[[^\]]*\]", lambda m: m.group(1) + json.dumps(cuts), b)
open('/home/user/nvs/mitsi-ads/src/build.py', 'w').write(b)
print('cuts', cuts, 'end', round(t, 2)); print('rings', rings)
