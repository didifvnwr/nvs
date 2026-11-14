import json,math,subprocess,os,sys
F='/home/user/nvs/mitsi-ai/src/fonts'
def G(font,text,size,track):
    return json.loads(subprocess.check_output(['python3','glyphs.py',font,text,str(size),str(track)]))
WM=G(F+'/heebo-800.ttf','mitsi.ai',200,-4)
TG=G(F+'/orbitron-700.ttf','TELEPHONY FOR AGENTS',27,7)

HEAD="M120,214 C70,214 42,186 42,146 C42,122 50,104 58,94 L62,40 L102,70 C108,68 114,67 120,67 C126,67 132,68 138,70 L178,40 L182,94 C190,104 198,122 198,146 C198,186 170,214 120,214 Z"
def arc(cx,cy,r,a0,a1):
    p=lambda a:(cx+r*math.cos(math.radians(a)),cy+r*math.sin(math.radians(a)))
    x0,y0=p(a0);x1,y1=p(a1)
    return f"M{x0:.1f},{y0:.1f} A{r},{r} 0 0 1 {x1:.1f},{y1:.1f}"
ARCS=[arc(192,58,r,-80,-10) for r in (26,46,66)]
def sparkle(cx,cy,r):
    k=r*0.16
    return (f"M{cx},{cy-r} C{cx+k},{cy-k} {cx+k},{cy-k} {cx+r},{cy} C{cx+k},{cy+k} {cx+k},{cy+k} {cx},{cy+r} "
            f"C{cx-k},{cy+k} {cx-k},{cy+k} {cx-r},{cy} C{cx-k},{cy-k} {cx-k},{cy-k} {cx},{cy-r} Z")
BARS=[(-28,10),(-14,18),(0,26),(14,18),(28,10)]  # x offset, half height (mouth waveform)

def build(theme='dark',layout='h',icon_only=False,static=False):
    ink='#ffffff' if theme=='dark' else '#0b1e3f'
    sub='#8fdcff' if theme=='dark' else '#3a5a86'
    glass_op='.16' if theme=='dark' else '.10'
    WX,BY=292,176   # wordmark x, baseline
    if layout=='v':
        sc=0.62;WX=(240-WM['width']*sc)/2/sc;BY=170
    parts=[]
    # icon
    icon=f'''<g class="icon">
 <path class="head-fill" d="{HEAD}" fill="url(#gFill)"/>
 <path class="head" d="{HEAD}" pathLength="1" fill="none" stroke="url(#gStroke)" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>
 <g class="eyes"><rect class="eye" x="84" y="124" width="16" height="34" rx="8" fill="url(#gEye)"/><rect class="eye" x="140" y="124" width="16" height="34" rx="8" fill="url(#gEye)"/></g>
 <g class="mouth">{''.join(f'<rect class="bar" style="--i:{i}" x="{120+dx-3.5}" y="{186-h/2}" width="7" height="{h}" rx="3.5" fill="url(#gStroke)"/>' for i,(dx,h) in enumerate([(dx,h) for dx,h in [(-24,8),(-12,16),(0,24),(12,16),(24,8)]]))}</g>
 <g class="arcs" fill="none" stroke="url(#gStroke)" stroke-width="10" stroke-linecap="round">{''.join(f'<path class="arc" style="--i:{i}" d="{d}"/>' for i,d in enumerate(ARCS))}</g>
</g>'''
    if icon_only:
        vb='-10 -40 300 290';body=icon
    else:
        gl=[]
        for i,g in enumerate(WM['glyphs']):
            if g['ch']=='.':
                cx=g['x']+g['w']/2;gl.append(f'<path class="spark" d="{sparkle(round(cx,1),-24,27)}" fill="url(#gAi)"/>');continue
            fill=ink if i<5 else 'url(#gAi)'
            gl.append(f'<path class="ch" style="--i:{i}" d="{g["d"]}" fill="{fill}"/>')
        tag=''.join(f'<path d="{g["d"]}"/>' for g in TG['glyphs'] if g['d'])
        word=f'<g transform="translate({WX:.1f} {BY})"><g class="word">{"".join(gl)}</g></g><g transform="translate({WX+4:.1f} {BY+56})"><g class="tag" fill="{sub}">{tag}</g></g>'
        if layout=='h':
            vb=f'-20 -40 {WX+WM["width"]+40:.0f} 300';body=icon+word
        else:
            body=icon+f'<g transform="translate(0 300) scale(.62)">{word}</g>'
            vb='-110 -50 460 520'
    css='' if static else CSS
    defs=f'''<defs>
<linearGradient id="gStroke" x1="40" y1="40" x2="200" y2="215" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6ff3ff"/><stop offset=".55" stop-color="#3d8bff"/><stop offset="1" stop-color="#8a5cff"/></linearGradient>
<linearGradient id="gFill" x1="0" y1="40" x2="0" y2="215" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6ff3ff" stop-opacity="{glass_op}"/><stop offset="1" stop-color="#8a5cff" stop-opacity="{glass_op}"/></linearGradient>
<linearGradient id="gEye" x1="0" y1="124" x2="0" y2="158" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d9fbff"/><stop offset="1" stop-color="#3de1ff"/></linearGradient>
<linearGradient id="gAi" x1="430" y1="0" x2="660" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6ff3ff"/><stop offset=".5" stop-color="#3d8bff"/><stop offset="1" stop-color="#8a5cff"/></linearGradient>
</defs>'''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="mitsi.ai">{defs}<style>{css}</style>{body}</svg>'

CSS='''
.eye,.bar,.arc,.ch,.spark{transform-box:fill-box}
.head{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s cubic-bezier(.6,0,.2,1) .1s forwards}
.head-fill{opacity:0;animation:fade .6s ease-out .9s forwards}
.eye{transform-origin:center;transform:scaleY(0);animation:open .3s cubic-bezier(.3,1.6,.5,1) 1.15s forwards,blink 4.2s ease-in-out 4.2s infinite}
.bar{transform-origin:center;transform:scaleY(0);animation:grow .35s cubic-bezier(.3,1.5,.5,1) calc(1.35s + var(--i)*.06s) forwards,talk 1.1s ease-in-out calc(2.4s + var(--i)*.13s) infinite alternate}
.arc{opacity:0;animation:ping .45s ease-out calc(1.55s + var(--i)*.13s) forwards,pulse 2.6s ease-in-out calc(3.2s + var(--i)*.2s) infinite}
.ch{opacity:0;transform:translateY(34px);animation:rise .55s cubic-bezier(.2,.9,.3,1) calc(1.45s + var(--i)*.06s) forwards}
.spark{transform-origin:center;transform:scale(0) rotate(-90deg);animation:pop .6s cubic-bezier(.3,1.7,.5,1) 2.0s forwards,twinkle 3s ease-in-out 3.2s infinite}
.tag{opacity:0;animation:fade .7s ease-out 2.3s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes fade{to{opacity:1}}
@keyframes open{to{transform:scaleY(1)}}
@keyframes blink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.1)}}
@keyframes grow{to{transform:scaleY(1)}}
@keyframes talk{0%{transform:scaleY(1)}50%{transform:scaleY(.45)}100%{transform:scaleY(1.25)}}
@keyframes ping{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes rise{to{opacity:1;transform:translateY(0)}}
@keyframes pop{to{transform:scale(1) rotate(0)}}
@keyframes twinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.18) rotate(45deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}}
'''
out='..'
for theme in ('dark','light'):
    sfx='' if theme=='dark' else '-light'
    for layout,name in (('h','logo'),('v','logo-stacked')):
        open(f'{out}/mitsi-ai-{name}-animated{sfx}.svg','w').write(build(theme,layout))
        open(f'{out}/mitsi-ai-{name}{sfx}.svg','w').write(build(theme,layout,static=True))
open(f'{out}/mitsi-ai-icon-animated.svg','w').write(build('dark','h',icon_only=True))
open(f'{out}/mitsi-ai-icon.svg','w').write(build('dark','h',icon_only=True,static=True))
