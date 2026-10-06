import subprocess, json, glob
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
F=glob.glob(U+'f0968782-*')[0];M=glob.glob(U+'48a25b0e-*')[0]
# order for the video; cut points are mid-gap positions in the recording
CL=[('f0','P1',0.0,3.67),('f1','P2',3.67,12.93),('f2','P3',12.93,20.93),('f3','P4',20.93,30.47),
    ('f4','G',66.72,78.45),
    ('f5','P5',30.47,36.74),('f6','P6',36.74,45.13),('f7','P7',45.13,51.9),('f8','P8',51.9,60.02),('f9','P9',60.02,66.72)]
GAP=0.16;t=0.25;tl=[]
for sc,cid,a,b in CL:
    tl.append(dict(scene=sc,id=cid,a=a,b=b,start=round(t,3),dur=round(b-a,3)));t+=b-a+GAP
END=t;TOTAL=round(END+6.5,2)
starts={c['scene']:c['start'] for c in tl}
scs=[c['scene'] for c in tl]
seg=[]
for i,s in enumerate(scs):
    st=0 if i==0 else round(starts[s]-0.05,3)
    en=round(starts[scs[i+1]]-0.05,3) if i+1<len(scs) else TOTAL
    seg.append([st,en,s])
G=[c for c in tl if c['id']=='G'][0]
json.dump(dict(seg=seg,total=TOTAL,gstart=G['start'],g2=G['start']+(73.23-66.89)),open('timeline.json','w'))
print(seg,TOTAL)
inputs=[];filt=[];lab=[]
for i,c in enumerate(tl):
    inputs+=['-i',F];ms=int(c['start']*1000)
    filt.append(f"[{i}:a]aresample=44100,atrim={c['a']}:{c['b']},asetpts=N/SR/TB,afade=t=in:d=0.015,afade=t=out:st={c['dur']-0.03:.3f}:d=0.03,adelay={ms}|{ms}[v{i}]");lab.append(f'[v{i}]')
filt.append(''.join(lab)+f"amix=inputs={len(tl)}:duration=longest:normalize=0,apad=whole_dur={TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[voice]")
subprocess.run(['ffmpeg','-v','error','-y']+inputs+['-filter_complex',';'.join(filt),'-map','[voice]','-t',str(TOTAL),'voice.wav'],check=True)
cuts=[s[0] for s in seg[1:]]
args=['ffmpeg','-v','error','-y','-i','voice.wav','-i',M]+sum([['-i','whoosh.wav'] for _ in cuts],[])
f=[f"[1:a]atrim=0:{TOTAL},asetpts=N/SR/TB,volume=0.13,afade=t=in:d=1.2,afade=t=out:st={TOTAL-4:.2f}:d=4[m]"]
lb=['[0:a]','[m]']
for i,c in enumerate(cuts):
    ms=max(0,int((c-0.2)*1000));f.append(f"[{i+2}:a]volume=0.35,adelay={ms}|{ms}[w{i}]");lb.append(f'[w{i}]')
f.append(''.join(lb)+f"amix=inputs={len(lb)}:duration=first:normalize=0,alimiter=limit=0.95[a]")
subprocess.run(args+['-filter_complex',';'.join(f),'-map','[a]','-t',str(TOTAL),'-c:a','aac','-b:a','192k','audio_final.m4a'],check=True)
print('audio ok')
