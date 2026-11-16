# Ads 31 ("We are in Brooklyn") and 32 ("accent course"): python3 build31audio.py 31|32
import json, subprocess, re, os, sys
N = sys.argv[1]
SP = os.environ.get('MITSI_SP', '/tmp/mitsi-studio')
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../audio/ad' + N))
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
if N == '31':   # b=business cat, c=US caller (off screen), v=market vendor (off screen), m=Mitsi
    seq = [('b1', 2.0), ('c1', .3), ('b2', .3), ('v1', .15), ('c2', .4), ('b3', .3), ('c3', .35), ('b4', 1.5), ('m1', .5), ('v2', .3), ('m2', .35)]
    out = '../brooklyn-mix.wav'; chars = 'bm'
else:           # r=mouse teacher, b=business cat, c=US caller, m=Mitsi
    seq = [('r1', .8), ('b1', .3), ('r2', .25), ('b2', .3), ('b3', 2.2), ('r3', .25), ('c1', 2.0), ('b4', 1.5), ('m1', .5), ('m2', .4)]
    out = '../accent-course-mix.wav'; chars = 'rbm'
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
T = {k: (s, d) for k, s, d in tl}
endcard = round(t + .45, 3); end = round(endcard + 4.6, 2)
if N == '31':
    fx = [['ring', 0.4, 1.5], ['busy', round(T['c3'][0] + T['c3'][1] + .1, 3), 1.1], ['whoosh', round(T['m1'][0] - .45, 3), 1.0]]
else:
    fx = [['whoosh', round(T['b2'][0] + T['b2'][1] + .2, 3), 1.0], ['ring', round(T['c1'][0] - 1.7, 3), 1.5], ['busy', round(T['c1'][0] + T['c1'][1] + .1, 3), 1.1], ['whoosh2', round(T['m1'][0] - .45, 3), 1.0]]
fx.append(['whoosh3', round(endcard - .15, 3), 1.0])
json.dump({'tl': tl, 'fx': fx, 'end': end, 'endcard': endcard}, open(SP + '/ads/ad%stl.json' % N, 'w'))
VOL = {'ring': 0.12, 'busy': 0.10, 'whoosh': 0.3, 'whoosh2': 0.3, 'whoosh3': 0.3, 'v1': 0.75, 'v2': 0.6}
SRC = {'whoosh2': 'whoosh', 'whoosh3': 'whoosh'}
def mix(keys, o, ar=44100, mono=False):
    ins = []; fl = []; n = 0
    for k, st, du in tl + fx:
        c = k[0] if k[1:].isdigit() else 'x'
        if keys and c not in keys: continue
        ins += ['-i', SRC.get(k, k) + '.wav']; ms = int(st * 1000)
        pre = f'volume={VOL[k]},' if k in VOL else ''
        # the caller sounds like a phone line
        if c == 'c': pre += 'highpass=f=350,lowpass=f=3200,volume=1.4,'
        fl.append(f'[{n}:a]{pre}aresample={ar},adelay={ms}|{ms}[a{n}]'); n += 1
    fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest' + (',pan=mono|c0=c0' if mono else '') + '[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(ar), o], check=True)
mix(None, out)
os.makedirs(SP + '/cat', exist_ok=True); o = {}
for c in chars + 'c':
    w = SP + '/cat/%s%s.wav' % (c, N); mix(c, w, 24000, True)
    rf = SP + '/cat/rms%s%s.txt' % (c, N)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', w, '-af', f'asetnsamples=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file={rf}', '-f', 'null', '-'])
    v = [float(x) if x != '-inf' else -100 for x in re.findall(r'RMS_level=(\S+)', open(rf).read())]
    o[c] = [round(max(0, min(1, (x + 42) / 24)), 2) for x in v]
json.dump(o, open(SP + '/ads/mouth%s.json' % N, 'w'))
for k, s, d in tl: print(k, s, round(s + d, 2))
print('endcard', endcard, 'end', end)
