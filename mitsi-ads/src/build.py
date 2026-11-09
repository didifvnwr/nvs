import json,subprocess,sys
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
A='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/ads/'
MUS='/home/user/nvs/demo-video/audio/music-v3.mp3'
TAIL=4.0
AD={'1':{'v':'f39a9c30-______1.mp3','cuts':[0,3.2,6.9,12.15,16.43,21.82,25.42,27.85],'ids':['a1','a2','a3','a4','a5','a6','a7','cta']},
    '2':{'v':'6f0bf6ff-______2.mp3','cuts':[0,3.25,5.55,9.2,14.3,16.25],'ids':['b1','b2','b3','b4','b5','cta']},
    '3':{'v':'2657470b-______3.mp3','cuts':[0,3.85,8.6,12.4,16.0],'ids':['e1','e2','e3','e4','cta']},
    '5':{'m':U+'c7c0e382-____________3.mp3','v':'2c04855e-______5.mp3','cuts':[0,2.8,6.5,11.3,15.95,20.0],'ids':['f1','f2','f3','f4','f5','cta']},
    '6':{'m':U+'23d20477-____________5.mp3','v':'5d2bd2e1-______6.mp3','cuts':[0,3.55,6.85,10.5,14.55,18.7,21.8],'ids':['g1','g2','g3','g4','g5','g6','cta']},
    '7':{'m':U+'c7c0e382-____________3.mp3','v':'2c04855e-______5.mp3','cuts':[0,2.8,6.5,11.3,15.95,20.0],'ids':['h1','h2','h3','h4','h5','cta']},
    '8':{'m':U+'23d20477-____________5.mp3','v':'5d2bd2e1-______6.mp3','cuts':[0,3.55,6.85,10.5,14.55,18.7,21.8],'ids':['k1','k2','k3','k4','k5','k6','cta']},
    '9':{'m':U+'23d20477-____________5.mp3','v':'ce3ba23a-ElevenLabs_2026-11-05T15_25_38_Danit_-_Natural_Israeli_Hebrew_pvc_s50_sim75_v4.mp3','cuts':[0,5.0,7.3,11.33,13.95,16.7,19.05],'ids':['p1','p2','p3','p4','p5','p6','cta']},
    '10':{'m':U+'4cf73a77-____________2.mp3','vp':'/home/user/nvs/mitsi-ads/audio/zimmer-omer-take1.mp3','v':'','cuts':[0,3.13,4.4,8.35,10.77,14.95,23.02,26.71,28.8,32.9],'ids':['z1','z2','z3','z4','z5','z6','z7','z8','z9','cta']},
    '11':{'m':U+'c7c0e382-____________3.mp3','vp':'/home/user/nvs/mitsi-ads/audio/life-danit-v2-take1.mp3','v':'','cuts':[0,1.3,4.22,6.6,10.15,12.87,16.02,18.94,23.81,26.52,29.75],'ids':['y1','y2','y3','y4','y5','y6','y7','y8','y9','y10','cta']},
    '12':{'m':U+'23d20477-____________5.mp3','vp':'/home/user/nvs/mitsi-ads/audio/lost-calls-danit-v2-take1.mp3','v':'','cuts':[0,1.9,5.6,10.5,13.6,19.97,23.14,27.3,30.2],'ids':['q1','q2','q3','q4','q5','q6','q7','q8','cta']},
    '13':{'m':U+'4cf73a77-____________2.mp3','vp':'/home/user/nvs/mitsi-ads/audio/future-danit-take1-fixed.mp3','v':'','cuts':[0,2.37,5.74,8.58,14.15,16.15,20.86,24.71],'ids':['x1','x2','x3','x4','x5','x6','x7','cta']},
    '14':{'m':U+'c7c0e382-____________3.mp3','vp':'/home/user/nvs/mitsi-ads/audio/allinone-danit-take2.mp3','v':'','cuts':[0,4.27,8.58,15.05,17.96,22.04,26.2],'ids':['w1','w2','w3','w4','w5','w6','cta']},
    '15':{'m':U+'4cf73a77-____________2.mp3','vp':'/home/user/nvs/mitsi-ads/audio/claude-pbx-v2-take1.mp3','v':'','cuts':[0,3.86,9.92,14.83,24.30,27.78,34.87,41.10,44.78,48.07,50.62],'ids':['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','cta']},
    '16':{'m':U+'c7c0e382-____________3.mp3','vp':'/home/user/nvs/mitsi-ads/audio/selfservice-from-did.mp3','v':'','cuts':[0,5.0,10.5,14.3,17.7,21.55,27.2,29.1,34.65,40.6,45.55,48.0],'ids':['ss1','ss2','ss3','ss4','ss5','ss6','ss7','ss8','ss9','ss10','ss11','cta']},
    '17':{'m':U+'23d20477-____________5.mp3','vp':'/home/user/nvs/mitsi-ads/audio/available-danit-take1.mp3','v':'','cuts':[0,2.85,8.45,12.53,15.86,18.66,22.62,26.98,30.66,33.65,37.36],'ids':['av1','av2','av3','av4','av5','av6','av7','av8','av9','av10','cta']},
    '17p':{'m':U+'23d20477-____________5.mp3','vp':'/home/user/nvs/mitsi-ads/audio/available-from-did.mp3','v':'','cuts':[0,2.38,7.94,11.90,15.25,17.96,22.02,26.27,29.99,33.07,36.8],'ids':['av1','av2','av3','av4','av5','av6','av7','av8','av9','av10','cta']},
    '18':{'m':U+'c7c0e382-____________3.mp3','vp':'/home/user/nvs/mitsi-ads/audio/cat-mix.wav','v':'','cuts':[0,13.1,23.62,38.2,51.0,61.4],'ids':['c1','c2','c3','c4','c5','cta']},
    '19':{'m':U+'c7c0e382-____________3.mp3','vp':'/home/user/nvs/mitsi-ads/audio/cat-mix-v2.wav','v':'','cuts':[0,13.1,23.62,38.2,51.0,61.4],'ids':['c1','c2','c3','c4','c5','cta']},
    '20':{'m':U+'c7c0e382-____________3.mp3','vp':'/home/user/nvs/mitsi-ads/audio/missed-mix.wav','v':'','tail':1.6,'cuts':[0,5.5,9.2,11.6,17.9,21.85,28.5,35.4,38.8,41.0],'ids':['mm1','mm2','mm3','mm4','mm5','mm6','mm7','mm8','mm9','mm10']},
    '4':{'m':U+'4cf73a77-____________2.mp3','v':'b8cce7dd-______4.mp3','cuts':[0,4.08,8.18,10.4,15.25,19.0],'ids':['d1','d2','d3','d4','d5','cta']}}
out={}
for k,a in AD.items():
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',a.get('vp',U+a['v'])]))
    END=round(d+a.get('tail',TAIL),2);c=a['cuts']
    seg=[[c[i],c[i+1] if i+1<len(c) else END,a['ids'][i]] for i in range(len(c))]
    out[k]={'seg':seg,'total':END}
    n=len(c)-1
    if len(sys.argv)>1 and k not in sys.argv[1:]:continue
    f=[f"[0:a]loudnorm=I=-15:TP=-1.5,aresample=48000,apad=whole_dur={END}[voice]",
       f"[1:a]atrim=0:{END},asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I=-29:TP=-3,afade=t=in:d=0.5,afade=t=out:st={END-2.5}:d=2.5[mus]",
       f"[2:a]asplit={n}"+''.join(f'[ws{i}]' for i in range(n))]
    wh=[]
    for i in range(n):
        dl=int(max(0,(c[i+1]-0.3))*1000);f.append(f"[ws{i}]aresample=48000,volume=0.35,adelay={dl}|{dl},apad=whole_dur={END}[w{i}]");wh.append(f'[w{i}]')
    f.append(f"[voice][mus]{''.join(wh)}amix=inputs={2+n}:normalize=0:duration=longest,atrim=0:{END}[out]")
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',a.get('vp',U+a['v']),'-i',a.get('m',MUS),'-i',A+'whoosh.wav','-filter_complex',';'.join(f),'-map','[out]','-c:a','aac','-b:a','192k',A+f'audio{k}.m4a'],check=True)
s=open('ads.tpl.html').read()
s=s.replace('/*MOUTH20*/[]/*/MOUTH20*/',open(A+'../cat/mouth20.json').read()).replace('/*CATJS*/',open('cat.js').read()).replace('/*MOUTH*/[]/*/MOUTH*/',open(A+'../cat/mouth.json').read())
s=s.replace('/*ADS*/{}/*/ADS*/','/*ADS*/'+json.dumps(out)+'/*/ADS*/')
s=s.replace('<!--LOGO-->',open(A+'logo_svg.txt').read().replace('viewBox="0 0 1600 600"','viewBox="200 40 1500 520"'))
import os
if os.path.isdir(A+'clips/pres'):
    s=s.replace("/*PRESDIR*/'conf'/*/PRESDIR*/","'pres'").replace('/*PRESN*/240/*/PRESN*/',str(len(os.listdir(A+'clips/pres'))))
open(A+'ads.html','w').write(s);json.dump(out,open('timeline.json','w'));print(json.dumps(out))
