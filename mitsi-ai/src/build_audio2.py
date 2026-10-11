import json,subprocess,glob
U='/root/.claude/uploads/0f9540b5-d01e-533c-b68d-1d5a2bac763f/'
V=glob.glob(U+'c84780c3-*')[0];M=glob.glob(U+'bb7d09d7-*')[0]
W='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/show/whoosh.wav'
# scene cuts aligned to pauses in Omer's read (lines 1-2 | 3-4 | 5-6 | 7-8 | 9 | 10-11 | 12-14 | 15 | 16-17 | 18)
CUT=[0,8.25,17.05,22.40,30.12,34.20,40.03,48.12,51.95,58.70];END=66.7
ids=['s%d'%(i+1) for i in range(10)]
seg=[[CUT[i],CUT[i+1] if i<9 else END,ids[i]] for i in range(10)]
f=[f"[0:a]loudnorm=I=-16:TP=-1.5,aresample=48000,apad=whole_dur={END}[voice]",
   f"[1:a]atrim=0:{END},asetpts=PTS-STARTPTS,aresample=48000,volume=0.2,afade=t=in:d=0.8,afade=t=out:st={END-3.5}:d=3.5[mus]"]
wh=[];f.append(f"[2:a]asplit=9"+''.join(f'[ws{i}]' for i in range(1,10)))
for i in range(1,10):
    d=int((CUT[i]-0.18)*1000);f.append(f"[ws{i}]aresample=48000,volume=0.26,adelay={d}|{d},apad=whole_dur={END}[w{i}]");wh.append(f'[w{i}]')
f.append(f"[voice][mus]{''.join(wh)}amix=inputs={2+len(wh)}:normalize=0:duration=longest,atrim=0:{END}[out]")
out='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/maih/audio2.m4a'
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',V,'-i',M,'-i',W,'-filter_complex',';'.join(f),'-map','[out]','-c:a','aac','-b:a','192k',out],check=True)
json.dump({'seg':seg,'total':END},open('timeline2.json','w'));print(seg)
