import json,subprocess,glob
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
F=glob.glob(U+'f0968782-*')[0];M=glob.glob(U+'48a25b0e-*')[0]
A=[('a1',5.0),('a2',8.0),('a3',6.0),('a4',8.0),('a5',7.0),('a6',7.0),('a7',7.0)]   # estimated until part A is recorded
B=[('f1','P2',3.67,12.93),('f2','P3',12.93,22.65),('f3','P4',22.65,30.47),('f4','G',65.88,78.45),('f5','P5',30.47,36.74),('f6','P6',36.74,45.13),('f7','P7',45.13,51.9),('f8','P8',51.9,60.02),('f9','P9',60.02,65.88)]
GAP=0.16;t=0.3;seg=[];clips=[]
for sc,d in A:
    seg.append([round(t-0.05 if seg else 0,3),None,sc]);t+=d
for sc,cid,a,b in B:
    seg.append([round(t-0.05,3),None,sc]);clips.append((sc,a,b,t));t+=b-a+GAP
TOTAL=round(t+6.5,2)
for i in range(len(seg)-1):seg[i][1]=seg[i+1][0]
seg[-1][1]=TOTAL
des={'a1':5,'a2':8,'a3':6,'a4':8,'a5':7,'a6':7,'a7':7,'f1':7,'f2':7,'f3':6,'f4':8,'f5':7,'f6':8,'f7':6,'f8':7,'f9':11}
json.dump(dict(seg=seg,total=TOTAL,des=des),open('show_timeline.json','w'))
print(seg,TOTAL)
inputs=[];filt=[];lab=[]
for i,(sc,a,b,st) in enumerate(clips):
    inputs+=['-i',F];ms=int(st*1000);d=b-a
    filt.append(f"[{i}:a]aresample=44100,atrim={a}:{b},asetpts=N/SR/TB,afade=t=in:d=0.015,afade=t=out:st={d-0.03:.3f}:d=0.03,adelay={ms}|{ms}[v{i}]");lab.append(f'[v{i}]')
filt.append(''.join(lab)+f"amix=inputs={len(clips)}:duration=longest:normalize=0,apad=whole_dur={TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[voice]")
subprocess.run(['ffmpeg','-v','error','-y']+inputs+['-filter_complex',';'.join(filt),'-map','[voice]','-t',str(TOTAL),'voice_B.wav'],check=True)
cuts=[s[0] for s in seg[1:]]
args=['ffmpeg','-v','error','-y','-i','voice_B.wav','-i',M]+sum([['-i','whoosh.wav'] for _ in cuts],[])
f=[f"[1:a]atrim=0:{TOTAL},asetpts=N/SR/TB,volume=0.13,afade=t=in:d=1.2,afade=t=out:st={TOTAL-4:.2f}:d=4[m]"]
lb=['[0:a]','[m]']
for i,c in enumerate(cuts):
    ms=max(0,int((c-0.2)*1000));f.append(f"[{i+2}:a]volume=0.35,adelay={ms}|{ms}[w{i}]");lb.append(f'[w{i}]')
f.append(''.join(lb)+f"amix=inputs={len(lb)}:duration=first:normalize=0,alimiter=limit=0.95[a]")
subprocess.run(args+['-filter_complex',';'.join(f),'-map','[a]','-t',str(TOTAL),'-c:a','aac','-b:a','192k','audio_show.m4a'],check=True)
print('audio ok')
