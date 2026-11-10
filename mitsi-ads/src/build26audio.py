# Ad 26 "the king's server room": sequence lines, sfx, per-character mouth envelopes
import json, subprocess, re, os
SP = '/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad'
os.chdir('/home/user/nvs/mitsi-ads/audio/ad26')
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
seq = [('l1', 1.3), ('r1', .3), ('l2', .25), ('r2', .2), ('l3', .3), ('m1', .9), ('m2', 2.8), ('m3', .5), ('a1', .3),
       ('r4', .3), ('l4', .35), ('m4', .2), ('roar', .1), ('l5', .45), ('m5', .5)]
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
T = {k: (s, d) for k, s, d in tl}
end = round(t + 1.6, 2)
fx = [['noise', 0.1, 2.0], ['noise2', round(T['r1'][0] + 2.4, 3), 2.0], ['noise2', round(T['r2'][0] + .6, 3), 2.0]]
fx.append(['magic', round(T['m1'][0] + T['m1'][1] + 0.1, 3), 3.2])
json.dump({'tl': tl, 'fx': fx, 'end': end}, open(SP + '/ads/ad26tl.json', 'w'))
VOL = {'noise': 0.55, 'noise2': 0.55, 'magic': 0.75, 'roar': 0.8}
def mix(keys, out, ar=44100, mono=False):
    ins = []; fl = []; n = 0
    for k, st, du in tl + fx:
        c = k[0] if k[0] in 'lrma' and k[1:].isdigit() else 'x'
        if keys and c not in keys: continue
        ins += ['-i', k + '.wav']; ms = int(st * 1000)
        pre = f'volume={VOL[k]},' if k in VOL else ''
        fl.append(f'[{n}:a]{pre}aresample={ar},adelay={ms}|{ms}[a{n}]'); n += 1
    fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest' + (',pan=mono|c0=c0' if mono else '') + '[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(ar), out], check=True)
mix(None, '../throne-mix.wav')
o = {}
for c in 'lrma':
    w = SP + '/cat/' + c + '26.wav'; mix(c, w, 24000, True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', w, '-af', f'asetnsamples=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file={SP}/cat/rms{c}26.txt', '-f', 'null', '-'])
    v = [float(x) if x != '-inf' else -100 for x in re.findall(r'RMS_level=(\S+)', open(SP + '/cat/rms' + c + '26.txt').read())]
    o[c] = [round(max(0, min(1, (x + 42) / 24)), 2) for x in v]
json.dump(o, open(SP + '/ads/mouth26.json', 'w'))
for k, s, d in tl: print(k, s, round(s + d, 2))
print('fx', fx[-2:], 'end', end)
