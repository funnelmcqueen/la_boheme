import base64, io, sys
from PIL import Image as _Img
sys.path.insert(0, '/home/claude/vajana')
import engravings as E
import patterns as P
from PIL import Image, ImageEnhance

SRC = "/home/claude/vajana/Vajana photos/"

def grade(im, warmth=1.0, sat=1.0, bright=1.0, contrast=1.0):
    im = im.convert("RGB")
    if sat != 1.0:
        im = ImageEnhance.Color(im).enhance(sat)
    if bright != 1.0:
        im = ImageEnhance.Brightness(im).enhance(bright)
    if contrast != 1.0:
        im = ImageEnhance.Contrast(im).enhance(contrast)
    if warmth != 1.0:
        r, g, b = im.split()
        r = r.point(lambda v: min(255, int(v * warmth)))
        b = b.point(lambda v: min(255, int(v * (2 - warmth))))
        im = Image.merge("RGB", (r, g, b))
    return im

def enc(path, w=1000, crop=None, **kw):
    im = Image.open(path)
    if crop:
        im = im.crop(crop)
    im = grade(im, **kw)
    ratio = w / im.width
    im = im.resize((w, int(im.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=72, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

IMGS = {
    "HERO":    enc(SRC + "IMG_7904.JPG", 1500, warmth=1.04, sat=1.05, contrast=1.04),
    "CARP":    enc(SRC + "IMG_7933.JPG", 1150, crop=(0, 67, 2700, 2767),
                   warmth=1.01, sat=1.06, contrast=1.05),

    "OCTO":    enc(SRC + "IMG_7899.JPG", 900,  warmth=1.02, sat=1.00),
    "CATCH":   enc(SRC + "IMG_7920.JPG", 1100, warmth=1.00, sat=0.96),
    "LOBSTER": enc(SRC + "IMG_7926.JPG", 900,  warmth=1.00, sat=0.94),
    "WINE":    enc(SRC + "IMG_7914.JPG", 900,  warmth=1.02, sat=0.98),
    "SPRITZ":  enc(SRC + "IMG_7934.JPG", 900,  warmth=1.01, sat=1.04),
    "TABLE":   enc(SRC + "IMG_7905.JPG", 1300, warmth=1.05, sat=0.96, bright=0.92),
    "NIGHT":   enc(SRC + "IMG_7897.JPG", 900,  warmth=1.03, sat=1.05),
    "EASEL":   enc(SRC + "IMG_7900.JPG", 1000, warmth=1.05, sat=0.92),
    "DAY":     enc(SRC + "IMG_7918.JPG", 900,  warmth=1.00, sat=1.05),
    # chef: tight crop from the Instagram screenshot, graded warm as recommended
    "CHEF":    enc("/mnt/user-data/uploads/IMG_7891.PNG", 900,
                   crop=(150, 372, 1230, 1722)),
}

ROSE_BIG   = P.mandala_line(760, 7,  rings=8, hollow=True)
ROSE_A     = P.mandala_mech(760, 31, rings=4)
ROSE_B     = P.mandala_line(760, 55, rings=7)
ROSE_C     = P.mandala_line(760, 88, rings=10)
ROSE_S1    = P.mandala_mech(760, 12, rings=3)
ROSE_S2    = P.mandala_mech(760, 44, rings=3)
ROSE_S3    = P.mandala_mech(760, 71, rings=3)
ROSE_CH    = P.mandala_mech(760, 5,  rings=3, sw=1.2)
ROSE_S2    = P.mandala_mech(760, 44, rings=3)
ROSE_S3    = P.mandala_mech(760, 71, rings=3)
import base64 as _b64
def _uri(svg):
    return "data:image/svg+xml;base64," + _b64.b64encode(svg.encode()).decode()
import datetime as _dt
_DOY = _dt.date.today().timetuple().tm_yday
SUNRISE, NOON, SUNSET = P.sun_arc(_DOY)
_fmt = lambda h: "%02d:%02d" % (int(h), (h % 1) * 60)
T_RISE, T_SET = _fmt(SUNRISE), _fmt(SUNSET)
ROSE_MECH = P.mandala_mech(760, _DOY, rings=7)
ROSE_MECH_SM = P.mandala_mech(760, _DOY, rings=3)

def _png(p, w):
    im = _Img.open(p).convert("RGBA")
    im = im.resize((w, int(im.height * w / im.width)), _Img.LANCZOS)
    bf = io.BytesIO(); im.save(bf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(bf.getvalue()).decode()

PLATE = ""

RULE      = _uri(P.inked(P.band_line(160, 26, 1.1), "#C69A5C"))
RULE_DARK = _uri(P.inked(P.band_line(160, 26, 1.1), "#8A6E45"))

FISH = ('<div class="fishwrap">'
        '<div class="rose">' + ROSE_BIG + '</div>'
        '<div class="fishmark">' + E.FISH + '</div></div>')

HTML = r"""<!DOCTYPE html>
<html lang="sq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vajana by La Bohème — Restorant Plazhi në Vlorë</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Archivo:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#12100E;
  --ink2:#1B1714;
  --sand:#E9DCCB;
  --sand2:#DCCBB6;
  --bone:#F2EBE1;
  --lamp:#C69A5C;
  --shell:#8E7F70;
  --line:rgba(242,235,225,.14);
  --d:'Bodoni Moda','Didot','Bodoni 72',Georgia,serif;
  --b:'Archivo','Helvetica Neue',system-ui,sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:transparent;color:var(--bone);font-family:var(--b);font-weight:300;
  -webkit-font-smoothing:antialiased;line-height:1.65}
img{display:block;width:100%;height:100%;object-fit:cover}

/* ---------- entrance ----------
   No separate intro graphic. The hero's own emblem is placed at the centre of
   the screen, enlarged, then travels to its resting position, so the rings never
   stop turning and there is no cut between intro and page. */
#entrance{position:fixed;inset:0;z-index:150;background:var(--ink);
  pointer-events:none;transition:opacity 1.5s ease}
#entrance.gone{opacity:0}
.emblem.intro{z-index:190;will-change:transform}
.hero .txt > *:not(.emblem){opacity:0;transform:translateY(14px)}
.hero.landed .txt > *:not(.emblem){opacity:1;transform:none;
  transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1)}
.hero.landed .txt > h1{transition-delay:.13s}
.hero.landed .txt > .hrule{transition-delay:.22s}
.hero.landed .txt > p{transition-delay:.30s}
.hero.landed .txt > .btns{transition-delay:.38s}
.hero .panel{opacity:0;transition:opacity 1.2s ease .35s}
.hero.landed .panel{opacity:1}

/* ---------- wordmark ---------- */
.mark{font-family:var(--d);letter-spacing:.24em;line-height:1;text-transform:uppercase}
.mark .a{display:block;font-size:.72em;letter-spacing:.34em;color:var(--lamp);
  font-family:var(--b);font-weight:400;margin-bottom:.9em;text-transform:uppercase}
.mark .b{display:block;font-size:.5em;letter-spacing:.3em;color:var(--shell);
  font-family:var(--b);margin-top:1.1em}

/* ---------- chrome ---------- */
header{position:fixed;top:0;left:0;right:0;z-index:90;display:flex;justify-content:space-between;
  align-items:center;padding:20px clamp(28px,4.5vw,76px);transition:background .4s ease,padding .4s ease;
  background:none}
header.stuck{background:var(--ground);padding:12px clamp(28px,4.5vw,76px);border-bottom:1px solid var(--line)}

.hmark{font-family:var(--d);font-size:15px;letter-spacing:.3em;text-transform:uppercase}
.hmark small{display:block;font-family:var(--b);font-size:8.5px;letter-spacing:.28em;
  color:var(--lamp);margin-top:4px}
nav{display:flex;gap:30px;font-size:11px;letter-spacing:.2em;text-transform:uppercase}
nav a{color:var(--bone);opacity:.72;text-decoration:none}
nav a:hover{opacity:1;color:var(--lamp)}
@media(max-width:820px){nav{display:none}}
@media(max-width:560px){.eyebrow{letter-spacing:.2em;font-size:9.5px}
  .btns .btn{flex:1;justify-content:center}}

/* ---------- type ---------- */
h2{font-family:var(--d);font-weight:400;font-size:clamp(30px,4.6vw,52px);line-height:1.1;
  margin:0 0 22px;letter-spacing:-.005em}
.eyebrow{font-size:10.5px;letter-spacing:.34em;text-transform:uppercase;color:var(--lamp);
  margin-bottom:22px}
p{margin:0 0 16px;color:var(--body);font-size:16.5px;max-width:56ch}
section{padding:clamp(80px,11vw,150px) clamp(24px,6vw,90px)}
.wrap{max-width:1180px;margin:0 auto}

/* ---------- hero: split, type left, image panel right ----------
   Accent colours sampled straight from the octopus photograph: #904D34 and
   #AA7761 off the charred arms, #7F311A from the deepest crust. The first
   screen is lit by the dish rather than by a generic gold. */
.hero,.hbar{
  --lamp:#B57652;        /* charred arm, #904D34 lifted for line work */
  --acc:#A0421F;         /* deepest crust, #7F311A */
  --shell:#9A8474;       /* #AA7761 muted, for captions */
  --oil:#C79A62;         /* the olive oil pooled at the rim */
  --bed:#9B8AA0;         /* the purple potato bed, #8C7B90 lifted */
  --bed-d:#5E5065;       /* the same in shadow */
  --plate:#C6BCB2;       /* the bowl */
}
.hero{min-height:100svh;display:grid;grid-template-columns:1.06fr 1fr;
  align-items:center;padding:0;position:relative;overflow:hidden}
.hero .txt{padding:68px clamp(28px,4vw,70px) 0 clamp(30px,4.5vw,76px);position:relative;z-index:3;align-self:end}
.hero .panel{position:relative;margin:0 clamp(20px,3vw,48px) 0 0;
  box-shadow:0 0 0 1px rgba(198,188,178,.38)}
.hero .panel::before{content:'';position:absolute;inset:9px;border:1px solid rgba(198,188,178,.24);
  z-index:4;pointer-events:none}
.hero .cap{position:absolute;left:0;bottom:26px;background:var(--sand);color:#2E251A;
  font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;padding:9px 18px;
  border-left:3px solid var(--lamp);z-index:4}

/* ---------- seascape ----------
   Four stacked layers, all slow, all negative-delayed so the water is already
   moving on first paint: a depth gradient, caustics off the surface, drifting
   light shafts, the shoal, and suspended matter. Deeper things are smaller,
   fainter, bluer, slower and slightly out of focus. */
#sea{--ox:36%;--oy:25.5%;--s0:.26;position:absolute;left:0;top:0;bottom:0;width:52%;z-index:0;overflow:hidden;
  pointer-events:none;
  --hole:340px;
  mask-image:
    linear-gradient(90deg,#000 74%,transparent 100%),
    linear-gradient(180deg,#000 46%,rgba(0,0,0,.35) 74%,rgba(0,0,0,.12) 100%),
    radial-gradient(circle at var(--ox) var(--oy),
      transparent 0, transparent var(--hole), #000 calc(var(--hole) * 2.1));
  mask-composite:intersect;
  -webkit-mask-image:
    linear-gradient(90deg,#000 74%,transparent 100%),
    linear-gradient(180deg,#000 46%,rgba(0,0,0,.35) 74%,rgba(0,0,0,.12) 100%),
    radial-gradient(circle at var(--ox) var(--oy),
      transparent 0, transparent var(--hole), #000 calc(var(--hole) * 2.1));
  -webkit-mask-composite:source-in}
@media(max-width:1000px){#sea{width:100%}}

/* the water column itself */
#sea::before{content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,
    rgba(199,154,98,.145) 0%,
    rgba(181,118,82,.09) 28%,
    rgba(140,110,120,.075) 58%,
    rgba(94,80,101,.115) 100%)}

/* caustics: surface light broken up and thrown down into the first few metres */
#sea .caust{position:absolute;left:-20%;right:-20%;top:-14%;height:88%;
  background:
    radial-gradient(40% 26% at 20% 16%,rgba(233,186,116,.21),transparent 62%),
    radial-gradient(32% 22% at 60% 32%,rgba(199,154,98,.16),transparent 64%),
    radial-gradient(46% 28% at 86% 10%,rgba(241,205,150,.15),transparent 60%),
    radial-gradient(34% 22% at 44% 58%,rgba(155,138,160,.13),transparent 66%);
  filter:blur(26px);mix-blend-mode:screen;
  animation:caust 46s ease-in-out infinite alternate}
#sea .caust.b{animation-duration:63s;animation-delay:-22s;opacity:.7;
  transform:scaleX(-1)}
@keyframes caust{
  0%  {transform:translate3d(-3%,0,0) scale(1)}
  50% {transform:translate3d(3%,1.6%,0) scale(1.09)}
  100%{transform:translate3d(-2%,-1%,0) scale(1.02)}}
#sea .caust.b{animation-name:caustb}
@keyframes caustb{
  0%  {transform:scaleX(-1) translate3d(2%,0,0) scale(1.04)}
  50% {transform:scaleX(-1) translate3d(-3%,2%,0) scale(1)}
  100%{transform:scaleX(-1) translate3d(1%,-1%,0) scale(1.08)}}

#sea .shaft{position:absolute;top:18%;height:130%;width:20vw;
  background:linear-gradient(90deg,transparent,rgba(180,214,232,.055),transparent);
  transform:rotate(11deg);filter:blur(34px);
  animation:shaft ease-in-out infinite alternate}
@keyframes shaft{from{transform:rotate(11deg) translateX(-9vw) scaleY(1)}
  to{transform:rotate(11deg) translateX(9vw) scaleY(1.06)}}

/* the wave. Ripple fronts leaving the eye: closed outlines whose radius is
   modulated by two sines, so they read as water under pressure rather than as
   a sonar sweep. They expand, turn slightly and fade. */
/* the wave sits above everything in the hero, the mark included: it is light
   crossing the water, so nothing in the water occludes it */
.hero .wave{position:absolute;left:var(--ox,34%);top:var(--oy,25.5%);width:0;height:0;
  z-index:6;pointer-events:none}
.hero .wave svg{position:absolute;left:50%;top:50%;width:70vw;height:70vw;
  margin:-35vw 0 0 -35vw;overflow:visible;animation:swellout linear infinite;
  mask-image:linear-gradient(180deg,#000 0 50%,transparent 50%);
  -webkit-mask-image:linear-gradient(180deg,#000 0 50%,transparent 50%)}
.hero .wave path{fill:none;stroke:#FFFFFF;stroke-width:3;stroke-linejoin:round;
  vector-effect:non-scaling-stroke}
@keyframes swellout{
  0%{transform:scale(var(--s0,.26)) rotate(0deg);opacity:0}
  7%{opacity:.85}
  58%{opacity:.42}
  100%{transform:scale(1) rotate(22deg);opacity:0}}

/* Suspended matter carried by the same field. This is what makes the push
   read as water: the medium visibly streams outward and thins near the eye,
   leaving a clear zone. Rings would read as sonar; drifting matter reads as sea. */
#sea .mt{position:absolute;left:0;top:0;border-radius:50%;background:var(--plate);
  will-change:transform;pointer-events:none}

/* the swimmers. Each holds its own heading and speed; the rosette pushes them
   off course whenever they come near it. Positions are driven in one rAF loop. */
#sea .cr{position:absolute;left:0;top:0;width:var(--w);
  will-change:transform;color:var(--lamp)}
#sea .cr svg{width:100%;height:auto;display:block}
#sea .cr .d{stroke:currentColor;fill:none;stroke-width:1.5;
  vector-effect:non-scaling-stroke}
#sea .cr .eng{stroke-width:1.5}
#sea .cr i{display:block}
#sea .cr b{display:block}
/* a fish beats its tail, an octopus pulses its mantle, a prawn flicks. Drift
   with no propulsion cue is what makes creatures look like litter. */
#sea .cr i{animation:beat cubic-bezier(.45,0,.55,1) infinite alternate}
@keyframes beat{from{transform:scaleX(1.02) scaleY(.985) translateY(-.5px)}
  to{transform:scaleX(.985) scaleY(1.015) translateY(.5px)}}
#sea .cr.oct i{animation:pulse cubic-bezier(.4,0,.5,1) infinite alternate}
@keyframes pulse{from{transform:scale(1.045,.955)}to{transform:scale(.96,1.05)}}
#sea .cr.pr i{animation:flick cubic-bezier(.3,0,.2,1) infinite}
@keyframes flick{0%,76%{transform:translateX(0) scaleX(1)}
  86%{transform:translateX(-4px) scaleX(.94)}
  100%{transform:translateX(0) scaleX(1)}}
#sea .cr.oct{color:var(--bed)}
#sea .cr.pr{color:var(--acc)}
#sea .cr.oct b,#sea .cr.pr b{transform:none}

#sea .surface{position:absolute;left:0;right:0;top:8%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(233,186,116,.38),transparent);
  filter:blur(.4px);animation:swell 15s ease-in-out infinite}
@keyframes swell{0%,100%{transform:translateY(0) scaleY(1);opacity:.45}
  50%{transform:translateY(9px) scaleY(1.8);opacity:.95}}

@media(prefers-reduced-motion:reduce){#sea{display:none}}

/* the panel: the photograph at its own proportion, cropped only so the bowl
   sits dead centre in the frame. Gold hairline, inset second line, caption tab. */
.hero .panel{position:relative;align-self:center;justify-self:center;
  width:min(92%,calc((100svh - 168px)*0.86));aspect-ratio:1/1;overflow:hidden;
  box-shadow:0 0 0 1px rgba(198,188,178,.38)}
.hero .panel::before{content:'';position:absolute;inset:9px;z-index:4;
  border:1px solid rgba(198,188,178,.24);pointer-events:none}
.hero .panel img{display:block;width:100%;height:100%;object-fit:cover}
.hero .panel .cap{position:absolute;left:0;bottom:26px;z-index:5;background:var(--sand);
  color:var(--brand);font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;
  padding:9px 18px;border-left:3px solid var(--acc)}
@media(max-width:1000px){.hero .panel{width:auto;margin:0 26px 40px}}

/* ---------- the emblem ----------
   The rosette cut at its diameter: only the dome shows, and its cut edge is the
   line the wordmark sits on. Rings still turn about that baseline centre, which
   is also the point the water leaves from, so mark and seascape share one
   origin. The vajana floats inside the dome and is never cut. */
.emblem{width:min(94%,486px);margin:0 auto 40px;color:#FFFFFF;z-index:2;position:relative}
.dome{position:relative;width:100%;padding-top:50%;overflow:hidden}
.dome .dial{position:absolute;left:0;top:0;width:100%}
.dome .dial svg{width:100%;height:auto;display:block}
.rot .ring{transform-origin:50% 50%;animation:turn linear infinite}
/* small rosettes lose their stroke to the viewBox scale, and vector-effect is
   not inherited from the <svg>, so it is re-declared here */
.rot path,.rot circle{vector-effect:non-scaling-stroke;stroke-width:1}
@keyframes turn{to{transform:rotate(360deg)}}
.rot .ring:nth-of-type(1){animation-duration:210s}
.rot .ring:nth-of-type(2){animation-duration:150s;animation-direction:reverse}
.rot .ring:nth-of-type(3){animation-duration:118s}
.rot .ring:nth-of-type(4){animation-duration:86s;animation-direction:reverse}
.rot .ring:nth-of-type(5){animation-duration:64s}
.rot .ring:nth-of-type(6){animation-duration:46s;animation-direction:reverse}
.rot .ring:nth-of-type(7){animation-duration:32s}
.rot .ring,.rot .fixed{opacity:1}

/* the vajana, floating in the dome, clear of the cut line */
.dome .core{position:absolute;left:50%;bottom:6%;width:24%;
  transform:translateX(-50%);animation:hover 16s ease-in-out infinite}
.dome .core svg{width:100%;height:auto;display:block}
.dome .core{color:var(--lamp)}
.dome .core .d{stroke:currentColor;stroke-width:1.35;fill:none}
/* kept small enough that the fish never reaches the innermost ring */
@keyframes hover{
  0%   {transform:translateX(-50%) translateY(0) rotate(-1.8deg)}
  25%  {transform:translateX(-51.5%) translateY(-2px) rotate(.5deg)}
  50%  {transform:translateX(-50%) translateY(2px) rotate(1.8deg)}
  75%  {transform:translateX(-48.5%) translateY(-1px) rotate(.3deg)}
  100% {transform:translateX(-50%) translateY(0) rotate(-1.8deg)}}

/* the baseline, and the name that sits on it */
.emblem .base{height:1px;background:currentColor;opacity:1;position:relative}
.emblem .base::after{content:'';position:absolute;left:50%;top:-3px;width:7px;height:7px;
  border-radius:50%;background:var(--acc);transform:translateX(-50%)}
.emblem .name{text-align:center;padding-top:24px}
.emblem .name .vaj{font-family:var(--d);font-weight:400;
  font-size:clamp(30px,3.0vw,52px);letter-spacing:.30em;text-transform:uppercase;
  color:#FFFFFF;line-height:1;text-indent:.30em}
.emblem .name .lb{display:block;margin-top:8px;font-family:var(--b);font-weight:500;
  font-size:13px;letter-spacing:.34em;text-transform:uppercase;color:var(--lamp);
  text-indent:.34em}
@media(prefers-reduced-motion:reduce){.rot .ring,.dome .core{animation:none}}


.hero .eyebrow{display:flex;align-items:center;gap:14px;margin-bottom:26px}
.hero .eyebrow::before{content:'';width:38px;height:1px;background:var(--lamp);flex:none}
.hero h1{font-family:var(--d);font-weight:400;font-size:clamp(36px,4.9vw,92px);line-height:1.05;
  margin:0 0 0;letter-spacing:-.015em}
.hero h1 em{font-style:italic;color:var(--lamp);display:block}
.hrule{position:relative;height:1px;background:var(--lamp);opacity:.55;
  width:clamp(200px,17vw,320px);margin:22px 0 18px}
.hrule::after{content:'';position:absolute;right:-3px;top:-3px;width:7px;height:7px;
  border-radius:50%;background:#D9603A}
.hero p{font-size:clamp(15px,1.05vw,18px);max-width:40ch;color:var(--body);line-height:1.75}
.hero .btns{margin-top:22px;margin-bottom:0}

.hbar{opacity:0;pointer-events:none;transition:opacity .45s ease;
  position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;
  justify-content:space-between;padding:14px clamp(28px,4.5vw,76px);
  font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--shell);
  background:linear-gradient(to top,var(--ground),transparent);pointer-events:none}
/* short viewports: the emblem is the first thing to give, so the CTA stays
   above the fold on 900px laptops */
@media(min-width:1001px) and (max-height:960px){
  .emblem{width:min(88%,386px);margin-bottom:26px}
  .emblem .name{padding-top:18px}
  .hero h1{font-size:clamp(33px,4.2vw,78px)}
  .hero .txt{padding-top:44px;padding-bottom:0}
}
@media(max-width:1000px){
  .hero{grid-template-columns:1fr;min-height:auto}
  .hero .txt{padding:120px 26px 0}
  .hero .panel{margin:0 26px 40px}
  .rail,.hbar{display:none}}

.hbar.on{opacity:1;pointer-events:auto}

/* ---------- buttons ---------- */
.btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.btn{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;font-size:11px;
  letter-spacing:.22em;text-transform:uppercase;text-decoration:none;border:1px solid var(--lamp);
  color:var(--lamp);transition:.25s;background:transparent}
.btn:hover{background:var(--lamp);color:var(--brand)}
.btn.solid{background:var(--lamp);color:var(--brand);font-weight:500}
.btn.solid:hover{background:transparent;color:var(--lamp)}
.btn.dark{border-color:#3E3225;color:#3E3225}
.btn.dark:hover{background:#3E3225;color:var(--sand)}

/* ---------- day strip ---------- */
.day{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.day .c{position:relative;aspect-ratio:3/4;overflow:hidden}
.day .c img{transition:transform 1.1s ease}
.day .c:hover img{transform:scale(1.05)}
.day .c figcaption{position:absolute;left:0;right:0;bottom:0;padding:26px 22px;
  background:linear-gradient(to top,rgba(18,16,14,.9),transparent)}
.day .t{font-family:var(--d);font-size:clamp(19px,2.4vw,27px)}
.day .s{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--lamp);margin-bottom:6px}
@media(max-width:760px){.day{grid-template-columns:1fr;gap:2px}.day .c{aspect-ratio:16/10}}

/* ---------- the carte ---------- */
.paper{background:transparent;padding:clamp(56px,7vw,96px) clamp(20px,5vw,70px)}
.tabs{display:flex;gap:34px;justify-content:center;margin-bottom:38px;
  font-size:10px;letter-spacing:.26em;text-transform:uppercase}
.tabs span{color:var(--shell);cursor:pointer;padding-bottom:7px;transition:.3s}
.tabs span.on{color:var(--lamp);border-bottom:1px solid var(--lamp)}
.sheet{background:var(--sand);color:#3E3225;max-width:760px;margin:0 auto;
  isolation:isolate;box-shadow:0 30px 80px rgba(0,0,0,.45);
  padding:clamp(40px,5vw,66px) clamp(26px,5vw,64px) clamp(46px,5vw,60px)}
.sheet .pmark{text-align:center;font-family:var(--d);font-size:13px;letter-spacing:.34em;
  text-transform:uppercase;color:#2E251A}
.sheet .pmark small{display:block;font-family:var(--b);font-size:7.5px;letter-spacing:.3em;
  color:#8A6E45;margin-top:7px}
.orn2{display:flex;align-items:center;justify-content:center;gap:5px;margin:20px 0 0;
  color:#8A6E45;opacity:.75}
.orn2 i{width:1px;height:8px;background:currentColor;display:block}
.orn2 b{width:3.5px;height:3.5px;border-radius:50%;background:var(--brand);display:block;margin:0 4px}
.mgroup{margin-top:38px}
.mgroup h3{font-family:var(--d);font-weight:400;font-size:clamp(23px,3vw,29px);
  text-align:center;color:#2E251A;margin:0;letter-spacing:.01em}
.mgroup .note{text-align:center;font-family:var(--d);font-style:italic;font-size:12.5px;
  color:rgba(62,50,37,.6);margin:5px 0 26px}
.item{padding:0 0 16px;margin-bottom:14px;border-bottom:1px dashed rgba(62,50,37,.28)}
.item:last-child{border-bottom:0}
.row{display:flex;align-items:baseline;gap:8px}
.row .n{font-family:var(--d);font-size:16.5px;color:#2E251A;white-space:nowrap}
.row .dots{flex:1;border-bottom:1px dotted rgba(62,50,37,.45);transform:translateY(-3px)}
.row .p{font-family:var(--b);font-size:12.5px;font-weight:500;color:var(--brand);
  letter-spacing:.04em;white-space:nowrap}
.item .d{font-family:var(--d);font-style:italic;font-size:12.5px;line-height:1.55;
  color:rgba(62,50,37,.62);margin-top:5px;max-width:52ch}
.wine{display:flex;align-items:baseline;gap:8px;padding:7px 0;
  border-bottom:1px dashed rgba(62,50,37,.22)}
.wine .n{font-family:var(--d);font-size:15px;color:#2E251A;white-space:nowrap}
.wine .dots{flex:1;border-bottom:1px dotted rgba(62,50,37,.4);transform:translateY(-3px)}
.wine .p{font-family:var(--b);font-size:12px;font-weight:500;color:var(--brand)}
.closing{text-align:center;margin-top:44px}
.closing .bon{font-family:var(--d);font-style:italic;font-size:22px;color:#2E251A}
.closing .al{font-family:var(--d);font-style:italic;font-size:11.5px;
  color:rgba(62,50,37,.58);margin-top:9px;line-height:1.8}
.fullmenu{text-align:center;margin-top:38px}

/* ---------- signatures ---------- */
.sigs{display:grid;grid-template-columns:repeat(3,1fr);gap:44px;margin-top:52px}
.sig{text-align:center}
.sig-n{font-family:var(--d);font-size:19px;color:#FFFFFF;margin-bottom:7px}
.sig-d{font-size:13.5px;color:#FFFFFF;opacity:.82;line-height:1.55}
.sig .plateicon{width:78px;margin:0 auto 18px;color:var(--lamp);opacity:1}
.sig .plateicon svg{width:100%;height:auto;display:block}
@media(max-width:800px){.sigs{grid-template-columns:1fr;gap:34px}}

/* the cream-sheet variant, scoped: unscoped it overrode the page's own signatures */
.paper .sigs{gap:40px;margin-top:14px}
.paper .sig-n{font-size:22px;margin-bottom:8px;color:var(--logo-true)}
.paper .sig-d{font-size:14px;color:rgba(62,50,37,.72)}
.paper .sig .r{width:34px;height:1px;background:var(--logo-true);margin-bottom:18px}
@media(max-width:760px){.sigs{grid-template-columns:1fr;gap:30px}}

#kitchen .role{font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;
  color:var(--lamp);margin-bottom:24px}

/* ---------- split ---------- */
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,6vw,84px);align-items:center}
.split.rev .txt{order:2}
.split .im{aspect-ratio:4/5;overflow:hidden}
@media(max-width:860px){.split{grid-template-columns:1fr}.split.rev .txt{order:0}
  .split .im{aspect-ratio:16/11}}
.specs{list-style:none;padding:0;margin:26px 0 0;font-size:14.5px;
  color:rgba(242,235,225,.7);columns:2;column-gap:34px}
.specs li{padding:6px 0;border-bottom:1px solid var(--line);break-inside:avoid}
@media(max-width:560px){.specs{columns:1}}

/* ---------- the houses ----------
   A seamless right-to-left loop. The track holds the list twice and translates
   by exactly -50%, so the second copy is in the first one's place when the
   animation restarts and there is no seam. Masked at both edges so names enter
   and leave rather than popping. */
.loop{position:relative;overflow:hidden;margin-top:38px;
  mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}
.ltrack{display:flex;width:max-content;animation:loopx 46s linear infinite}
.loop:hover .ltrack{animation-play-state:paused}
@keyframes loopx{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.house{flex:none;display:flex;flex-direction:column;gap:5px;
  padding:0 clamp(26px,3.4vw,54px);border-right:1px solid var(--line)}
.house .hn{font-family:var(--d);font-size:clamp(19px,1.6vw,26px);color:#FFFFFF;
  white-space:nowrap;line-height:1.15}
.house .hp{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;
  color:#FFFFFF;opacity:.5;white-space:nowrap}
@media(prefers-reduced-motion:reduce){.ltrack{animation:none}}

/* ---------- cellar ---------- */
.cellar{border-top:1px solid var(--line);padding-bottom:0}
.labels{display:flex;flex-wrap:wrap;gap:0 44px;margin-top:34px;font-family:var(--d);
  font-size:clamp(20px,2.8vw,32px);line-height:1.9;color:rgba(242,235,225,.42)}
.labels b{font-weight:400;color:var(--bone)}

/* ---------- evenings ---------- */
.ev{position:relative;min-height:78svh;display:flex;align-items:center;padding:0}
.ev .bg{position:absolute;inset:0}
.ev .bg::after{content:'';position:absolute;inset:0;
  background:linear-gradient(to right,rgba(18,16,14,.96),rgba(18,16,14,.82) 45%,rgba(18,16,14,.35))}
.ev .evin{position:relative;z-index:2;max-width:1180px;margin:0 auto;width:100%;
  padding:clamp(70px,9vw,110px) clamp(24px,6vw,90px)}

/* ---------- story ---------- */
.story{max-width:640px;margin:0 auto;text-align:center}
.story p{margin-left:auto;margin-right:auto;font-size:17px}
.story .lead{font-family:var(--d);font-size:clamp(20px,2.6vw,26px);line-height:1.55;
  color:var(--bone);margin-bottom:28px}
.story .fishmini{width:150px;margin:0 auto 34px}
.story .fishmini .d{stroke:var(--lamp);stroke-width:2;fill:none;opacity:.85}
.easel{max-width:620px;margin:56px auto 0;aspect-ratio:4/3;overflow:hidden}
.cap{text-align:center;font-size:12px;color:var(--shell);margin-top:14px;letter-spacing:.05em}

/* ---------- footer ---------- */
footer{border-top:1px solid var(--line);padding:70px clamp(24px,6vw,90px) 120px}
.fgrid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:44px}
@media(max-width:760px){.fgrid{grid-template-columns:1fr;gap:34px}}
footer h4{font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--lamp);
  margin:0 0 16px;font-weight:400}
footer p,footer a{font-size:14.5px;color:var(--body);text-decoration:none}
footer a:hover{color:var(--lamp)}

/* ---------- sticky mobile bar ---------- */
.bar{position:fixed;left:0;right:0;bottom:0;z-index:95;display:none;gap:1px;
  background:var(--line);border-top:1px solid var(--line)}
.bar a{flex:1;text-align:center;padding:16px 8px;background:var(--ink2);color:var(--bone);
  font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none}
.bar a.w{background:var(--lamp);color:var(--ink)}
@media(max-width:820px){.bar{display:flex}}

.reveal{opacity:0;transform:translateY(26px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
.reveal.in{opacity:1;transform:none}

/* ---------- engravings ---------- */
.eng path,.eng circle{stroke:currentColor;stroke-width:1.4;fill:none;
  stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.plate{position:absolute;color:var(--lamp);opacity:.09;pointer-events:none;z-index:0}
.plate .eng{width:100%;height:auto;display:block}
.paper .plate{color:#8A6E45;opacity:.14}
section,.ev,.cellar{position:relative;overflow:hidden}
.wrap,.story,.ev .evin{position:relative;z-index:2}

/* the emblem reused as a mark: same dome, same turning rings, same fish, no
   wordmark. Every rosette on the page is this. */
.embmark{position:relative;color:#FFFFFF}
.embmark .dome{position:relative;width:100%;padding-top:50%;overflow:hidden}
.embmark .dial{position:absolute;left:0;top:0;width:100%}
.embmark .dial svg{width:100%;height:auto;display:block}
.embmark .dial path,.embmark .dial circle{stroke:currentColor;stroke-width:1;
  vector-effect:non-scaling-stroke}
.embmark .ring{transform-origin:50% 50%;animation:turn linear infinite}
.embmark .ring:nth-of-type(1){animation-duration:154s}
.embmark .ring:nth-of-type(2){animation-duration:108s;animation-direction:reverse}
.embmark .ring:nth-of-type(3){animation-duration:70s}
.embmark .fixed{opacity:.8}
.embmark .core{position:absolute;left:50%;bottom:7%;width:26%;
  transform:translateX(-50%);animation:hover 16s ease-in-out infinite}
.embmark .core svg{width:100%;height:auto;display:block}
.embmark .core .d{stroke:var(--logo);stroke-width:1.1;fill:none;
  vector-effect:non-scaling-stroke}
.embmark .base{height:1px;background:currentColor;opacity:.8;margin-top:2px}
@media(prefers-reduced-motion:reduce){.embmark .ring,.embmark .core{animation:none}}

/* ---------- chapter divider ----------
   Marks the point where the beach ends and the restaurant begins: a patterned
   hairline running out to both margins, broken in the middle by a small rosette
   and the chapter name. */
.chapter{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;
  gap:clamp(16px,2.4vw,34px);padding:50px clamp(28px,4.5vw,76px)}
.chapter .rule{height:26px;background-image:url(__RULE__);
  background-repeat:repeat-x;background-size:auto 26px;opacity:.5;
  transform:translateY(6px)}
/* tile away from the centre so both rules meet the mark at the same point in
   the motif; tiling from the outside leaves each side ending mid-tile */
.chapter .rule:first-child{background-position:right center}
.chapter .rule:last-child{background-position:left center}
.chapter .mid{display:flex;flex-direction:column;align-items:center;gap:10px;
  flex:none}
.chapter .mid .embmark{width:112px}
.chapter .label{font-family:var(--d);font-size:clamp(15px,1.5vw,22px);
  letter-spacing:.36em;text-transform:uppercase;color:var(--bone);
  text-indent:.36em;white-space:nowrap}
@media(max-width:700px){.chapter .rule{display:none}
  .chapter{justify-content:center}}

/* the mark, everywhere it appears */
.sig .embmark{margin:0 auto 16px}
.wmrose .embmark{width:100%;color:currentColor}
#story .embmark{color:#FFFFFF}

/* ---------- patterned hairline rule ---------- */
.prule{height:26px;background-image:url(__RULE__);background-repeat:repeat-x;
  background-size:auto 26px;opacity:.4;margin:0}
.paper .prule{opacity:.55;background-image:url(__RULE_DARK__)}
.paper .sheet .pmark,.paper .orn2{color:var(--logo-true)}

/* ---------- rosette watermarks ---------- */
.rose{color:var(--lamp)}
.rose svg{width:100%;height:auto;display:block}
.wmrose{position:absolute;pointer-events:none;z-index:0;opacity:.07;color:var(--lamp)}
.wmrose svg{width:100%;height:auto;display:block}
.paper .wmrose{opacity:.13;color:#8A6E45}

/* ---------- ornamental rule ---------- */
/* a separator belongs to neither section: it sits between them with the same
   space on both sides, so it reads as a division rather than as a heading */
.sep{display:flex;justify-content:center;padding:50px 0}

/* the separator owns the whole gap: the sections either side give up their
   adjacent padding, or the space is symmetric only by accident */
.sep + section,.chapter + section,.sep + div[class^="ev"],
section:has(+ .sep),section:has(+ .chapter){padding-top:0}
/* the section after a separator is measured from its topmost element. A split
   grid centres its columns, so the shorter one floats and the gap below the
   separator silently grows by that offset. */
.sep + section .split,.chapter + section .split{align-items:start}
section:has(+ .sep),section:has(+ .chapter){padding-bottom:0}
.orn{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;
  color:var(--lamp);margin:0 auto;max-width:340px;width:100%;opacity:.75}
.orn i{height:1px;background:currentColor;opacity:.35}
.orn .eng{width:64px;height:auto;flex:none}
.paper .orn{color:#8A6E45}

/* ---------- line-mask headings ---------- */
.lines{display:block}
.lines .ln{display:block;overflow:hidden;padding-bottom:.16em;margin-bottom:-.16em}
.lines .ln>span{display:block;transform:translateY(105%);
  transition:transform 1.05s cubic-bezier(.16,1,.3,1)}
.lines.in .ln>span{transform:none}
.lines .ln:nth-child(2)>span{transition-delay:.09s}
.lines .ln:nth-child(3)>span{transition-delay:.18s}

/* ---------- image wipe (on the img: clipping the frame would zero its
   intersection box and the observer would never fire) ---------- */
.im>img,.easel>img,.day .c>img{clip-path:inset(0 0 100% 0);
  transition:clip-path 1.25s cubic-bezier(.16,1,.3,1)}
.im.in>img,.easel.in>img,.day .c.in>img{clip-path:inset(0 0 0 0)}

/* ---------- parallax frames ---------- */
.im,.hero .bg,.ev .bg,.easel{overflow:hidden}
.im img,.easel img{height:118%;will-change:transform}
.hero .bg img,.ev .bg img{height:128%;will-change:transform}
.day .c img{height:112%;will-change:transform}

/* ---------- the descent ----------
   The page is the water column. A fixed ground lerps through a six-stop ramp
   from sunlit surface to the dark, driven by the same scroll fraction as
   everything else, and every section sits transparent on top of it. */
#ground{position:fixed;inset:0;z-index:-2;background:var(--ground,#184054);
  transition:background-color .18s linear}
#glow{position:fixed;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(180deg,rgba(190,230,250,.10),transparent 38%,
    rgba(2,8,14,.20));mix-blend-mode:soft-light}

/* one zone. The page opens a few metres down, not above the surface, so the
   type is light throughout and only its temperature changes with depth. */
body{--bone:#F4EDE4;--shell:#B08A6C;--body:#E6DCD2;--line:rgba(236,244,248,.16);
  --brand:#482720}   /* the logo ground: usable at full strength only on cream */
body,body *{transition:border-color .5s linear,background-color .5s linear}

/* ---------- depth engine ----------
   Scroll position maps to depth in the bay. Seawater removes wavelengths in a
   fixed order, so the page loses its warmth in that same order on the way down.
   --acc   the terracotta accent, first thing the sea takes (gone by ~12 m)
   --lamp  the gold, cooling and dimming with depth
   --abyss opacity of the water column overlay */
:root{--depth:0;--acc:#D9603A;--abyss:0;--imgfx:none;--deep:0}
#water{display:none}
.hrule::after,.arc .sun,.rail .dot{background:var(--acc);
  transition:background .5s linear,opacity .5s linear}
img{filter:var(--imgfx,none);transition:filter .6s linear}
.depthread{font-variant-numeric:tabular-nums}

/* the vajana. Invisible at the surface, resolves below about thirty metres,
   which is the whole argument of the brand in one element. */
.deepfish{position:absolute;left:50%;top:50%;width:min(52vw,560px);
  transform:translate(-50%,-50%);color:var(--lamp);opacity:var(--deep,0);
  pointer-events:none;z-index:1;transition:opacity .6s linear}
.deepfish svg{width:100%;height:auto;display:block}
.deepfish .d{stroke:currentColor;stroke-width:1.2;fill:none}

/* ---------- grain ---------- */
#grain{position:fixed;inset:0;z-index:150;pointer-events:none;opacity:.055;
  mix-blend-mode:overlay}

/* ---------- lamp ambience ---------- */
.amb{position:absolute;inset:0;pointer-events:none;z-index:1;
  background:radial-gradient(60% 45% at 50% 78%,rgba(198,154,92,.16),transparent 70%);
  animation:breathe 11s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}

/* ---------- drop cap ---------- */
.dropcap::first-letter{font-family:var(--d);font-size:4.2em;line-height:.82;float:left;
  padding:.06em .12em 0 0;color:var(--lamp)}

/* ---------- button wipe ---------- */
.btn{position:relative;overflow:hidden;z-index:1}
.btn::before{content:'';position:absolute;inset:0;background:var(--lamp);z-index:-1;
  transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.16,1,.3,1)}
.btn:hover::before{transform:scaleX(1)}
.btn.solid::before{transform:scaleX(1)}
.btn.solid:hover::before{transform:scaleX(0);transform-origin:right}
.btn.dark::before{background:#3E3225}

/* ---------- sticky menu nav ---------- */
.cats{position:sticky;top:56px;z-index:20;background:var(--sand);
  padding-top:16px;margin-top:0}
.cats span{cursor:pointer;transition:color .3s}

/* ---------- signature plates ---------- */
.sig .plateicon{width:82px;color:#8A6E45;opacity:1;margin:0 auto 18px}
.sig{text-align:center}
.sig .plateicon .eng{width:100%;height:auto}

@media(max-width:820px){.plate{display:none}.amb{display:none}}
@media(prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
  .reveal{opacity:1;transform:none}
  .lines .ln>span{transform:none}
  .im>img,.easel>img,.day .c>img{clip-path:none}
  #entrance{display:none}
  #grain{display:none}
}
@media(prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
  .reveal{opacity:1;transform:none}
  #entrance{display:none}
}
</style>
</head>
<body>

<div id="ground"></div>
<div id="glow"></div>

<svg id="grain" xmlns="http://www.w3.org/2000/svg">
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3"/>
  <feColorMatrix type="saturate" values="0"/></filter>
  <rect width="100%" height="100%" filter="url(#g)"/>
</svg>

<div id="entrance"></div>

<header id="hd">
  <div class="hmark">La Bohème<small>Vajana · Vlorë</small></div>
  <nav>
    <a href="#menu">Menu</a>
    <a href="#catch">Peshku</a>
    <a href="#cellar">Verërat</a>
    <a href="#kitchen">Kuzhina</a>
    <a href="#evenings">Mbrëmje</a>
    <a href="#story">La Bohème</a>
  </nav>
</header>

<div class="hbar"><span>Hapur çdo ditë · 8:00 — 24:00 · Vlorë</span><span><span class="depthread" id="dep">0</span> m · nën sipërfaqe</span></div>

<div class="hero">
  <div id="sea" aria-hidden="true">
    <div class="surface"></div>
      <div class="cr" data-k="f" data-sp="21.9" style="--w:9.6vw;opacity:0.58;filter:blur(0.19px)"><i style="animation-duration:6.0s"><b>__E_FISHR__</b></i></div>
      <div class="cr" data-k="f" data-sp="28.0" style="--w:8.4vw;opacity:0.5;filter:blur(0.00px)"><i style="animation-duration:7.3s"><b>__E_FISHR__</b></i></div>
      <div class="cr" data-k="f" data-sp="28.5" style="--w:7.6vw;opacity:0.44;filter:blur(0.04px)"><i style="animation-duration:7.4s"><b>__E_FISHR__</b></i></div>
      <div class="cr" data-k="f" data-sp="24.2" style="--w:7.0vw;opacity:0.38;filter:blur(0.02px)"><i style="animation-duration:6.8s"><b>__E_FISHR__</b></i></div>
      <div class="cr" data-k="f" data-sp="25.6" style="--w:6.4vw;opacity:0.33;filter:blur(0.23px)"><i style="animation-duration:8.0s"><b>__E_FISHR__</b></i></div>
      <div class="cr" data-k="f" data-sp="17.4" style="--w:5.8vw;opacity:0.28;filter:blur(0.12px)"><i style="animation-duration:5.9s"><b>__E_FISHR__</b></i></div>
      <div class="cr pr" data-k="pr" data-sp="22.6" style="--w:7.8vw;opacity:0.48;filter:blur(0.46px)"><i style="animation-duration:7.6s"><b>__E_PRAWN__</b></i></div>
      <div class="cr pr" data-k="pr" data-sp="26.6" style="--w:6.4vw;opacity:0.36;filter:blur(0.19px)"><i style="animation-duration:8.1s"><b>__E_PRAWN__</b></i></div>
      <div class="cr pr" data-k="pr" data-sp="16.5" style="--w:5.4vw;opacity:0.28;filter:blur(0.15px)"><i style="animation-duration:7.9s"><b>__E_PRAWN__</b></i></div>
      <div class="cr oct" data-k="oct" data-sp="25.9" style="--w:6.6vw;opacity:0.46;filter:blur(0.21px)"><i style="animation-duration:5.8s"><b>__E_OCTO__</b></i></div>
      <div class="cr oct" data-k="oct" data-sp="19.0" style="--w:7.8vw;opacity:0.34;filter:blur(0.10px)"><i style="animation-duration:6.5s"><b>__E_OCTO__</b></i></div>
    <div class="mt" style="width:1.6px;height:1.8px;opacity:0.19" data-sp="8.8"></div>
    <div class="mt" style="width:1.8px;height:1.8px;opacity:0.16" data-sp="9.3"></div>
    <div class="mt" style="width:1.9px;height:2.9px;opacity:0.26" data-sp="5.0"></div>
    <div class="mt" style="width:2.6px;height:2.4px;opacity:0.20" data-sp="11.0"></div>
    <div class="mt" style="width:1.8px;height:1.6px;opacity:0.33" data-sp="6.8"></div>
    <div class="mt" style="width:2.0px;height:2.2px;opacity:0.19" data-sp="10.7"></div>
    <div class="mt" style="width:2.0px;height:2.0px;opacity:0.24" data-sp="7.8"></div>
    <div class="mt" style="width:3.3px;height:3.1px;opacity:0.19" data-sp="5.4"></div>
    <div class="mt" style="width:3.1px;height:3.4px;opacity:0.11" data-sp="9.1"></div>
    <div class="mt" style="width:3.2px;height:2.8px;opacity:0.15" data-sp="9.6"></div>
    <div class="mt" style="width:2.9px;height:1.9px;opacity:0.25" data-sp="5.5"></div>
    <div class="mt" style="width:1.7px;height:2.2px;opacity:0.18" data-sp="6.8"></div>
    <div class="mt" style="width:2.8px;height:3.1px;opacity:0.33" data-sp="10.8"></div>
    <div class="mt" style="width:3.4px;height:3.0px;opacity:0.17" data-sp="5.2"></div>
    <div class="mt" style="width:2.7px;height:2.6px;opacity:0.26" data-sp="4.7"></div>
    <div class="mt" style="width:1.9px;height:3.3px;opacity:0.24" data-sp="8.9"></div>
    <div class="mt" style="width:1.8px;height:2.3px;opacity:0.32" data-sp="8.5"></div>
    <div class="mt" style="width:3.4px;height:2.0px;opacity:0.21" data-sp="9.6"></div>
    <div class="mt" style="width:2.4px;height:3.0px;opacity:0.23" data-sp="4.8"></div>
    <div class="mt" style="width:1.8px;height:3.4px;opacity:0.13" data-sp="5.4"></div>
    <div class="mt" style="width:2.2px;height:2.9px;opacity:0.30" data-sp="7.3"></div>
    <div class="mt" style="width:2.5px;height:3.0px;opacity:0.17" data-sp="6.6"></div>
    <div class="mt" style="width:2.7px;height:2.7px;opacity:0.11" data-sp="4.8"></div>
    <div class="mt" style="width:1.8px;height:2.9px;opacity:0.27" data-sp="10.8"></div>
    <div class="mt" style="width:3.0px;height:2.1px;opacity:0.28" data-sp="10.9"></div>
    <div class="mt" style="width:2.2px;height:1.6px;opacity:0.19" data-sp="6.0"></div>
    <div class="mt" style="width:1.9px;height:1.7px;opacity:0.13" data-sp="10.1"></div>
    <div class="mt" style="width:1.7px;height:2.7px;opacity:0.15" data-sp="5.4"></div>
    <div class="mt" style="width:3.1px;height:2.1px;opacity:0.14" data-sp="7.2"></div>
    <div class="mt" style="width:2.9px;height:2.5px;opacity:0.31" data-sp="6.8"></div>
    <div class="mt" style="width:2.5px;height:2.9px;opacity:0.21" data-sp="9.0"></div>
    <div class="mt" style="width:2.4px;height:1.8px;opacity:0.13" data-sp="9.5"></div>
    <div class="mt" style="width:2.9px;height:3.3px;opacity:0.27" data-sp="8.1"></div>
    <div class="mt" style="width:1.9px;height:3.1px;opacity:0.13" data-sp="7.0"></div>
    <div class="mt" style="width:1.9px;height:2.3px;opacity:0.17" data-sp="7.0"></div>
    <div class="mt" style="width:2.9px;height:2.6px;opacity:0.16" data-sp="9.5"></div>
    <div class="mt" style="width:2.9px;height:3.1px;opacity:0.11" data-sp="8.3"></div>
    <div class="mt" style="width:3.2px;height:2.1px;opacity:0.15" data-sp="9.7"></div>
    <div class="mt" style="width:2.3px;height:2.3px;opacity:0.30" data-sp="6.7"></div>
    <div class="mt" style="width:2.0px;height:2.0px;opacity:0.18" data-sp="8.9"></div>
    <div class="mt" style="width:2.3px;height:3.0px;opacity:0.12" data-sp="5.7"></div>
    <div class="mt" style="width:2.7px;height:2.5px;opacity:0.22" data-sp="10.5"></div>
    <div class="mt" style="width:2.1px;height:1.9px;opacity:0.11" data-sp="7.4"></div>
    <div class="mt" style="width:2.1px;height:2.5px;opacity:0.10" data-sp="4.0"></div>
    <div class="mt" style="width:2.3px;height:3.0px;opacity:0.17" data-sp="10.4"></div>
    <div class="mt" style="width:2.6px;height:2.3px;opacity:0.29" data-sp="5.6"></div>
    <div class="mt" style="width:2.7px;height:3.1px;opacity:0.23" data-sp="6.2"></div>
    <div class="mt" style="width:1.8px;height:2.6px;opacity:0.15" data-sp="6.6"></div>
    <div class="mt" style="width:2.6px;height:3.3px;opacity:0.26" data-sp="7.6"></div>
    <div class="mt" style="width:3.1px;height:2.2px;opacity:0.19" data-sp="8.7"></div>
    <div class="mt" style="width:2.6px;height:2.0px;opacity:0.20" data-sp="9.8"></div>
    <div class="mt" style="width:2.0px;height:2.9px;opacity:0.11" data-sp="10.7"></div>
    <div class="mt" style="width:2.8px;height:2.2px;opacity:0.34" data-sp="9.6"></div>
    <div class="mt" style="width:1.7px;height:2.0px;opacity:0.22" data-sp="11.0"></div>
    <div class="mt" style="width:1.9px;height:1.7px;opacity:0.18" data-sp="4.3"></div>
    <div class="mt" style="width:2.3px;height:2.6px;opacity:0.21" data-sp="5.0"></div>
    <div class="mt" style="width:1.6px;height:3.0px;opacity:0.21" data-sp="7.4"></div>
    <div class="mt" style="width:2.5px;height:2.8px;opacity:0.32" data-sp="9.8"></div>
    <div class="mt" style="width:2.9px;height:2.2px;opacity:0.14" data-sp="4.6"></div>
    <div class="mt" style="width:3.1px;height:1.7px;opacity:0.24" data-sp="10.4"></div>
    <div class="mt" style="width:2.2px;height:2.3px;opacity:0.20" data-sp="10.6"></div>
    <div class="mt" style="width:2.8px;height:3.1px;opacity:0.11" data-sp="9.1"></div>
    <div class="mt" style="width:2.4px;height:2.3px;opacity:0.30" data-sp="9.1"></div>
    <div class="mt" style="width:3.2px;height:2.9px;opacity:0.32" data-sp="7.0"></div>
  </div>
  <div class="wave" aria-hidden="true">
    <svg viewBox="0 0 1000 1000" style="animation-duration:19s;animation-delay:-0s"><path d="__WV0__"/></svg>
    <svg viewBox="0 0 1000 1000" style="animation-duration:19s;animation-delay:-6.3s"><path d="__WV1__"/></svg>
    <svg viewBox="0 0 1000 1000" style="animation-duration:19s;animation-delay:-12.6s"><path d="__WV2__"/></svg>
    <svg viewBox="0 0 1000 1000" style="animation-duration:26s;animation-delay:-9s"><path d="__WV3__"/></svg>
  </div>
  <div class="txt">
    <div class="emblem rot">
      <div class="dome">
        <div class="dial">__ROSE_MECH__</div>
        <div class="core">__E_FISH__</div>
      </div>
      <div class="base"></div>
      <div class="name">
        <span class="vaj">Vajana</span>
        <span class="lb">by La Bohème</span>
      </div>
    </div>
    <div class="eyebrow">Restorant plazhi · Gjiri i Vlorës</div>
    <h1 class="lines">
      <span class="ln"><span>Nga deti te zjarri,</span></span>
      <span class="ln"><span><em>mbi gjirin e Vlorës.</em></span></span>
    </h1>
    <div class="hrule reveal"></div>
    <p class="reveal">Zgjidhni peshkun tuaj, peshohet para jush dhe shkon në zgare. Tridhjetë e nëntë etiketa vere. Hapur çdo ditë nga ora tetë deri në mesnatë.</p>
    <div class="btns reveal">
      <a class="btn solid" href="#">Rezervo tavolinë</a>
      <a class="btn" href="#menu">Shiko menunë</a>
    </div>
  </div>
  <div class="panel reveal">
    <img src="__CARP__" alt="Tavolinë e shtruar përballë gjirit">
    <div class="cap">Tarraca · përballë gjirit</div>
  </div>
</div>

<div class="sep hero-sep"><div class="orn reveal"><i></i>__E_FLEURON__<i></i></div></div>

<section style="padding-top:0;padding-bottom:0">
  <div class="wmrose" data-px=".20" style="right:-10%;top:-6%;width:min(42vw,520px)"><div class="embmark"><div class="dome"><div class="dial">__ROSE_MECH_SM__</div><div class="core">__E_FISH__</div></div></div></div>
  <div class="wrap">
    <div class="eyebrow reveal">Atmosfera</div>
    <h2 class="lines" style="max-width:16ch"><span class="ln"><span>DJ çdo ditë</span></span><span class="ln"><span>nga mesdita.</span></span></h2>
    <p class="reveal">Shezlongë deri te uji, tavolina nën hije, muzikë deri natën.</p>
  </div>
</section>

<section style="padding:clamp(30px,3.4vw,52px) 0 0">
  <div class="day">
    <figure class="c reveal" style="margin:0"><img data-px=".10" src="__DAY__" alt="DJ mbi gjirin">
      <figcaption><div class="s">13:00</div><div class="t">Muzika</div></figcaption></figure>
    <figure class="c reveal" style="margin:0"><img data-px=".10" src="__SPRITZ__" alt="Shezlongët përballë detit">
      <figcaption><div class="s">17:00</div><div class="t">Shezlongët</div></figcaption></figure>
    <figure class="c reveal" style="margin:0"><img data-px=".10" src="__NIGHT__" alt="Dy gota në perëndim">
      <figcaption><div class="s">20:00</div><div class="t">Ora e artë</div></figcaption></figure>
  </div>
</section>

<div class="chapter" aria-hidden="false">
  <i class="rule"></i>
  <div class="mid">
    <div class="embmark">
      <div class="dome"><div class="dial">__ROSE_MECH_SM__</div>
        <div class="core">__E_FISH__</div></div>
      <div class="base"></div>
    </div>
    <div class="label">Restoranti</div>
  </div>
  <i class="rule"></i>
</div>

<!-- ============ KITCHEN ============ -->
<section id="kitchen">
  <div class="wrap split">
    <div class="im reveal" style="aspect-ratio:4/5"><img data-px=".13" src="__CHEF__" alt="Gabriel Islami"></div>
  <div class="txt">
      <div class="eyebrow reveal">Kuzhina</div>
      <h2 class="reveal" style="margin-bottom:8px">Gabriel Islami</h2>
      <div class="role reveal">Executive Chef</div>
      <p class="reveal" style="font-family:var(--d);font-size:21px;line-height:1.6;color:var(--bone)">
        „Përbërësit më të mirë vendas, dhe shija e vërtetë e freskët të flasë vetë.”</p>
      <p class="reveal">Tetë pjata të gjalla e mbajnë atë fjalë. Karpaço, tartar, çeviçe, açuge. Peshku i papjekur nuk fal asgjë.</p>
      <p class="reveal">Ç'ka mbetet shkon në zgare. Thikë, limon, vaj ulliri, cipolinë. Kaq.</p>
      <div class="btns reveal"><a class="btn" href="#menu">Shiko menunë</a></div>
    </div>
  </div>
</section>

<div class="prule"></div>

<div class="prule"></div>

<section style="padding-bottom:0">
  <div class="wrap" style="text-align:center">
    <div class="eyebrow reveal" style="justify-content:center">Tre pjata</div>
    <h2 class="reveal" style="font-size:clamp(26px,3.4vw,40px);color:#FFFFFF">Tre pjata e mbajnë emrin<br>La Bohème</h2>
    <p class="reveal" style="margin:0 auto;color:#FFFFFF;opacity:.85">Një hyrje, një sallatë, një ëmbëlsirë.</p>
    <div class="sigs">
      <div class="sig reveal"><div class="embmark" style="width:92px">
        <div class="dome"><div class="dial">__ROSE_S1__</div>
          <div class="core">__E_FISH__</div></div>
        <div class="base"></div>
      </div>
        <div class="sig-n">Catalana në Stilin La Bohème</div>
        <div class="sig-d">Frutat e detit të papjekura, mbi akull. 15 000 lekë/kg</div></div>
      <div class="sig reveal"><div class="embmark" style="width:92px">
        <div class="dome"><div class="dial">__ROSE_S2__</div>
          <div class="core">__E_FISH__</div></div>
        <div class="base"></div>
      </div>
        <div class="sig-n">Sallata La Bohème</div>
        <div class="sig-d">Jeshile, avokado, salmon, bajame. 1 200 lekë</div></div>
      <div class="sig reveal"><div class="embmark" style="width:92px">
        <div class="dome"><div class="dial">__ROSE_S3__</div>
          <div class="core">__E_FISH__</div></div>
        <div class="base"></div>
      </div>
        <div class="sig-n">La Bohème</div>
        <div class="sig-d">Çokollatë, karamel, fruta tropikale. 800 lekë</div></div>
    </div>
  </div>
</section>

<!-- ============ THE CARTE ============ -->
<section class="paper" id="menu">
  <div class="wmrose" data-px=".14" style="left:-13%;top:2%;width:min(34vw,420px)"><div class="embmark"><div class="dome"><div class="dial">__ROSE_MECH_SM__</div><div class="core">__E_FISH__</div></div></div></div>
  <div class="tabs">
    <span class="on">À la carte</span><span>Verërat</span><span>Ëmbëlsira</span>
  </div>
  <div class="sheet reveal">
    <div class="pmark">La Bohème<small>Vajana · Vlorë</small></div>
    <div class="orn2"><i></i><i></i><b></b><i></i><i></i></div>

    <div class="mgroup">
      <h3>Crudo</h3>
      <div class="note">i ftohtë, i prerë në moment</div>
      <div class="item">
        <div class="row"><span class="n">Carpaccio Levreku</span><span class="dots"></span><span class="p">1400</span></div>
        <div class="d">Finok, limon, ullinj Taggiasca, vinegret limoni dhe cipolinë</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Tartar Levreku</span><span class="dots"></span><span class="p">1400</span></div>
        <div class="d">Ullinj Taggiasca, domate të thata dhe cipolinë</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Catalana në Stilin La Bohème</span><span class="dots"></span><span class="p">15 000 / kg</span></div>
        <div class="d">Frutat e detit, të hapura mbi akull</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Açuge të Marinuara</span><span class="dots"></span><span class="p">900</span></div>
        <div class="d">Hudhër, majdanoz, vaj ulliri dhe lëkurë limoni</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Ceviche me Fruta Deti</span><span class="dots"></span><span class="p">1800</span></div>
        <div class="d">Oktapod, sepje, viola, finok, qepë dhe vinegret</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Ostrika Gillardeau</span><span class="dots"></span><span class="p">800 / copë</span></div>
      </div>
    </div>

    <div class="orn2"><i></i><i></i><b></b><i></i><i></i></div>

    <div class="mgroup">
      <h3>Nga Zgarja</h3>
      <div class="note">tre përbërës, jo më shumë</div>
      <div class="item">
        <div class="row"><span class="n">Oktapod i Pjekur me Patate Vjollcë</span><span class="dots"></span><span class="p">1400</span></div>
        <div class="d">Ullinj Taggiasca dhe domate të thata</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Misto Zgarë &amp; Emulsion Mesdhetar</span><span class="dots"></span><span class="p">2700</span></div>
        <div class="d">Sepje, kallamar, viola, speca Padrón dhe patate baby</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Kallamar Crispy &amp; Aioli</span><span class="dots"></span><span class="p">1300</span></div>
        <div class="d">Hudhër, limon dhe majonezë</div>
      </div>
      <div class="item">
        <div class="row"><span class="n">Fileto Peshku</span><span class="dots"></span><span class="p">2500</span></div>
        <div class="d">Pure patatesh, asparag dhe karrota të karamelizuara</div>
      </div>
    </div>

    <div class="orn2"><i></i><i></i><b></b><i></i><i></i></div>

    <div class="mgroup">
      <h3>Verërat</h3>
      <div class="note">tridhjetë e nëntë etiketa mbi rërë</div>
      <div class="wine"><span class="n">Gaja Barbaresco</span><span class="dots"></span><span class="p">45 000</span></div>
      <div class="wine"><span class="n">Luce</span><span class="dots"></span><span class="p">25 000</span></div>
      <div class="wine"><span class="n">Roossj-Bass Langhe Gaja</span><span class="dots"></span><span class="p">20 000</span></div>
      <div class="wine"><span class="n">Terre Alte Livio Felluga</span><span class="dots"></span><span class="p">18 000</span></div>
      <div class="wine"><span class="n">Philipponnat Champagne</span><span class="dots"></span><span class="p">15 000</span></div>
      <div class="wine"><span class="n">Brunello di Montalcino</span><span class="dots"></span><span class="p">12 000</span></div>
      <div class="wine"><span class="n">Amarone della Valpolicella</span><span class="dots"></span><span class="p">8 000</span></div>
      <div class="wine"><span class="n">Chablis</span><span class="dots"></span><span class="p">6 000</span></div>
    </div>

    <div class="closing">
      <div class="bon">të bëftë mirë</div>
      <div class="al">Ju lutemi na tregoni për çdo alergji,<br>dhe kuzhina do të kujdeset për ju.</div>
    </div>
  </div>
  <div class="fullmenu">
    <a class="btn" href="#">Menuja e plotë</a>
  </div>
</section>

<!-- ============ THE CATCH ============ -->
<section id="catch">
  <div class="plate" data-px=".26" style="left:-8%;bottom:2%;width:min(44vw,560px);transform:rotate(5deg)">__E_FISH__</div>
  <div class="wrap split">
  <div class="txt">
      <div class="eyebrow reveal">Peshku i ditës</div>
      <h2 class="lines"><span class="ln"><span>Peshku zgjidhet,</span></span><span class="ln"><span>nuk porositet</span></span></h2>
      <p class="reveal">Ejani te akulli dhe zgjidhni vetë. Ne e peshojmë para jush dhe shkon në zgare.</p>
      <ul class="specs reveal">
        <li>Dental <span style="float:right;color:var(--shell)">9 000 L/kg</span></li>
        <li>Koce <span style="float:right;color:var(--shell)">8 000 L/kg</span></li>
        <li>Skorfio <span style="float:right;color:var(--shell)">6 700 L/kg</span></li>
        <li>Levrek <span style="float:right;color:var(--shell)">6 500 L/kg</span></li>
        <li>Rufjo <span style="float:right;color:var(--shell)">6 200 L/kg</span></li>
        <li>Barbun <span style="float:right;color:var(--shell)">5 500 L/kg</span></li>
        <li>Aragostë <span style="float:right;color:var(--shell)">15 000 L/kg</span></li>
        <li>Gjinkalla deti <span style="float:right;color:var(--shell)">14 500 L/kg</span></li>
      </ul>
    </div>
    <div class="im reveal"><img data-px=".13" src="__CATCH__" alt="Peshku mbi akull"></div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap split rev">
  <div class="txt">
      <div class="eyebrow reveal">E gjallë</div>
      <h2 class="reveal">Aragostë dhe<br>gjinkalla deti</h2>
      <p class="reveal">Të mbajtura në ujë deri në momentin që i zgjidhni.</p>
    </div>
    <div class="im reveal"><img data-px=".13" src="__LOBSTER__" alt="Aragostë"></div>
  </div>
</section>

<!-- ============ CELLAR ============ -->
<section class="cellar" id="cellar">
  <div class="wmrose" data-px="-.18" style="right:-6%;top:-22%;width:min(30vw,380px)"><div class="embmark"><div class="dome"><div class="dial">__ROSE_MECH_SM__</div><div class="core">__E_FISH__</div></div></div></div>
  <div class="wrap">
    <div class="eyebrow reveal">Verërat</div>
    <h2 class="reveal" style="max-width:18ch">Tridhjetë e nëntë etiketa</h2>
    <p class="reveal">Dhjetë të kuqe, njëzet e katër të bardha, pesë shkumëzuese. Gjysma shishe për tavolinat e vogla.</p>
    <div class="loop reveal"><div class="ltrack"><div class="house"><span class="hn">Gaja</span><span class="hp">Barbaresco · Piemonte</span></div><div class="house"><span class="hn">Luce della Vite</span><span class="hp">Montalcino · Toscana</span></div><div class="house"><span class="hn">Livio Felluga</span><span class="hp">Rosazzo · Friuli</span></div><div class="house"><span class="hn">Philipponnat</span><span class="hp">Mareuil-sur-Aÿ · Champagne</span></div><div class="house"><span class="hn">Bellavista</span><span class="hp">Erbusco · Franciacorta</span></div><div class="house"><span class="hn">Ceretto</span><span class="hp">Alba · Piemonte</span></div><div class="house"><span class="hn">Cantina Terlano</span><span class="hp">Terlano · Alto Adige</span></div><div class="house"><span class="hn">Castello del Terriccio</span><span class="hp">Castagneto · Toscana</span></div><div class="house"><span class="hn">Gaja</span><span class="hp">Barbaresco · Piemonte</span></div><div class="house"><span class="hn">Luce della Vite</span><span class="hp">Montalcino · Toscana</span></div><div class="house"><span class="hn">Livio Felluga</span><span class="hp">Rosazzo · Friuli</span></div><div class="house"><span class="hn">Philipponnat</span><span class="hp">Mareuil-sur-Aÿ · Champagne</span></div><div class="house"><span class="hn">Bellavista</span><span class="hp">Erbusco · Franciacorta</span></div><div class="house"><span class="hn">Ceretto</span><span class="hp">Alba · Piemonte</span></div><div class="house"><span class="hn">Cantina Terlano</span><span class="hp">Terlano · Alto Adige</span></div><div class="house"><span class="hn">Castello del Terriccio</span><span class="hp">Castagneto · Toscana</span></div></div></div>
  </div>
</section>

<section style="padding-top:clamp(52px,6vw,96px)">
  <div class="wrap split">
    <div class="reveal frame"><img data-px=".13" src="__WINE__" alt="Vera e mbrëmjes"></div>
  <div class="txt">
      <div class="eyebrow reveal">Në tavolinë</div>
      <h2 class="reveal">Hapet para jush</h2>
      <p class="reveal">Zgjidhni etiketën. Hapet në tavolinë. Nëse nuk dini nga t'ia nisni, pyesni sommelierin.</p>
    </div>
  </div>
</section>

<!-- ============ EVENINGS ============ -->
<div class="ev" id="evenings">
  <div class="bg"><img data-px="-.16" src="__TABLE__" alt="Tarraca në mbrëmje"></div>
  <div class="amb"></div>
  <div class="evin">
    <div class="eyebrow reveal">Mbrëmje dhe festa</div>
    <h2 class="reveal" style="max-width:20ch">Tavolina të gjata<br>pranë ujit</h2>
    <p class="reveal">Ditëlindje, dasma të vogla, darka pune, mbrëmje me miq. Muzikë, dhe kuzhina në dispozicionin tuaj.</p>
    <p class="reveal">Na shkruani datën dhe numrin e personave. Përgjigjemi po atë ditë.</p>
    <div class="btns reveal">
      <a class="btn solid" href="#">Organizo një mbrëmje</a>
      <a class="btn" href="#">WhatsApp</a>
    </div>
  </div>
</div>

<!-- ============ STORY ============ -->
<section id="story">
  <div class="deepfish">__E_FISH__</div>
  <div class="wmrose" data-px=".16" style="left:-8%;top:6%;width:min(28vw,340px)"><div class="embmark"><div class="dome"><div class="dial">__ROSE_MECH_SM__</div><div class="core">__E_FISH__</div></div></div></div>
  <div class="wmrose" data-px="-.2" style="right:-9%;bottom:8%;width:min(26vw,320px)"><div class="embmark"><div class="dome"><div class="dial">__ROSE_MECH_SM__</div><div class="core">__E_FISH__</div></div></div></div>
  <div class="story">
    <div class="embmark" style="width:168px;margin:0 auto 30px"><div class="dome"><div class="dial">__ROSE_MECH_SM__</div><div class="core">__E_FISH__</div></div><div class="base"></div></div>
    <div class="eyebrow reveal">La Bohème</div>
    <p class="lead reveal">Emri ka qenë gjithmonë kujtim për diçka që nuk është më.</p>
    <p class="reveal dropcap" style="text-align:left">Në Paris, rreth vitit 1840, të rinjtë që pikturonin dhe shkruanin nuk kishin para. Kishin dhoma të ftohta nën çati dhe mbrëmje të gjata nëpër kafene. Francezët i quajtën <em>bohémiens</em>, fjalë që dikur do të thoshte thjesht i huaj, dikush që vjen nga larg.</p>
    <p class="reveal">Henri Murger shkroi për ta në 1851. Puccini e ktheu në opera në 1896. Aznavour i këndoi lamtumirën në 1965, kur ai Paris kishte ikur prej kohësh.</p>
    <p class="reveal">Vajana është një peshk që këto ujëra nuk e mbajnë më. Ne e morëm emrin e tij për këtë vend.</p>
    <p class="reveal" style="color:var(--bone)">Emrat tanë u përkasin gjërave që kanë ikur. Mbrëmja që keni përpara është ende këtu, dhe ne e mbajmë të gjatë sa të mundemi.</p>
    <div class="easel reveal"><img data-px=".13" src="__EASEL__" alt="Piktura mbi kavalet"></div>
    <div class="cap">Vlorë, korrik</div>

  </div>
</section>

<div class="sep"><div class="orn reveal"><i></i>__E_FLEURON__<i></i></div></div>

<footer>
  <div class="fgrid">
    <div>
      <div class="mark" style="font-size:28px">LA BOHÈME<span class="b">Vajana · Vlorë</span></div>
    </div>
    <div>
      <h4>Adresa</h4>
      <p>SH8, Vlorë 9401<br>Shqipëri</p>
      <h4 style="margin-top:26px">Orari</h4>
      <p>Çdo ditë · 8:00 — 24:00</p>
    </div>
    <div>
      <h4>Rezervime</h4>
      <p><a href="tel:+355699845030">+355 69 984 5030</a><br>
      <a href="#">WhatsApp</a><br>
      <a href="#">Instagram</a></p>
      <h4 style="margin-top:26px">Lokalet</h4>
      <p>Vajana · Vlorë</p>
    </div>
  </div>
</footer>

<div class="bar">
  <a href="tel:+355699845030">Telefono</a>
  <a class="w" href="#">Rezervo në WhatsApp</a>
</div>

<script>
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the emblem opens the page, then travels to its place */
  (function(){
    var e=document.getElementById('entrance');
    var em=document.querySelector('.emblem');
    var hero=document.querySelector('.hero');
    if(!e||!em||!hero) return;
    function land(){ hero.classList.add('landed'); }
    if(RM||sessionStorage.getItem('vj-seen')||location.hash){
      e.style.display='none'; land(); return;
    }
    sessionStorage.setItem('vj-seen','1');
    var r=em.getBoundingClientRect();
    var dx=innerWidth/2-(r.left+r.width/2);
    var dy=innerHeight/2-(r.top+r.height/2);
    var s=Math.max(1, Math.min(1.9,(innerHeight*0.60)/Math.max(1,r.height)));
    em.classList.add('intro');
    em.style.transition='none';
    em.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px) scale('+s.toFixed(3)+')';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      em.style.transition='transform 2.6s cubic-bezier(.22,1,.26,1)';
      em.style.transform='none';
      setTimeout(function(){ e.classList.add('gone'); }, 620);
      setTimeout(land, 1500);
      setTimeout(function(){
        em.classList.remove('intro');
        em.style.transition=''; em.style.transform='';
        e.style.display='none';
      }, 2900);
    });});
  })();

  /* reveals */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target) } })
  },{threshold:.14, rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal,.lines,.im,.easel,.day .c').forEach(function(n){ io.observe(n) });

  /* parallax: one rAF loop, transform only, desktop only */
  var px = [].slice.call(document.querySelectorAll('[data-px]'));
  var wide = innerWidth > 820, ticking = false;
  function frame(){
    var vh = innerHeight;
    px.forEach(function(n){
      var host = n.classList.contains('plate') ? n : n.parentNode;
      var r = host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var mid = (r.top + r.height/2 - vh/2) / vh;
      n.style.transform = (n.dataset.rot||'') + ' translate3d(0,' + (mid * parseFloat(n.dataset.px) * 100).toFixed(2) + 'px,0)';
    });
    ticking = false;
  }
  function onScroll(){ if(!ticking && wide && !RM){ ticking = true; requestAnimationFrame(frame) } }
  px.forEach(function(n){
    var t = getComputedStyle(n).transform;
    if (n.classList.contains('plate')) { n.dataset.rot = (t && t !== 'none') ? t : ''; }
    else n.dataset.rot = '';
  });
  if (wide && !RM) { addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', function(){ wide = innerWidth>820; onScroll() }); frame() }



  /* ---- depth engine ----
     Attenuation coefficients loosely follow seawater absorption: red goes
     first, blue last. Everything is driven off one scroll fraction. */
  var root=document.documentElement, water=document.getElementById('water'),
      dep=document.getElementById('dep'), MAXD=54;
  function mix(a,b,t){return a.map(function(v,i){return Math.round(v+(b[i]-v)*t)})}
  function rgb(c){return 'rgb('+c[0]+','+c[1]+','+c[2]+')'}
  /* every colour on the page is a stop on the same descent */
  function ramp(stops,d){
    for(var i=1;i<stops.length;i++){
      if(d<=stops[i][0]||i===stops.length-1){
        var a=stops[i-1],c=stops[i];
        var t=Math.max(0,Math.min(1,(d-a[0])/(c[0]-a[0]||1)));
        return mix(a[1],c[1],t);
      }
    }
    return stops[0][1];
  }
  /* a few metres down, sunlight still in the water, going to the dark */
  var GROUND=[[0,[24,64,84]],[8,[19,53,71]],[18,[14,41,57]],
              [30,[10,29,43]],[42,[6,18,28]],[54,[3,10,16]]];
  /* the ornament is dark ink at the surface and gold once the light has gone,
     because a gold hairline is invisible on pale water and a dark one is
     invisible in the deep */
  /* red is the first wavelength the sea takes and blue the last, so the whole
     accent system runs warm orange at the top to cold blue-white at the bottom */
  /* the logo ground is #482720, luminance 0.19 — darker than the water itself, so
     it cannot be used as text on the page. The hue (11°) is kept and the value
     lifted until it separates: same pigment, seen in light. */
  var LAMPR=[[0,[222,133,115]],[10,[218,146,130]],[22,[196,182,178]],
             [34,[162,192,210]],[46,[200,224,238]],[54,[228,241,248]]];
  var ACCR =[[0,[232,120,96]],[12,[226,138,116]],[26,[190,186,186]],
             [40,[200,224,236]],[54,[226,240,248]]];
  var BONER=[[0,[246,235,222]],[24,[240,238,234]],[54,[228,241,249]]];
  var BODYR=[[0,[232,218,203]],[24,[224,228,230]],[54,[206,226,238]]];
  var SHELR=[[0,[188,132,88]],[24,[164,158,152]],[54,[142,172,190]]];
  function depth(){
    var h=document.body.scrollHeight-innerHeight;
    var f=h>0?Math.min(1,Math.max(0,scrollY/h)):0;
    var d=f*MAXD;
    root.style.setProperty('--depth',d.toFixed(1));

    root.style.setProperty('--ground',rgb(ramp(GROUND,d)));
    root.style.setProperty('--lamp',rgb(ramp(LAMPR,d)));
    root.style.setProperty('--acc',rgb(ramp(ACCR,d)));
    root.style.setProperty('--bone',rgb(ramp(BONER,d)));
    root.style.setProperty('--body',rgb(ramp(BODYR,d)));
    root.style.setProperty('--shell',rgb(ramp(SHELR,d)));
    var tg=Math.min(1,d/MAXD);

    /* the type hands over once, and it happens behind the carte: while the cream
       sheet fills the viewport the switch is invisible, because the menu carries
       its own dark-on-paper typography either way. Tied to the element rather
       than to a depth number so it stays true if the page grows. */


    /* below thirty metres the vajana resolves out of the dark */
    root.style.setProperty('--deep',Math.max(0,Math.min(.42,(d-30)/46)).toFixed(3));

    /* photographs lose saturation and warmth the way they would underwater */
    var sat=(1-tg*0.22).toFixed(3), br=(1.04-tg*0.26).toFixed(3);
    root.style.setProperty('--imgfx','saturate('+sat+') brightness('+br+')');

    if(dep)dep.textContent=Math.round(d);
    sinker(d);
  }
  addEventListener('scroll',depth,{passive:true});
  addEventListener('resize',depth); depth();

  /* ---- swimmers ----
     Each creature holds a heading and a cruising speed and wanders slowly off it.
     The rosette applies an outward force that falls off with distance, so they
     are pushed aside as they pass rather than pulled in. Wrapping keeps the
     frame populated instead of slowly emptying. */
  (function(){
    var sea=document.getElementById('sea');
    if(!sea||RM)return;
    var els=[].slice.call(sea.querySelectorAll('.cr,.mt'));
    if(!els.length)return;
    var W=0,H=0,ox=0,oy=0,HOLE=140,ECX=0,ECY=0,ERX=200,ERY=180,P=[];
    /* mirrors the CSS on #sea .wave svg: each front expands from --s0 to 1 over
       its own duration. Reading the radius back off the DOM would return the
       animated matrix, so the phase is recomputed here instead. */
    var WAVES=[{d:19,off:0},{d:19,off:6.3},{d:19,off:12.6},{d:26,off:9}];
    var S0=0.26;
    function measure(){
      var r=sea.getBoundingClientRect(); W=r.width; H=r.height;
      /* the origin is the emblem's baseline centre, measured rather than guessed,
         so the water and the mark can never drift apart at any viewport */
      var dome=document.querySelector('.dome');
      if(dome){
        /* offsetLeft/offsetTop are layout values and ignore transforms, so the
           origin stays right while the emblem is still travelling in */
        function off(el){var x=0,y=0;while(el){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent;}return[x,y];}
        var od=off(dome), os=off(sea);
        ox=od[0]-os[0]+dome.offsetWidth/2; oy=od[1]-os[1]+dome.offsetHeight;
        HOLE=dome.offsetWidth/2*1.02;
        sea.style.setProperty('--hole',(emb0?emb0:dome.offsetWidth)*0.78+'px');
        var emb=document.querySelector('.emblem');
        var emb0=emb?emb.offsetWidth:0;
        if(emb){
          var oe=off(emb);
          ECX=oe[0]-os[0]+emb.offsetWidth/2;
          ECY=oe[1]-os[1]+emb.offsetHeight/2;
          ERX=emb.offsetWidth/2*1.05;
          ERY=emb.offsetHeight/2*1.07;
        }
        sea.style.setProperty('--ox',ox.toFixed(1)+'px');
        sea.style.setProperty('--oy',oy.toFixed(1)+'px');
        var heroEl=document.querySelector('.hero');
        if(heroEl){ heroEl.style.setProperty('--ox',ox.toFixed(1)+'px');
                    heroEl.style.setProperty('--oy',oy.toFixed(1)+'px'); }
        /* start each ripple at the dome's own radius. The wave svg is 70vw wide,
           so its untransformed radius is 0.35 * viewport width; measuring it with
           getBoundingClientRect would return the animated scale instead. */
        var s0=Math.min(.55,Math.max(.10,(dome.offsetWidth/2)/(innerWidth*0.35)));
        sea.style.setProperty('--s0',s0.toFixed(3));
        if(heroEl) heroEl.style.setProperty('--s0',s0.toFixed(3));
        S0=s0;   /* the loop and the CSS must agree on where a front begins */
      } else { ox=W*0.36; oy=H*0.255; HOLE=Math.min(W,H)*0.16;
               ECX=ox; ECY=oy; ERX=HOLE; ERY=HOLE; }
    }
    function init(){
      measure();
      P=els.map(function(el,i){
        var a=Math.random()*Math.PI*2;
        var sp=parseFloat(el.dataset.sp)||20;
        var mote=el.classList.contains('mt');
        var kind=el.dataset.k||'m';
        var dir=Math.random()<0.5?-1:1;
        if(kind==='f'){ a=dir>0?0:Math.PI; }
        else if(kind==='oct'){ a=-Math.PI/2; }
        return {el:el,k:kind,mote:mote,dir:dir,
          x:W*0.05+Math.random()*W*0.60, y:H*0.05+Math.random()*H*0.66,
          vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
          sp:sp, w:el.offsetWidth||(mote?3:60), h:el.offsetHeight||(mote?3:26),
          wob:Math.random()*Math.PI*2, wsp:0.10+Math.random()*0.14, rot:null,
          spin:(Math.random()<0.5?-1:1)};
      });
    }
    var last=0;
    function step(t){
      var dt=Math.min(0.05,(t-last)/1000)||0; last=t;
      for(var i=0;i<P.length;i++){
        var p=P[i];
        /* wander: slow heading drift so nothing swims in a straight line */
        p.wob+=p.wsp*dt*(p.mote?0.4:1);
        var a=Math.atan2(p.vy,p.vx)+Math.sin(p.wob)*0.16*dt;
        var s=Math.hypot(p.vx,p.vy)||p.sp;
        p.vx=Math.cos(a)*s; p.vy=Math.sin(a)*s;
        /* every passing front gives an outward shove as it goes by, so the
           animals ride the waves instead of ignoring them */
        var maxR=innerWidth*0.35, wf=0;
        for(var q=0;q<WAVES.length;q++){
          var ph=(((t/1000)+WAVES[q].off)%WAVES[q].d)/WAVES[q].d;
          var Rw=(S0+(1-S0)*ph)*maxR;
          var band=maxR*0.17;
          var u=(Math.hypot(p.x-ox,p.y-oy)-Rw)/band;
          if(u>-2.6&&u<2.6) wf+=Math.exp(-u*u)*(1-ph*0.40);
        }
        wf=Math.min(1.8,wf);

        /* the rosette pushes outward, falling off with distance */
        var dx=p.x-ox, dy=p.y-oy, d=Math.hypot(dx,dy)||1;
        if(wf>0.02){
          var wi=wf*(p.mote?520:260)*dt;
          p.vx+=(dx/d)*wi; p.vy+=(dy/d)*wi;
        }
        /* the emblem refuses contact. The field is measured in ellipse space, so
           it matches the shape of the mark: um is 1 on its edge, 2 a full mark
           away. Strength climbs as an inverse square of the gap, so a creature is
           turned long before it arrives and the hard clamp below never fires. */
        var rpad=(p.mote?3:p.w*0.55+6);
        var frx=ERX+rpad, fry=ERY+rpad;
        var fx=(p.x-ECX)/frx, fy=(p.y-ECY)/fry;
        var fm=Math.hypot(fx,fy)||1e-4;
        if(fm<3.4){
          var gx=fx/frx, gy=fy/fry, gl=Math.hypot(gx,gy)||1; gx/=gl; gy/=gl;
          var gap=Math.max(0.14, fm-0.86);
          var mag=Math.min(p.mote?4200:5200, (p.mote?360:520)/(gap*gap));
          p.vx+=gx*mag*dt; p.vy+=gy*mag*dt;
          /* a little sideways, so it slips past the mark instead of bouncing
             straight back off it */
          var sp2=(p.spin||1)*0.26;
          p.vx+=-gy*mag*sp2*dt; p.vy+=gx*mag*sp2*dt;
        }
        /* the basin: the part of the column that is actually visible once the
           horizontal and vertical masks are accounted for. Soft walls turn things
           back well before the edge, so nothing ever leaves and nothing has to be
           teleported back in. */
        var bx0=W*0.03, bx1=W*0.67, by0=H*0.03, by1=H*0.72;
        var wallK=(p.mote?1.4:2.4);
        if(p.x<bx0) p.vx+=(bx0-p.x)*wallK*dt;
        else if(p.x>bx1) p.vx-=(p.x-bx1)*wallK*dt;
        if(p.y<by0) p.vy+=(by0-p.y)*wallK*dt;
        else if(p.y>by1) p.vy-=(p.y-by1)*wallK*dt;

        /* ease back toward cruising speed and drop the push once clear */
        s=Math.hypot(p.vx,p.vy);
        var ns=s+(p.sp-s)*Math.min(1,0.55*dt);
        /* a shove is felt for a while, but repeated fronts must not keep adding
           energy until everything is flung off the canvas */
        ns=Math.min(ns, p.sp*3.4);
        p.vx=p.vx/s*ns; p.vy=p.vy/s*ns;
        /* species constraints, applied after the forces so the field can still
           deflect them without ever turning a fish around or sinking an octopus */
        if(p.k==='f'){
          /* level far from the emblem, free to climb close to it, so a fish can
             actually swim around the rosette instead of pressing against it */
          var near=Math.max(Math.min(1,wf*0.8), Math.max(0,1-d/(HOLE*2.1)));
          p.vy*=0.90+0.09*near;
          var capy=(0.22+1.30*near)*Math.abs(p.vx);
          if(Math.abs(p.vy)>capy) p.vy=capy*(p.vy<0?-1:1);
          /* the front can overpower a fish and drive it the other way. Rather
             than swim backwards it turns, with a deadband so the facing does not
             flicker while it is being pushed through zero. */
          if(p.vx>5) p.dir=1; else if(p.vx<-5) p.dir=-1;
        } else if(p.k==='oct'){
          p.vx*=0.92;
          p.vy=-Math.abs(p.vy);
          var capx=0.28*Math.abs(p.vy);
          if(Math.abs(p.vx)>capx) p.vx=capx*(p.vx<0?-1:1);
        }
        if(!p.mote && p.k==='f') p.vx+=p.dir*p.sp*0.38*dt;   /* thrust */
        p.x+=p.vx*dt; p.y+=p.vy*dt;

        /* nothing ever touches the emblem. The exclusion is an ellipse around
           the whole mark, wordmark included, expanded by the creature's own half
           width so a bounding box never overlaps it. Anything inside is placed on
           the boundary and has the inward part of its velocity removed, so it
           slides around rather than stopping dead. */
        var pad=(p.mote?3:p.w*0.55+6);
        var erx=ERX+pad, ery=ERY+pad;
        var ux=(p.x-ECX)/erx, uy=(p.y-ECY)/ery;
        var um=Math.hypot(ux,uy)||1e-4;
        if(um<1){
          p.x=ECX+(ux/um)*erx; p.y=ECY+(uy/um)*ery;
          var gx=ux/erx, gy=uy/ery, gl=Math.hypot(gx,gy)||1;
          gx/=gl; gy/=gl;
          var vn=p.vx*gx+p.vy*gy;
          if(vn<0){ p.vx-=vn*gx; p.vy-=vn*gy; }
        }

        /* hard stop at the basin edge, in case a front overpowers the wall */
        var ex=W*0.78, ey=H*0.83;
        if(p.x<-W*0.04){p.x=-W*0.04; if(p.vx<0)p.vx=-p.vx*0.4;}
        else if(p.x>ex){p.x=ex; if(p.vx>0)p.vx=-p.vx*0.4;}
        if(p.y<-H*0.03){p.y=-H*0.03; if(p.vy<0)p.vy=-p.vy*0.4;}
        else if(p.y>ey){p.y=ey; if(p.vy>0)p.vy=-p.vy*0.4;}
        if(p.mote){
          p.el.style.transform='translate3d('+(p.x-p.w/2).toFixed(1)+'px,'+(p.y-p.h/2).toFixed(1)+'px,0)';
        } else {
          /* a fish stays level and faces its run by mirroring, never by turning
             through 180°; an octopus stays upright and only leans with its drift;
             a prawn chases its heading through the shortest arc */
          /* p.x and p.y are the creature's centre, so the box must be offset by
             half its size in both axes or the collision maths is wrong on Y */
          var tf='translate3d('+(p.x-p.w/2).toFixed(1)+'px,'+(p.y-p.h/2).toFixed(1)+'px,0)';
          if(p.k==='f'){
            var tilt=Math.max(-9,Math.min(9,(p.vy/Math.abs(p.vx||1))*26))*p.dir;
            if(p.rot===null)p.rot=tilt;
            p.rot+=(tilt-p.rot)*Math.min(1,2.4*dt);
            tf+=' rotate('+p.rot.toFixed(1)+'deg)'+(p.dir<0?' scaleX(-1)':'');
          } else if(p.k==='oct'){
            var lean=Math.max(-12,Math.min(12,(p.vx/Math.abs(p.vy||1))*30));
            if(p.rot===null)p.rot=lean;
            p.rot+=(lean-p.rot)*Math.min(1,1.2*dt);
            tf+=' rotate('+p.rot.toFixed(1)+'deg)';
          } else {
            var head=Math.atan2(p.vy,p.vx)*180/Math.PI;
            if(p.rot===null)p.rot=head;
            var diff=((head-p.rot+540)%360)-180;
            p.rot+=diff*Math.min(1,1.1*dt);
            tf+=' rotate('+p.rot.toFixed(1)+'deg)';
          }
          p.el.style.transform=tf;
        }
      }
      requestAnimationFrame(step);
    }
    init(); addEventListener('resize',init);
    requestAnimationFrame(function(t){last=t;requestAnimationFrame(step)});
  })();

  var dep2=document.getElementById('dep2');
  function sinker(d){ if(dep2)dep2.textContent=Math.round(d); }

  /* header */
  var hd = document.getElementById('hd');
  addEventListener('scroll', function(){ hd.classList.toggle('stuck', scrollY>80) }, {passive:true});

  /* menu category tracking */
  var cats = [].slice.call(document.querySelectorAll('.cats span'));
  var groups = [].slice.call(document.querySelectorAll('.mgroup'));
  addEventListener('scroll', function(){
    var best = 0;
    groups.forEach(function(g,i){ if (g.getBoundingClientRect().top < innerHeight*0.4) best = i });
    cats.forEach(function(c,i){ c.classList.toggle('on', i===best) });
  }, {passive:true});
})();
</script>
</body>
</html>
"""

ENG = {"E_FISHR": E.FISH_REAL, "E_OCTOR": P.octopus(1.15), "E_PRAWN": P.prawn(1.15), "E_OCTO": E.OCTOPUS_RISE, "E_FISH": E.FISH, "E_FISHS": E.FISH_SIMPLE, "E_OYSTER": E.OYSTER,
       "E_LEMON": E.LEMON, "E_GLASS": E.GLASS, "E_OLIVE": E.OLIVE, "E_FLEURON": E.FLEURON}
out = HTML.replace("__FISH__", FISH)
for _k, _spec in enumerate([(19, 0), (19, 6.3), (19, 12.6), (26, 9)]):
    out = out.replace("__WV%d__" % _k, P.wavefront(seed=_k + 2, lobes=6 + _k))
for k, v in ENG.items():
    out = out.replace("__" + k + "__", v)
for k, v in {"PLATE": PLATE, "ROSE_MECH": ROSE_MECH, "ROSE_MECH_SM": ROSE_MECH_SM, "ROSE_A": ROSE_A, "ROSE_B": ROSE_B, "ROSE_C": ROSE_C,
             "ROSE_S1": ROSE_S1, "ROSE_CH": ROSE_CH, "ROSE_S2": ROSE_S2, "ROSE_S3": ROSE_S3,
             "RULE": RULE, "RULE_DARK": RULE_DARK,
             }.items():
    out = out.replace("__" + k + "__", v)
for k, v in IMGS.items():
    out = out.replace("__" + k + "__", v)

with open("/home/claude/vajana/vajana-mockup-final.html", "w") as f:
    f.write(out)
print("written", len(out) // 1024, "KB")
