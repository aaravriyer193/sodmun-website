import os
from PIL import Image, ImageDraw, ImageFont
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
OUT=S+'assets/og/'; os.makedirs(OUT, exist_ok=True)
F=os.path.dirname(os.path.abspath(__file__))+'/fonts/'
reg=lambda s: ImageFont.truetype(F+'Newsreader-Regular.ttf', s)
ital=lambda s: ImageFont.truetype(F+'Newsreader-Italic.ttf', s)
med=lambda s: ImageFont.truetype(F+'Newsreader-Medium.ttf', s)
INK=(35,31,44); PAPER=(248,249,250); GREENS=(143,174,157); PURPS=(167,155,192); STONE=(173,181,189)
logoA=Image.open(S+'assets/brand/logo.png').getchannel('A')

def card(name, line1, line2, kicker, photo=None, tint='purple'):
    W,H=1200,630
    im=Image.new('RGB',(W,H),INK)
    if photo:
        ph=Image.open(S+photo).convert('RGB')
        r=max(W/ph.width, H/ph.height); ph=ph.resize((int(ph.width*r),int(ph.height*r)))
        ph=ph.crop((0,0,W,H))
        im=Image.blend(im, ph, 0.22)
    # tint wash
    wash=Image.new('RGB',(W,H),(60,48,86) if tint=='purple' else (34,58,46))
    im=Image.blend(im, wash, 0.14)
    d=ImageDraw.Draw(im)
    # logo
    a=logoA.resize((86,86)); im.paste(Image.new('RGB',a.size,PAPER),(72,62),a)
    d.text((176,76), 'SODMUN', font=med(40), fill=PAPER)
    # kicker
    d.text((74,206), kicker.upper(), font=med(22), fill=GREENS if tint=='green' else PURPS)
    # title
    y=250
    d.text((70,y), line1, font=reg(96), fill=PAPER)
    if line2: d.text((70,y+104), line2, font=ital(96), fill=PURPS if tint=='purple' else GREENS)
    # footer rule + line
    d.line([(74,540),(1126,540)], fill=(90,92,104), width=1)
    d.text((74,560), 'Summit of Diplomacy Model United Nations', font=reg(28), fill=STONE)
    tw=d.textlength('Dubai, UAE', font=reg(28))
    d.text((1126-tw,560), 'Dubai, UAE', font=reg(28), fill=STONE)
    im.save(OUT+name+'.jpg', quality=88, optimize=True, progressive=True)

card('home','Summit of','Diplomacy','The largest teen-led MUN in the world', 'assets/photos/committee-room.jpg','purple')
card('about','By MUNers,','for MUNers.','About SODMUN','assets/photos/atrium.jpg','green')
card('secretariat','The people','behind SODMUN.','Secretariat','assets/photos/podium.jpg','purple')
card('committees','Twenty-five','committees.','Committees','assets/photos/laptops.jpg','green')
card('partners','With thanks','to our partners.','Partners','assets/photos/speaker.jpg','purple')
card('contact','Get in','touch.','Contact','assets/photos/atrium-2.jpg','green')
card('applications','Take your','seat.','Applications · SODMUN V','assets/photos/award.jpg','purple')
print(os.listdir(OUT))
