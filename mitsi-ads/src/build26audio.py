# Ad 26 "the king's server room": sequence lines, sfx, per-character mouth envelopes
import json, subprocess, re, os
SP = '/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad'
os.chdir('/home/user/nvs/mitsi-ads/audio/ad26')
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
seq = [('l1', 1.6), ('r1', .3), ('l2', .3), ('r2', .2), ('l3', .3), ('m1', 1.0), ('r3', .15), ('m2', .9), ('m3', 2.7), ('a1', .3),
       ('r4', .3), ('l4', .35), ('m4', .2), ('roar', .1), ('l5', .45), ('m5', .5)]
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
T = {k: (s, d) for k, s, d in tl}
end = round(t + 1.6, 2)
fx = []
# old phones ringing in the palace: bell bursts until Mitsi's first line
x = 0.0
while x < T['m1'][0] - 0.6:
    fx.append(['bells', round(x, 3), 1.0]); x += 1.25
fx.append(['thud', round(T['r3'][0] + T['r3'][1] + 0.05, 3), 1.0])
fx.append(['whoosh', round(T['m2'][0] + T['m2'][1] + 0.2, 3), 1.0])
json.dump({'tl': tl, 'fx': fx, 'end': end}, open(SP + '/ads/ad26tl.json', 'w'))
VOL = {'bells': 0.22, 'thud': 0.9, 'whoosh': 0.7, 'roar': 0.8}
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
