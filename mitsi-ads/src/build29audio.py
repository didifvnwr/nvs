# Ad 29 "support group": sequence lines, sfx, per-character mouth envelopes
import json, subprocess, re, os
SP = os.environ.get('MITSI_SP', '/tmp/mitsi-studio')
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../audio/ad29'))
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
# d=dog (moderator) l=lion r=mouse b=business cat s=street cat g=ginger m=mitsi i=IVR c=chorus
seq = [('d1', .8), ('l1', .4), ('c0', .15), ('r1', .35), ('c1', .15), ('b1', .35), ('c2', .15), ('s1', .35), ('c3', .15),
       ('g1', .35), ('c4', .2), ('m1', .5), ('dial', .2), ('i1', .15), ('m2', .4), ('g2', .4), ('m3', .25), ('c5', .2)]
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
T = {k: (s, d) for k, s, d in tl}
end = round(t + 7.0, 2)
# feature chips pop on the pitch, timed from the transcript of m2 (seconds into the line)
chips = [2.76, 5.0, 6.24, 8.08, 9.9]
fx = [['blip', round(T['m2'][0] + c, 3), 0.12] for c in chips]
fx.append(['whoosh', round(T['c5'][0] + T['c5'][1] + .25, 3), 1.0])
json.dump({'tl': tl, 'fx': fx, 'end': end, 'chips': [round(T['m2'][0] + c, 3) for c in chips]}, open(SP + '/ads/ad29tl.json', 'w'))
VOL = {'dial': 0.35, 'blip': 0.18, 'whoosh': 0.35}
def mix(keys, out, ar=44100, mono=False):
    ins = []; fl = []; n = 0
    for k, st, du in tl + fx:
        c = k[0] if k[1:].isdigit() else 'x'
        if keys and c not in keys: continue
        ins += ['-i', k + '.wav']; ms = int(st * 1000)
        pre = f'volume={VOL[k]},' if k in VOL else ''
        fl.append(f'[{n}:a]{pre}aresample={ar},adelay={ms}|{ms}[a{n}]'); n += 1
    fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest' + (',pan=mono|c0=c0' if mono else '') + '[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(ar), out], check=True)
mix(None, '../support-group-mix.wav')
os.makedirs(SP + '/cat', exist_ok=True); o = {}
for c in 'dlrbsgmic':
    w = SP + '/cat/' + c + '29.wav'; mix(c, w, 24000, True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', w, '-af', f'asetnsamples=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file={SP}/cat/rms{c}29.txt', '-f', 'null', '-'])
    v = [float(x) if x != '-inf' else -100 for x in re.findall(r'RMS_level=(\S+)', open(SP + '/cat/rms' + c + '29.txt').read())]
    o[c] = [round(max(0, min(1, (x + 42) / 24)), 2) for x in v]
json.dump(o, open(SP + '/ads/mouth29.json', 'w'))
for k, s, d in tl: print(k, s, round(s + d, 2))
print('end', end)
