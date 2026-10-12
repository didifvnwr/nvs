import subprocess,os,json
from concurrent.futures import ThreadPoolExecutor
os.chdir(os.path.dirname(os.path.abspath(__file__)))
tl=json.load(open('tl.json'));S=lambda i:tl['PH'][i][1];T=tl['TOTAL']
b=[0,S(1),S(5),S(7),S(9),S(11),S(14),T]
d=[b[i+1]-b[i] for i in range(7)]
rows=[('v4',0,d[0]),('v10',0,8.0),('v11',8,d[1]-8.0),('v12',0,d[2]),('v7',4,d[3]),('v8',3,d[4]),('v2',0,7.0),('v1',15,d[5]-7.0),('v3',0,d[6])]
def dur(p):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
def job(a):
    n,(s,ss,dd)=a;f=max(1.0,dd/(dur(f'src/{s}.mp4')-ss-0.05));u=dd/f
    vf=(f"tpad=stop_duration=3:stop_mode=clone,trim=duration={u},setpts=(PTS-STARTPTS)*{f},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,trim=duration={dd},setpts=PTS-STARTPTS,setsar=1,eq=brightness=-0.1:saturation=0.9,fade=t=in:st=0:d=0.2,fade=t=out:st={dd-0.2}:d=0.2,format=yuv420p")
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(ss),'-i',f'src/{s}.mp4','-an','-vf',vf,'-c:v','libx264','-preset','fast','-crf','18',f'seg/{n:02d}.mp4'],check=True)
with ThreadPoolExecutor(4) as ex:list(ex.map(job,enumerate(rows,1)))
open('list.txt','w').write(''.join(f"file '{os.getcwd()}/seg/{i:02d}.mp4'\n" for i in range(1,len(rows)+1)))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','list.txt','-c','copy','bg.mp4'],check=True)
print(dur('bg.mp4'))
