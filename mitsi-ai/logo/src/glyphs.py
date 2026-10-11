import sys,json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
def run(font,text,size,track=0):
    f=TTFont(font);gs=f.getGlyphSet();cmap=f.getBestCmap();upm=f['head'].unitsPerEm;s=size/upm
    x=0;out=[]
    for ch in text:
        g=cmap[ord(ch)];gl=gs[g]
        p=SVGPathPen(gs);tp=TransformPen(p,(s,0,0,-s,x,0));gl.draw(tp)
        bp=BoundsPen(gs);gl.draw(bp);b=bp.bounds
        out.append({'ch':ch,'d':p.getCommands(),'x':x,'w':gl.width*s,'b':[v*s for v in b] if b else None})
        x+=gl.width*s+track
    return {'glyphs':out,'width':x-track}
font,text,size,track=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4])
print(json.dumps(run(font,text,size,track)))
