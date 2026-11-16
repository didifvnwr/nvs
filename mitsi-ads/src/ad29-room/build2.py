# v2: no ginger, Mitsi = Omer (studio cat), IVR = Dana, final chorus with "מִיצִי"
import json, subprocess
dur = lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
seq=[('01_danit_a',.3,'danit'),('02_tomer_a',.4,'tomer'),('chorus_0',.15,'chorus'),('04_itai_a',.35,'itai'),('chorus_1',.15,'chorus'),
     ('06_tamar_a',.35,'tamar'),('chorus_2',.15,'chorus'),('08_homeless_a',.35,'homeless'),('chorus_3',.15,'chorus'),
     ('n_m1',.5,'mitsi'),('dial',.2,'dial'),('n_i1',.15,'ivr'),('n_m2',.4,'mitsi'),('n_c5',.35,'chorus')]
t=0;tl=[]
for f,g,w in seq:
    st=t+g;d=dur(f+'.wav');tl.append((f,w,round(st,3),round(d,3)));t=st+d
END=round(t+7.2,2)
T={f:(s,d) for f,w,s,d in tl}
chips=[round(T['n_m2'][0]+c,3) for c in (2.70,4.94,6.18,8.02,9.84)]
endcard=round(T['n_c5'][0]+T['n_c5'][1]+.35,3)
fx=[('blip',c,.18) for c in chips]+[('whoosh',endcard-.15,.35)]
ins=[];fl=[];n=0
for f,w,s,d in tl:
    ins+=['-i',f+'.wav'];ms=int(s*1000);vol='volume=0.35,' if f=='dial' else '';fl.append(f'[{n}]{vol}aresample=44100,adelay={ms}|{ms}[a{n}]');n+=1
for f,s,v in fx:
    ins+=['-i',('blip.wav' if f=='blip' else '/home/user/nvs-studio/mitsi-ads/studio/whoosh.wav')];ms=int(s*1000);fl.append(f'[{n}]volume={v},aresample=44100,adelay={ms}|{ms}[a{n}]');n+=1
fl.append(''.join(f'[a{i}]' for i in range(n))+f'amix=inputs={n}:normalize=0:duration=longest,apad=whole_dur={END}[o]')
subprocess.run(['ffmpeg','-y','-loglevel','error']+ins+['-filter_complex',';'.join(fl),'-map','[o]','-ac','1','voice2.wav'],check=True)
# blues bed like the studio ads
M='/home/user/nvs-studio/mitsi-ads/audio/music/blues-3.mp3'
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','voice2.wav','-i',M,'-filter_complex',f'[0:a]loudnorm=I=-15:TP=-1.5,aresample=48000,apad=whole_dur={END}[v];[1:a]atrim=0:{END},asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I=-29:TP=-3,afade=t=in:d=0.5,afade=t=out:st={END-2.5}:d=2.5[m];[v][m]amix=inputs=2:normalize=0:duration=longest,atrim=0:{END}[o]','-map','[o]','-ac','2','final_audio2.wav'],check=True)
# 30fps envelopes
segs=[]
for f,w,s,d in tl:
    raw=subprocess.check_output(['ffmpeg','-loglevel','error','-i',f+'.wav','-ac','1','-ar','16000','-f','s16le','-'])
    import array;a=array.array('h',raw);per=16000//30;env=[]
    for i in range(0,len(a),per):
        c=a[i:i+per];env.append((sum(x*x for x in c)/max(1,len(c)))**.5/32768)
    mx=max(env) or 1;segs.append({'file':f,'who':w,'start':s,'dur':d,'env':[round(min(1,v/mx*1.3),3) for v in env]})
json.dump({'segs':segs,'end':END,'chips':chips,'endcard':endcard},open('/home/user/mitsi-29/render/data2.json','w'))
for f,w,s,d in tl:print(f,w,s,round(s+d,2))
print('end',END,'endcard',endcard)
