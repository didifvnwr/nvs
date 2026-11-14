# Ad 30 "king of excuses": narrator lines (Mitsi = Omer), phone rings, magic, chips
import json, subprocess, re, os
SP = os.environ.get('MITSI_SP', '/tmp/mitsi-studio')
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../audio/ad30'))
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
seq = [('n1', .9), ('n2', .6), ('n3', .5), ('n4', .6), ('n5', .8), ('n6', .6)]
t = 0; tl = []
for k, g in seq:
    st = t + g; d = dur(k + '.wav'); tl.append([k, round(st, 3), round(d, 3)]); t = st + d
T = {k: (s, d) for k, s, d in tl}
end = round(t + 2.6, 2)
chips = [round(T['n5'][0] + c, 3) for c in (3.4, 5.3, 6.6, 8.4)]
fx = [['ring', round(T['n3'][0] + 0.9, 3), 2.4], ['ring', round(T['n3'][0] + 3.9, 3), 2.4], ['ring2', round(T['n4'][0] + 0.6, 3), 2.4], ['ring2', round(T['n4'][0] + 3.6, 3), 2.4],
      ['whoosh', round(T['n5'][0] - .5, 3), 1.0], ['whoosh2', round(T['n6'][0] - .3, 3), 1.0]] + [['blip', c, .12] for c in chips]
json.dump({'tl': tl, 'fx': fx, 'end': end, 'chips': chips}, open(SP + '/ads/ad30tl.json', 'w'))
VOL = {'ring': 0.10, 'ring2': 0.05, 'whoosh': 0.35, 'whoosh2': 0.3, 'blip': 0.18}
SRC = {'ring2': 'ring', 'whoosh2': 'whoosh'}
def mix(voice_only, out, ar=44100, mono=False):
    ins = []; fl = []; n = 0
    for k, st, du in tl + fx:
        if voice_only and k[0] != 'n': continue
        ins += ['-i', SRC.get(k, k) + '.wav']; ms = int(st * 1000)
        pre = f'volume={VOL[k]},' if k in VOL else ''
        fl.append(f'[{n}:a]{pre}aresample={ar},adelay={ms}|{ms}[a{n}]'); n += 1
    fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest' + (',pan=mono|c0=c0' if mono else '') + '[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(ar), out], check=True)
mix(False, '../king-of-excuses-mix.wav')
os.makedirs(SP + '/cat', exist_ok=True)
w = SP + '/cat/n30.wav'; mix(True, w, 24000, True)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', w, '-af', f'asetnsamples=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file={SP}/cat/rmsn30.txt', '-f', 'null', '-'])
v = [float(x) if x != '-inf' else -100 for x in re.findall(r'RMS_level=(\S+)', open(SP + '/cat/rmsn30.txt').read())]
json.dump({'n': [round(max(0, min(1, (x + 42) / 24)), 2) for x in v]}, open(SP + '/ads/mouth30.json', 'w'))
for k, s, d in tl: print(k, s, round(s + d, 2))
print('end', end, 'chips', chips)
