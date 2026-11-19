# Ad 33 ("what did we agree on?"): python3 build33audio.py
# r=mouse on the phone, b=business cat, m=Mitsi, p=the call recording (mouse's voice played back)
import json, subprocess, re, os
SP = os.environ.get('MITSI_SP', '/tmp/mitsi-studio')
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../audio/ad33'))
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
seq = [('r1', 1.9), ('b1', .25), ('r2', .2), ('b2', .15), ('r3', .15), ('b3', .1), ('r4', .15),
       ('m1', .7), ('p1', 1.1), ('r5', 1.5), ('m2', .35), ('r6', 1.0), ('m3', .8)]
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
T = {k: (s, d) for k, s, d in tl}
# the pitch continues as a voice-over on the end card
endcard = round(T['m3'][0] + 2.25, 3); end = round(max(t + 1.3, endcard + 5.4), 2)
fx = [['ring', 0.3, 1.5], ['whoosh', round(T['m1'][0] - .45, 3), 1.0], ['blip', round(T['p1'][0] - .45, 3), .3],
      ['blip2', round(T['m2'][0] + 1.3, 3), .3], ['whoosh2', round(endcard - .15, 3), 1.0]]
# music is silent between "there is a recording" and the pitch
json.dump({'tl': tl, 'fx': fx, 'end': end, 'endcard': endcard, 'mute': [T['m1'][0] + .9, T['m3'][0] - .3]}, open(SP + '/ads/ad33tl.json', 'w'))
VOL = {'ring': 0.12, 'whoosh': 0.3, 'whoosh2': 0.3, 'blip': 0.25, 'blip2': 0.25}
SRC = {'whoosh2': 'whoosh', 'blip2': 'blip'}
def mix(keys, o, ar=44100, mono=False):
    ins = []; fl = []; n = 0
    for k, st, du in tl + fx:
        c = k[0] if k[1:].isdigit() and k[0] in 'rbmp' and k not in fx_names else 'x'
        if keys and c not in keys: continue
        ins += ['-i', SRC.get(k, k) + '.wav']; ms = int(st * 1000)
        pre = f'volume={VOL[k]},' if k in VOL else ''
        if c == 'r': pre += 'highpass=f=220,lowpass=f=5200,volume=1.15,'            # live, on a phone line
        if c == 'p': pre += 'highpass=f=420,lowpass=f=2900,acompressor=threshold=-20dB:ratio=4,volume=1.7,'  # the recording
        fl.append(f'[{n}:a]{pre}aresample={ar},adelay={ms}|{ms}[a{n}]'); n += 1
    fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest' + (',pan=mono|c0=c0' if mono else '') + '[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(ar), o], check=True)
fx_names = {f[0] for f in fx}
mix(None, '../what-did-we-agree-mix.wav')
os.makedirs(SP + '/cat', exist_ok=True); o = {}
for c in 'rbmp':
    w = SP + '/cat/%s33.wav' % c; mix(c, w, 24000, True)
    rf = SP + '/cat/rms%s33.txt' % c
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', w, '-af', f'asetnsamples=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file={rf}', '-f', 'null', '-'])
    v = [float(x) if x != '-inf' else -100 for x in re.findall(r'RMS_level=(\S+)', open(rf).read())]
    o[c] = [round(max(0, min(1, (x + 42) / 24)), 2) for x in v]
json.dump(o, open(SP + '/ads/mouth33.json', 'w'))
for k, s, d in tl: print(k, s, round(s + d, 2))
print('endcard', endcard, 'end', end)
