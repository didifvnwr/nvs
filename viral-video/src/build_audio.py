import subprocess, json, glob
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
A=glob.glob(U+'4a79796a-*')[0];G=glob.glob(U+'9bfbe179-*')[0];C=glob.glob(U+'47fe2901-*')[0]
M=glob.glob(U+'2248a5a4-*')[0]
clips=[ # id, file, start, end, scene, gap_before
 ('P1',A,0.0,3.18,'s1',0.3),('P2',A,3.18,8.2,'s2',0.25),('P3',A,8.2,12.5,'s3',0.25),('P4',A,12.5,18.4,'s4',0.25),
 ('C1',C,0.0,3.6,'sd',0.45),('G1',G,0.1,5.83,'sd',0.12),('C2',C,3.6,6.25,'sd',0.12),('G2',G,5.83,9.9,'sd',0.12),('C3',C,6.25,7.97,'sd',0.12),('G3',G,9.9,15.57,'sd',0.12),
 ('P5',A,18.4,22.83,'s5',0.45),('P6',A,22.83,30.0,'s6',0.25),('P7',A,30.25,33.65,'s7',0.25)]
t=0.0;tl=[]
for cid,f,a,b,sc,gap in clips:
    t+=gap;d=b-a;tl.append(dict(id=cid,file=f,a=a,b=b,scene=sc,start=round(t,3),dur=round(d,3)));t+=d
END=t
scenes={}
for c in tl:
    scenes.setdefault(c['scene'],[c['start'],c['start']+c['dur']])
    scenes[c['scene']][1]=c['start']+c['dur']
order=['s1','s2','s3','s4','sd','s5','s6','s7']
starts={};prev_end=0
for i,s in enumerate(order):
    st=0 if i==0 else max(scenes[s][0]-0.15, prev_end)
    starts[s]=round(st,3);prev_end=scenes[s][1]
TOTAL=round(END+5.5,2)
seg=[[starts[s],(starts[order[i+1]] if i+1<len(order) else TOTAL),s] for i,s in enumerate(order)]
json.dump(dict(seg=seg,total=TOTAL,lines=[{k:c[k] for k in ('id','start','dur','scene')} for c in tl]),open('timeline.json','w'),indent=1)
print(seg,TOTAL)
# voice mix
inputs=[];filt=[];labels=[]
for i,c in enumerate(tl):
    inputs+=['-i',c['file']]
    ms=int(c['start']*1000)
    filt.append(f"[{i}:a]aresample=44100,atrim={c['a']}:{c['b']},asetpts=N/SR/TB,afade=t=in:d=0.02,afade=t=out:st={max(0,c['b']-c['a']-0.04):.2f}:d=0.04,adelay={ms}|{ms}[v{i}]")
    labels.append(f'[v{i}]')
filt.append(''.join(labels)+f"amix=inputs={len(tl)}:duration=longest:normalize=0,apad=whole_dur={TOTAL}[voice]")
subprocess.run(['ffmpeg','-v','error','-y']+inputs+['-filter_complex',';'.join(filt),'-map','[voice]','-t',str(TOTAL),'voice.wav'],check=True)
# sfx positions
st=starts
sfx=[('ring.wav',0.3),('ding.wav',st['s2']+2.4),('ding.wav',st['s3']+1.8),('ding.wav',st['s4']+1.2),('ding.wav',st['s4']+3.4)]
sfx+=[('cash.wav',st['s5']+0.9+k*1.2) for k in range(4)]+[('chime.wav',st['s6']+0.9)]
args=['-i','voice.wav','-i',M]+sum([['-i',f] for f,_ in sfx],[])
f2=[f"[1:a]atrim=20:{20+TOTAL},asetpts=N/SR/TB,volume=0.5,afade=t=in:d=1,afade=t=out:st={TOTAL-4:.2f}:d=4[m]","[0:a]asplit[v1][v2]","[m][v1]sidechaincompress=threshold=0.04:ratio=4:attack=30:release=700[md]"]
lab=['[md]','[v2]']
for i,(f,s) in enumerate(sfx):
    ms=int(s*1000);f2.append(f"[{i+2}:a]volume=0.8,adelay={ms}|{ms}[x{i}]");lab.append(f'[x{i}]')
f2.append(''.join(lab)+f"amix=inputs={len(lab)}:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
subprocess.run(['ffmpeg','-v','error','-y']+args+['-filter_complex',';'.join(f2),'-map','[a]','-t',str(TOTAL),'-c:a','aac','-b:a','192k','reel_audio.m4a'],check=True)
print('audio ok')
