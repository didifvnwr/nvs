import json,subprocess,glob
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
V=glob.glob(U+'57670dd1-*')[0];M=glob.glob(U+'48a25b0e-*')[0]
# scene starts in the edited recording (found from the pauses and by matching with earlier recordings)
S=[('a1',0.0),('a2',5.04),('a3',13.05),('a4',17.37),('a5',21.9),('a6',24.94),('a7',30.7),
   ('f1',34.64),('f2',43.88),('f3',53.63),('f4',61.5),('f5',73.6),('f6',80.11),('f7',88.51),('f8',95.2),('f9',103.36)]
END=109.17;TOTAL=round(END+6.5,2)
seg=[]
for i,(sc,st) in enumerate(S):
    a=0 if i==0 else round(st-0.05,3)
    b=round(S[i+1][1]-0.05,3) if i+1<len(S) else TOTAL
    seg.append([a,b,sc])
des={'a1':5,'a2':8,'a3':4.5,'a4':5,'a5':4,'a6':6,'a7':5,'f1':7,'f2':7,'f3':6,'f4':8,'f5':7,'f6':8,'f7':6,'f8':7,'f9':11}
json.dump(dict(seg=seg,total=TOTAL,des=des),open('show_timeline.json','w'))
print(seg,TOTAL)
cuts=[s[0] for s in seg[1:]]
args=['ffmpeg','-v','error','-y','-i',V,'-i',M]+sum([['-i','whoosh.wav'] for _ in cuts],[])
f=[f"[0:a]aresample=44100,apad=whole_dur={TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[voice]",
   f"[1:a]atrim=0:{TOTAL},asetpts=N/SR/TB,volume=0.13,afade=t=in:d=1.2,afade=t=out:st={TOTAL-4:.2f}:d=4[m]"]
lb=['[voice]','[m]']
for i,c in enumerate(cuts):
    ms=max(0,int((c-0.2)*1000));f.append(f"[{i+2}:a]volume=0.3,adelay={ms}|{ms}[w{i}]");lb.append(f'[w{i}]')
f.append(''.join(lb)+f"amix=inputs={len(lb)}:duration=first:normalize=0,alimiter=limit=0.95[a]")
subprocess.run(args+['-filter_complex',';'.join(f),'-map','[a]','-t',str(TOTAL),'-c:a','aac','-b:a','192k','audio_show.m4a'],check=True)
print('audio ok')
