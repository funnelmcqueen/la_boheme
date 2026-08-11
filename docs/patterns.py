# -*- coding: utf-8 -*-
"""Generative ornament for the Vajana boho direction.

Everything is built from rotational symmetry and repeated motifs, so the output
is original artwork, infinitely scalable and re-colourable from one palette.
"""
import math, random

# ---- palette, pulled from the reference boards ----
PAL = {
    "teal":   "#17998A",
    "teal_d": "#0E6B62",
    "orange": "#E8622A",
    "amber":  "#F0A028",
    "magenta":"#D2357C",
    "pink":   "#EE6FA4",
    "mustard":"#E9B02E",
    "plum":   "#2A1327",
    "ink":    "#1A0F1C",
    "cream":  "#F6EAD5",
    "sand":   "#EBD9BC",
}
ORDER = ["teal", "orange", "magenta", "mustard", "teal_d", "pink", "amber"]

# A softer, printed-textile version of the same palette. Saturation pulled back,
# which is most of the difference between "block-printed" and "clipart".
LUX = {
    "teal":   "#16897C", "teal_d": "#0C5D57",
    "orange": "#C9552C", "amber":  "#CE8A2E", "mustard": "#C9992C",
    "magenta":"#A63A66", "pink":   "#C4718F",
    "plum":   "#16101A", "ink":    "#120C16",
    "cream":  "#F1E4CE", "sand":   "#E4D2B4",
}


def use(palette):
    """Swap the active palette. Everything below reads PAL."""
    PAL.update(palette)


def _tz(day_of_year):
    """EU summer time: last Sunday in March to last Sunday in October."""
    return 2 if 87 <= day_of_year <= 303 else 1


def sunset(day_of_year, lat=40.392, lon=19.479, tz=None):
    """Sunset for the bay of Vlore, in local decimal hours.
    Standard solar-declination approximation, accurate to a couple of minutes."""
    if tz is None:
        tz = _tz(day_of_year)
    g = 2 * math.pi / 365 * (day_of_year - 1)
    decl = (0.006918 - 0.399912*math.cos(g) + 0.070257*math.sin(g)
            - 0.006758*math.cos(2*g) + 0.000907*math.sin(2*g)
            - 0.002697*math.cos(3*g) + 0.001480*math.sin(3*g))
    eqt = 229.18 * (0.000075 + 0.001868*math.cos(g) - 0.032077*math.sin(g)
                    - 0.014615*math.cos(2*g) - 0.040849*math.sin(2*g))
    la = math.radians(lat)
    cosH = ((math.cos(math.radians(90.833)) / (math.cos(la) * math.cos(decl)))
            - math.tan(la) * math.tan(decl))
    cosH = max(-1.0, min(1.0, cosH))
    H = math.degrees(math.acos(cosH))
    return (720 - 4 * lon + 4 * H - eqt) / 60 + tz


def sun_arc(day_of_year, lat=40.392, lon=19.479, tz=None):
    """Sunrise, solar noon and sunset in local decimal hours, for the hero arc."""
    if tz is None:
        tz = _tz(day_of_year)
    g = 2 * math.pi / 365 * (day_of_year - 1)
    decl = (0.006918 - 0.399912*math.cos(g) + 0.070257*math.sin(g)
            - 0.006758*math.cos(2*g) + 0.000907*math.sin(2*g)
            - 0.002697*math.cos(3*g) + 0.001480*math.sin(3*g))
    eqt = 229.18 * (0.000075 + 0.001868*math.cos(g) - 0.032077*math.sin(g)
                    - 0.014615*math.cos(2*g) - 0.040849*math.sin(2*g))
    la = math.radians(lat)
    cosH = ((math.cos(math.radians(90.833)) / (math.cos(la) * math.cos(decl)))
            - math.tan(la) * math.tan(decl))
    cosH = max(-1.0, min(1.0, cosH))
    H = math.degrees(math.acos(cosH)) / 15.0
    noon = (720 - 4 * lon - eqt) / 60 + tz
    return noon - H, noon, noon + H


def rosette_of_the_day(day_of_year, size=760):
    """The day's ornament. Longer days give denser rings and warmer inks,
    so the mark drifts across the season instead of sitting still."""
    ss = sunset(day_of_year)
    rings = 6 + int(round((ss - 16.6) * 1.45))         # 6 in deep winter, 11 at midsummer
    rings = max(6, min(11, rings))
    warm = (ss - 16.6) / 3.7                            # 0 winter, 1 midsummer
    order = (["orange", "mustard", "magenta", "amber", "pink", "teal", "teal_d"] if warm > .55
             else ["teal", "teal_d", "magenta", "mustard", "orange", "pink", "amber"])
    global ORDER
    keep, ORDER = ORDER, order
    svg = mandala(size, seed=day_of_year, rings=rings)
    ORDER = keep
    return svg, ss, rings


def _petal(r0, r1, w, curve=0.34):
    """A teardrop pointing along -Y, from radius r0 out to r1."""
    d = (r1 - r0) * curve
    return (f"M0,{-r0:.1f} C{w:.1f},{-(r0+d):.1f} {w:.1f},{-(r1-d):.1f} 0,{-r1:.1f} "
            f"C{-w:.1f},{-(r1-d):.1f} {-w:.1f},{-(r0+d):.1f} 0,{-r0:.1f} Z")


def _diamond(r0, r1, w):
    return f"M0,{-r0:.1f} L{w:.1f},{-(r0+r1)/2:.1f} L0,{-r1:.1f} L{-w:.1f},{-(r0+r1)/2:.1f} Z"


def _tri(r0, r1, w):
    return f"M0,{-r1:.1f} L{w:.1f},{-r0:.1f} L{-w:.1f},{-r0:.1f} Z"


def mandala(size=760, seed=7, rings=9, stroke="#1A0F1C", ground="#F6EAD5"):
    """Concentric rings of rotated motifs, packed so each ring reads as a band.
    Motif width is derived from arc spacing, not radial step, so nothing gaps."""
    rnd = random.Random(seed)
    c = size / 2
    R = size * 0.47
    out = [f'<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">']
    if ground:
        out.append(f'<circle cx="{c}" cy="{c}" r="{R:.1f}" fill="{ground}"/>')
    out.append(f'<g stroke="{stroke}" stroke-width="1.5" stroke-linejoin="round">')

    r = size * 0.06
    step = (R - r) / rings
    ci = rnd.randrange(len(ORDER))

    # ring grounds first, outermost inward, so later rings never paint over earlier ones
    for ring in range(rings - 1, -1, -1):
        rb = r + (ring + 1) * step
        out.append(f'<circle cx="{c}" cy="{c}" r="{rb:.1f}" '
                   f'fill="{PAL["cream"] if ring%2 else PAL["sand"]}"/>')

    for ring in range(rings):
        r0, r1 = r + ring * step, r + (ring + 1) * step
        rm = (r0 + r1) / 2
        col = PAL[ORDER[ci % len(ORDER)]]
        ci += 1
        n = [10, 12, 14, 16, 18, 20, 22, 26, 28, 32][min(ring, 9)]
        w = math.pi * rm / n * 0.92
        kind = ring % 4

        if kind == 0:
            shape = _petal(r0 + step * .06, r1 - step * .06, w)
        elif kind == 1:
            shape = _diamond(r0 + step * .06, r1 - step * .06, w)
        elif kind == 2:
            shape = _tri(r0 + step * .08, r1 - step * .06, w)
        else:
            shape = None

        if shape:
            g = "".join(f'<path d="{shape}" fill="{col}" transform="rotate({k*360/n:.2f})"/>'
                        for k in range(n))
        else:
            g = "".join(
                f'<circle cx="0" cy="{-rm:.1f}" r="{min(step,w)*0.44:.1f}" fill="{col}" '
                f'transform="rotate({k*360/n:.2f})"/>' for k in range(n))
        out.append(f'<g transform="translate({c},{c})">{g}</g>')
        out.append(f'<circle cx="{c}" cy="{c}" r="{r0:.1f}" fill="none" stroke="{stroke}" stroke-width="2"/>')

    # centre bloom, drawn last so it sits on top
    out.append(f'<circle cx="{c}" cy="{c}" r="{r:.1f}" fill="{PAL["cream"]}" stroke="{stroke}" stroke-width="2"/>')
    n0 = 10
    wp = math.pi * (r * .7) / n0 * 1.0
    petals = "".join(
        f'<path d="{_petal(r*0.28, r*0.94, wp)}" fill="{PAL["orange"]}" '
        f'transform="rotate({k*360/n0:.2f})"/>' for k in range(n0))
    out.append(f'<g transform="translate({c},{c})">{petals}'
               f'<circle r="{r*0.26:.1f}" fill="{PAL["mustard"]}" stroke="{stroke}" stroke-width="1.6"/></g>')
    out.append(f'<circle cx="{c}" cy="{c}" r="{R:.1f}" fill="none" stroke="{stroke}" stroke-width="3"/>')
    out.append("</g></svg>")
    return "".join(out)


def band(kind=0, w=120, h=44, stroke="#1A0F1C"):
    """One tile of a tribal band. Repeats seamlessly on X."""
    p, s = [], stroke
    if kind == 0:  # triangles with dots
        p.append(f'<rect width="{w}" height="{h}" fill="{PAL["orange"]}"/>')
        for i, x in enumerate((0, w / 2)):
            col = PAL["magenta"] if i % 2 else PAL["mustard"]
            p.append(f'<path d="M{x},{h-4} L{x+w/4},4 L{x+w/2},{h-4} Z" fill="{col}" '
                     f'stroke="{s}" stroke-width="2"/>')
            p.append(f'<circle cx="{x+w/4}" cy="{h*0.62}" r="3.4" fill="{PAL["plum"]}"/>')
    elif kind == 1:  # arcs and eyes
        p.append(f'<rect width="{w}" height="{h}" fill="{PAL["teal"]}"/>')
        for i in range(2):
            x = i * w / 2
            p.append(f'<path d="M{x+6},{h-6} A{w/4-6},{h-14} 0 0 1 {x+w/2-6},{h-6}" '
                     f'fill="none" stroke="{s}" stroke-width="2.6"/>')
            p.append(f'<ellipse cx="{x+w/4}" cy="{h*0.55}" rx="9" ry="12" '
                     f'fill="{PAL["amber"]}" stroke="{s}" stroke-width="2"/>')
    elif kind == 2:  # diamonds
        p.append(f'<rect width="{w}" height="{h}" fill="{PAL["plum"]}"/>')
        for i in range(3):
            x = i * w / 3 + w / 6
            col = [PAL["magenta"], PAL["mustard"], PAL["teal"]][i % 3]
            p.append(f'<path d="M{x},4 L{x+w/6-3},{h/2} L{x},{h-4} L{x-w/6+3},{h/2} Z" '
                     f'fill="{col}" stroke="{s}" stroke-width="2"/>')
    else:  # chevrons
        p.append(f'<rect width="{w}" height="{h}" fill="{PAL["mustard"]}"/>')
        for i in range(4):
            x = i * w / 4
            p.append(f'<path d="M{x},{h-5} L{x+w/8},6 L{x+w/4},{h-5}" fill="none" '
                     f'stroke="{PAL["orange"]}" stroke-width="6" stroke-linecap="round"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}">{"".join(p)}</svg>')


def tile(size=180, seed=3, bg="#F6EAD5"):
    """Seamless folk-floral tile for low-opacity backgrounds."""
    rnd = random.Random(seed)
    s, c = size, size / 2
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" '
         f'width="{s}" height="{s}"><rect width="{s}" height="{s}" fill="{bg}"/>']
    for cx, cy, r in ((c, c, s * .30), (0, 0, s * .19), (s, 0, s * .19),
                      (0, s, s * .19), (s, s, s * .19)):
        n = 8
        col = PAL[ORDER[rnd.randrange(len(ORDER))]]
        g = "".join(f'<path d="{_petal(r*.30, r, r*.34)}" fill="{col}" opacity=".9" '
                    f'transform="rotate({k*360/n:.1f})"/>' for k in range(n))
        p.append(f'<g transform="translate({cx},{cy})">{g}'
                 f'<circle r="{r*0.24:.1f}" fill="{PAL["mustard"]}"/></g>')
    for _ in range(6):
        x, y = rnd.uniform(0, s), rnd.uniform(0, s)
        col = PAL[ORDER[rnd.randrange(len(ORDER))]]
        p.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(3,6):.1f}" fill="{col}" opacity=".7"/>')
    p.append("</svg>")
    return "".join(p)


def data_uri(svg):
    import base64
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


# ---------------------------------------------------------------------------
# Line mode. Same geometry as the filled ornament, drawn as a single-weight
# stroke in currentColor. This is the version that belongs on a premium page.
# ---------------------------------------------------------------------------

def mandala_line(size=760, seed=7, rings=8, sw=1.0, hollow=False):
    """Stroke-only rosette. No fills, no palette, inherits colour from CSS."""
    rnd = random.Random(seed)
    c = size / 2
    R = size * 0.47
    o = [f'<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg" '
         f'fill="none" stroke="currentColor" stroke-width="{sw}" '
         f'stroke-linejoin="round" stroke-linecap="round" '
         f'vector-effect="non-scaling-stroke">']
    r = size * 0.07
    step = (R - r) / rings

    for ring in range(rings):
        r0, r1 = r + ring * step, r + (ring + 1) * step
        rm = (r0 + r1) / 2
        n = [10, 12, 14, 16, 18, 22, 24, 28, 32, 36][min(ring, 9)]
        w = math.pi * rm / n * 0.9
        kind = ring % 4
        if kind == 0:
            d = _petal(r0 + step * .08, r1 - step * .08, w)
        elif kind == 1:
            d = _diamond(r0 + step * .10, r1 - step * .10, w * .8)
        elif kind == 2:
            d = _tri(r0 + step * .10, r1 - step * .08, w * .85)
        else:
            d = None
        if d:
            g = "".join(f'<path d="{d}" transform="rotate({k*360/n:.2f})"/>' for k in range(n))
        else:
            g = "".join(f'<circle cx="0" cy="{-rm:.1f}" r="{min(step,w)*0.30:.1f}" '
                        f'transform="rotate({k*360/n:.2f})"/>' for k in range(n))
        o.append(f'<g transform="translate({c},{c})">{g}</g>')
        o.append(f'<circle cx="{c}" cy="{c}" r="{r0:.1f}"/>')

    if not hollow:
        n0 = 12
        wp = math.pi * (r * .7) / n0
        o.append(f'<g transform="translate({c},{c})">' +
                 "".join(f'<path d="{_petal(r*0.30, r*0.95, wp)}" transform="rotate({k*360/n0:.1f})"/>'
                         for k in range(n0)) +
                 f'<circle r="{r*0.26:.1f}"/></g>')
    o.append(f'<circle cx="{c}" cy="{c}" r="{R:.1f}"/>')
    o.append(f'<circle cx="{c}" cy="{c}" r="{R*1.045:.1f}" opacity=".5"/>')
    o.append("</svg>")
    return "".join(o)


def band_line(w=160, h=26, sw=1.0):
    """A hairline repeating border. Reads as a printed rule, not a stripe."""
    p = []
    for i in range(2):
        x = i * w / 2
        p.append(f'<path d="M{x},{h/2} L{x+w/8},{h*0.16} L{x+w/4},{h/2} '
                 f'L{x+w*3/8},{h*0.84} L{x+w/2},{h/2}"/>')
        p.append(f'<circle cx="{x+w/4}" cy="{h/2}" r="2.6"/>')
        p.append(f'<path d="M{x+w/8},{h*0.16} m-3.4,0 a3.4,3.4 0 1,0 6.8,0 a3.4,3.4 0 1,0 -6.8,0"/>')
    p.append(f'<path d="M0,{h-1} L{w},{h-1}" opacity=".35"/>')
    p.append(f'<path d="M0,1 L{w},1" opacity=".35"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round">{"".join(p)}</svg>')


def inked(svg, colour):
    """Bake a colour in, for use as a CSS background-image."""
    return svg.replace("currentColor", colour)


def mandala_mech(size=760, seed=7, rings=7, sw=1.0):
    """A rosette in the engraver's sense: bands set on one constant motif pitch so
    everything interlocks, but each band a different device — nested petals,
    guilloche, interlaced loops, scalloped beading, cusped diamonds, trefoils.
    Rings sit in their own <g> so they can be driven independently."""
    rnd = random.Random(seed)
    c = size / 2
    R = size * 0.424          # the rim then clears the box by ~5%, not by 2px
    r = size * 0.23          # the hollow, sized so the fish clears the inner lip
    step = (R - r) / rings
    pitch = size * 0.050

    def ring_path(rad_fn, n=260):
        pts = []
        for i in range(n):
            a = 2 * math.pi * i / n
            rr = rad_fn(a)
            pts.append((c + rr * math.cos(a), c + rr * math.sin(a)))
        return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"

    def scallop(rad, lobes, amp, inward=True):
        s = -1 if inward else 1
        return ring_path(lambda a, rad=rad, l=lobes, m=amp, s=s:
                         rad + s * m * (0.5 - 0.5 * math.cos(l * a)))

    o = [f'<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg" '
         f'fill="none" stroke="currentColor" stroke-width="{sw}" '
         f'stroke-linejoin="round" stroke-linecap="round">']

    for ring in range(rings):
        r0, r1 = r + ring * step, r + (ring + 1) * step
        rm = (r0 + r1) / 2
        n = max(10, int(round(2 * math.pi * rm / pitch)))
        half = math.pi * rm / n
        pad = step * 0.10
        a0, a1 = r0 + pad, r1 - pad
        kind = ring % 6
        g = []

        if kind == 0:                                   # nested petals with a seed
            d = _petal(a0, a1, half * 0.94, curve=0.42)
            d2 = _petal(a0 + step * 0.20, a1 - step * 0.20, half * 0.52, curve=0.46)
            for k in range(n):
                t = f'rotate({k*360/n:.3f})'
                g.append(f'<path d="{d}" transform="{t}"/>')
                g.append(f'<path d="{d2}" transform="{t}"/>')
                g.append(f'<circle cx="0" cy="{-rm:.1f}" r="{step*0.055:.1f}" transform="{t}"/>')
            o.append(f'<g class="ring"><g transform="translate({c},{c})">{"".join(g)}</g></g>')

        elif kind == 1:                                 # guilloche: three interfering waves
            amp = step * 0.34
            paths = "".join(
                f'<path d="{ring_path(lambda a, ph=ph: rm + amp*math.sin(n*a+ph))}"/>'
                for ph in (0, 2*math.pi/3, 4*math.pi/3))
            o.append(f'<g class="ring">{paths}</g>')

        elif kind == 2:                                 # interlaced loops
            lr = min(step * 0.52, half * 1.22)
            for k in range(n):
                g.append(f'<circle cx="0" cy="{-rm:.1f}" r="{lr:.1f}" '
                         f'transform="rotate({k*360/n:.3f})"/>')
            o.append(f'<g class="ring"><g transform="translate({c},{c})">{"".join(g)}</g></g>')

        elif kind == 3:                                 # beading between scalloped edges
            br = min(step * 0.20, half * 0.62)
            for k in range(n):
                t = f'rotate({k*360/n:.3f})'
                g.append(f'<circle cx="0" cy="{-rm:.1f}" r="{br:.1f}" transform="{t}"/>')
                g.append(f'<circle cx="0" cy="{-rm:.1f}" r="{br*0.34:.1f}" transform="{t}"/>')
            inner = f'<path d="{scallop(a0, n, step*0.20, False)}"/>'
            outer = f'<path d="{scallop(a1, n, step*0.20, True)}"/>'
            o.append(f'<g class="ring">{inner}{outer}'
                     f'<g transform="translate({c},{c})">{"".join(g)}</g></g>')

        elif kind == 4:                                 # cusped diamonds
            d = _diamond(a0, a1, half * 0.92)
            d2 = _diamond(a0 + step * 0.22, a1 - step * 0.22, half * 0.46)
            for k in range(n):
                t = f'rotate({k*360/n:.3f})'
                g.append(f'<path d="{d}" transform="{t}"/>')
                g.append(f'<path d="{d2}" transform="{t}"/>')
            o.append(f'<g class="ring"><g transform="translate({c},{c})">{"".join(g)}</g></g>')

        else:                                           # trefoils
            lobe = min(step * 0.21, half * 0.50)
            for k in range(n):
                t = f'rotate({k*360/n:.3f})'
                g.append(f'<circle cx="0" cy="{-(a1-lobe):.1f}" r="{lobe:.1f}" transform="{t}"/>')
                g.append(f'<circle cx="{-lobe*0.92:.1f}" cy="{-(a0+lobe*1.15):.1f}" '
                         f'r="{lobe*0.72:.1f}" transform="{t}"/>')
                g.append(f'<circle cx="{lobe*0.92:.1f}" cy="{-(a0+lobe*1.15):.1f}" '
                         f'r="{lobe*0.72:.1f}" transform="{t}"/>')
            o.append(f'<g class="ring"><g transform="translate({c},{c})">{"".join(g)}</g></g>')

    # the frame: paired hairlines at every edge, a scalloped inner lip, beaded rim
    o.append('<g class="fixed">')
    for ring in range(rings + 1):
        rr = r + ring * step
        o.append(f'<circle cx="{c}" cy="{c}" r="{rr:.1f}" opacity=".5"/>')
    o.append(f'<circle cx="{c}" cy="{c}" r="{r*0.955:.1f}" opacity=".38"/>')
    nl = max(18, int(round(2*math.pi*r/(pitch*1.5))))
    o.append(f'<path d="{scallop(r*0.90, nl, r*0.055, False)}" opacity=".45"/>')
    nb = max(24, int(round(2 * math.pi * R / (pitch * 0.62))))
    beads = "".join(f'<circle cx="0" cy="{-R*1.034:.1f}" r="{pitch*0.13:.1f}" '
                    f'transform="rotate({k*360/nb:.3f})"/>' for k in range(nb))
    o.append(f'<g transform="translate({c},{c})" opacity=".5">{beads}</g>')
    o.append(f'<circle cx="{c}" cy="{c}" r="{R*1.070:.1f}" opacity=".3"/>')
    o.append('</g></svg>')
    return "".join(o)


def prawn(sw=1.0):
    """A prawn built from a spine arc: the body is a tapering band offset either
    side of a circular arc, segmented across its width, closed with a smooth
    head and a tail fan set on the tail tangent."""
    cx, cy, R = 170.0, 118.0, 72.0
    a0, a1 = math.radians(212), math.radians(-8)      # tail round to head
    N = 64

    def pt(a, off):
        return (cx + (R + off) * math.cos(a), cy - (R + off) * math.sin(a))

    def thick(u):
        return 5.0 + 19.0 * (u ** 0.8)

    def poly(pts):
        return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)

    back, belly = [], []
    for i in range(N + 1):
        u = i / N
        a = a0 + (a1 - a0) * u
        back.append(pt(a, thick(u)))
        belly.append(pt(a, -thick(u)))

    o = [f'<svg viewBox="0 0 340 200" class="eng" fill="none" '
         f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" '
         f'stroke-linejoin="round" vector-effect="non-scaling-stroke">']
    o.append(f'<path d="{poly(back)}"/>')
    o.append(f'<path d="{poly(belly)}"/>')

    # abdominal segments, kept inside the outline
    for k in range(7):
        u = 0.13 + k * 0.098
        a = a0 + (a1 - a0) * u
        t = thick(u) * 0.84
        x1, y1 = pt(a, t)
        x2, y2 = pt(a, -t)
        mxp, myp = pt(a - 0.06, 0)
        o.append(f'<path d="M{x1:.1f},{y1:.1f} Q{mxp:.1f},{myp:.1f} {x2:.1f},{y2:.1f}"/>')

    # head: one smooth cap from back to belly, plus rostrum and eye
    hx, hy = pt(a1, 0)
    bx, by = pt(a1, thick(1.0))
    lx, ly = pt(a1, -thick(1.0))
    o.append(f'<path d="M{bx:.1f},{by:.1f} C{bx+20:.1f},{by+4:.1f} '
             f'{lx+22:.1f},{ly-4:.1f} {lx:.1f},{ly:.1f}"/>')
    o.append(f'<path d="M{bx+13:.1f},{by+2:.1f} C{bx+34:.1f},{by-6:.1f} '
             f'{bx+52:.1f},{by-14:.1f} {bx+66:.1f},{by-20:.1f}"/>')
    o.append(f'<circle cx="{hx+9:.1f}" cy="{hy-8:.1f}" r="4.2"/>')

    # antennae
    o.append(f'<path d="M{bx+64:.1f},{by-19:.1f} C{bx+106:.1f},{by-38:.1f} '
             f'{bx+142:.1f},{by-50:.1f} {bx+168:.1f},{by-54:.1f}"/>')
    o.append(f'<path d="M{lx+16:.1f},{ly-2:.1f} C{lx+58:.1f},{ly+2:.1f} '
             f'{lx+100:.1f},{ly+14:.1f} {lx+130:.1f},{ly+32:.1f}"/>')

    # tail fan, opened along the tail tangent
    tx, ty = pt(a0, 0)
    tang = a0 + math.pi / 2
    for d, ln in ((-0.44, 26), (-0.22, 33), (0.0, 37), (0.22, 33), (0.44, 26)):
        r = tang + d
        o.append(f'<path d="M{tx:.1f},{ty:.1f} L{tx+ln*math.cos(r):.1f},'
                 f'{ty-ln*math.sin(r):.1f}"/>')
    e1 = (tx + 26 * math.cos(tang - 0.44), ty - 26 * math.sin(tang - 0.44))
    e2 = (tx + 37 * math.cos(tang), ty - 37 * math.sin(tang))
    e3 = (tx + 26 * math.cos(tang + 0.44), ty - 26 * math.sin(tang + 0.44))
    o.append(f'<path d="M{e1[0]:.1f},{e1[1]:.1f} Q{e2[0]:.1f},{e2[1]:.1f} {e3[0]:.1f},{e3[1]:.1f}"/>')

    # legs on the inner side, shortening toward the tail
    for k in range(6):
        u = 0.26 + k * 0.115
        a = a0 + (a1 - a0) * u
        x1, y1 = pt(a, -thick(u))
        x2, y2 = pt(a - 0.13, -thick(u) - (16 - k * 1.9))
        o.append(f'<path d="M{x1:.1f},{y1:.1f} Q{(x1+x2)/2:.1f},{(y1+y2)/2+4:.1f} {x2:.1f},{y2:.1f}"/>')

    o.append("</svg>")
    return "".join(o)


def _bez(p0, p1, p2, p3, n):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0])
        y = (u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])
        out.append((x, y))
    return out


def _taper(spine, w0, w1, power=1.5):
    """Turn a spine into a closed tapering outline by offsetting along normals."""
    L, R = [], []
    n = len(spine)
    for i, (x, y) in enumerate(spine):
        u = i / (n - 1)
        if i == 0:
            dx, dy = spine[1][0]-x, spine[1][1]-y
        elif i == n - 1:
            dx, dy = x-spine[-2][0], y-spine[-2][1]
        else:
            dx, dy = spine[i+1][0]-spine[i-1][0], spine[i+1][1]-spine[i-1][1]
        m = math.hypot(dx, dy) or 1
        nx, ny = -dy/m, dx/m
        w = w0 + (w1 - w0) * (u ** power)
        L.append((x + nx*w, y + ny*w))
        R.append((x - nx*w, y - ny*w))
    pts = L + R[::-1]
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"


def octopus(sw=1.0):
    """Octopus, three-quarter view. Bulbous mantle, eyes set on their own bulges,
    eight tapering arms curling in different directions with suckers on the two
    facing ones. Arms are built as tapered outlines, not single strokes, which is
    the whole difference between an octopus and a jellyfish."""
    o = [f'<svg viewBox="0 0 320 330" class="eng" fill="none" '
         f'stroke="currentColor" stroke-width="{sw}" stroke-linejoin="round" '
         f'stroke-linecap="round" vector-effect="non-scaling-stroke">']

    # mantle
    o.append('<path d="M160,16 C200,16 226,50 230,92 C234,126 226,152 208,168 '
             'C194,180 126,180 112,168 C94,152 86,126 90,92 C94,50 120,16 160,16 Z"/>')
    o.append('<path d="M128,44 C144,32 176,32 192,44"/>')
    o.append('<path d="M112,78 C134,66 186,66 208,78"/>')
    o.append('<path d="M104,112 C128,102 192,102 216,112"/>')

    # eye bulges and eyes
    o.append('<path d="M92,140 C100,124 124,122 134,136 C126,152 102,154 92,140 Z"/>')
    o.append('<path d="M186,136 C196,122 220,124 228,140 C218,154 194,152 186,136 Z"/>')
    o.append('<circle cx="113" cy="138" r="5.6"/><circle cx="207" cy="138" r="5.6"/>')

    # eight arms: (start, c1, c2, end, base width, tip width)
    # every arm curls: the control points swing wide, then the tip hooks back
    arms = [
        ((124,170), (68,188), (22,212), (44,264), 15, 2.4),
        ((134,176), (90,226), (56,266), (90,302), 13, 2.2),
        ((148,180), (128,238), (106,286), (140,316), 12, 2.0),
        ((166,180), (188,236), (210,282), (176,314), 12, 2.0),
        ((180,176), (226,224), (260,260), (226,298), 13, 2.2),
        ((192,168), (250,190), (296,214), (272,264), 15, 2.4),
        ((130,172), (94,202), (62,228), (82,266), 10, 1.8),
        ((188,172), (226,200), (256,224), (238,262), 10, 1.8),
    ]
    for i, (p0, p1, p2, p3, w0, w1) in enumerate(arms):
        spine = _bez(p0, p1, p2, p3, 26)
        o.append(f'<path d="{_taper(spine, w0, w1)}"/>')
        if i in (2, 3):                        # suckers on the two facing arms
            for k in range(3, 22, 3):
                x, y = spine[k]
                dx = spine[k+1][0]-spine[k-1][0]; dy = spine[k+1][1]-spine[k-1][1]
                m = math.hypot(dx, dy) or 1
                w = w0 + (w1-w0)*((k/26)**1.5)
                o.append(f'<circle cx="{x - dy/m*w*0.45:.1f}" cy="{y + dx/m*w*0.45:.1f}" '
                         f'r="{max(1.2, w*0.30):.1f}"/>')
    o.append("</svg>")
    return "".join(o)


def wavefront(seed=1, lobes=7, amp=0.055, n=180):
    """A closed ripple outline: a circle whose radius is modulated by two sines.
    Expanded and faded it reads as a pressure front in water; a true circle
    reads as sonar."""
    rnd = random.Random(seed)
    p1, p2 = rnd.uniform(0, 6.28), rnd.uniform(0, 6.28)
    l2 = lobes + rnd.choice((3, 4, 5))
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        r = 500 * (1 + amp * math.sin(lobes * a + p1) + amp * 0.55 * math.sin(l2 * a + p2))
        pts.append((500 + r * math.cos(a), 500 + r * math.sin(a)))
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    return d
