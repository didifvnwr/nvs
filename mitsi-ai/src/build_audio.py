import json,subprocess,glob
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
V=glob.glob(U+'76837ab5-*')[0];M=glob.glob(U+'507538f2-*')[0]
W='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/show/whoosh.wav'
TEMPO=0.94
# paragraph cuts in the original recording (seconds)
P=[(0,2.07),(2.64,5.66),(6.14,9.92),(10.33,14.92),(15.31,17.26),(17.72,20.17),(20.30,24.45),(24.63,25.85),(26.32,27.20),(27.57,29.46)]
DUR=[5,8,7.5,8,6.5,6.5,7.5,6,5,9]; LEAD=[.6,.4,.4,.4,.4,.4,.4,.4,.4,.5]
ids=['s%d'%(i+1) for i in range(10)]
st=[0];[st.append(st[-1]+d) for d in DUR[:-1]]
total=round(sum(DUR),2)
seg=[[round(st[i],2),round(st[i]+DUR[i],2),ids[i]] for i in range(10)]
f=[];ins=['-i',V,'-i',M,'-i',W];mix=[]
for i,(a,b) in enumerate(P):
    a2=max(0,a-.05);b2=b+.08
    d=int((st[i]+LEAD[i])*1000)
    f.append(f"[0:a]atrim={a2}:{b2},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={(b2-a2)-0.04}:d=0.04,atempo={TEMPO},adelay={d}|{d}[v{i}]");mix.append(f'[v{i}]')
f.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0,loudnorm=I=-16:TP=-1.5[voice]")
f.append(f"[1:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume=0.14,afade=t=in:d=1.0,afade=t=out:st={total-4}:d=4[mus]")
wh=[]
for i in range(1,10):
    d=int((st[i]-0.2)*1000);f.append(f"[2:a]volume=0.28,adelay={d}|{d}[w{i}]");wh.append(f'[w{i}]')
f.append(f"[voice][mus]{''.join(wh)}amix=inputs={2+len(wh)}:normalize=0,atrim=0:{total}[out]")
out='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/maih/audio.m4a'
subprocess.run(['ffmpeg','-y','-loglevel','error',*ins,'-filter_complex',';'.join(f),'-map','[out]','-c:a','aac','-b:a','192k',out],check=True)
json.dump({'seg':seg,'total':total},open('timeline.json','w'))
print(json.dumps({'seg':seg,'total':total}))
