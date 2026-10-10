import numpy as np,wave
sr=44100;D=79;n=sr*D;t=np.arange(n)/sr;L=np.zeros(n);R=np.zeros(n)
rng=np.random.default_rng(3)
def f(m):return 440*2**((m-69)/12)
chords=[[57,60,64,67],[53,57,60,64],[48,55,60,64],[55,59,62,67]]  # Am7 Fmaj7 C(add) G
CL=9.75
def note(freq,st,dur,amp,att=2.5,rel=3,pan=.5):
    i0=int(st*sr);ln=int((dur+rel)*sr);tt=np.arange(ln)/sr
    env=np.minimum(1,tt/att)*np.where(tt>dur,np.exp(-(tt-dur)/(rel/3)),1)
    w=sum(np.sin(2*np.pi*freq*(1+d)*tt+rng.uniform(0,6))*a for d,a in[(0,1),(.002,.6),(-.002,.6)])+.25*np.sin(2*np.pi*freq*2*tt)
    w*=env*amp;e=min(n,i0+ln)
    L[i0:e]+=w[:e-i0]*(1-pan);R[i0:e]+=w[:e-i0]*pan
for k in range(8):
    ch=chords[k%4];st=k*CL
    note(f(ch[0]-12),st,CL,.05,pan=.5)
    for j,m in enumerate(ch[1:]):note(f(m),st,CL,.035,pan=.3+.2*j)
# bell arpeggio
for k in range(8):
    ch=chords[k%4]
    for j in range(5):
        st=k*CL+1+j*1.8;m=ch[(j*2)%4]+12+(12 if j%2 else 0);i0=int(st*sr);ln=int(3*sr);tt=np.arange(ln)/sr
        w=np.sin(2*np.pi*f(m)*tt)*np.exp(-tt*1.6)*.05+np.sin(2*np.pi*f(m)*2.0*tt)*np.exp(-tt*3)*.015
        e=min(n,i0+ln);p=rng.uniform(.25,.75);L[i0:e]+=w[:e-i0]*(1-p);R[i0:e]+=w[:e-i0]*p
# soft heartbeat
for b in np.arange(0.5,D-1,1.1):
    for off,a in((0,.09),(.28,.06)):
        i0=int((b+off)*sr);ln=int(.25*sr);tt=np.arange(ln)/sr;w=np.sin(2*np.pi*(55-40*tt)*tt)*np.exp(-tt*18)*a;e=min(n,i0+ln);L[i0:e]+=w[:e-i0];R[i0:e]+=w[:e-i0]
fade=np.minimum(1,t/3)*np.minimum(1,(D-t)/4)
m=np.stack([L*fade,R*fade],1);m/=np.abs(m).max()*1.15
w=wave.open('music.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((m*32767).astype('<i2').tobytes());w.close()
