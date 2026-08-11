/**
 * The rosette. A port of `mandala_mech` from patterns.py, which is the source of
 * truth for the emblem's geometry.
 *
 * The whole thing is built from one constant motif pitch — each band derives its
 * motif count from its own circumference, so motif size stays equal across every
 * ring and the count rises outward. That rule is what separates a rosette from
 * scattered shapes: guessing counts per ring leaves gaps in the outer bands and
 * crowding in the inner ones, and the eye reads it as noise.
 *
 * The pitch gives it structure; the six devices give it interest.
 *
 * Server-only by construction — this runs once at render time and the output is
 * baked into the sprite. None of it ships to the browser.
 */

/** The rim clears the box by ~5%, not by 2px. */
const RIM = 0.424;

/**
 * The hollow, sized so the fish clears the inner lip. 0.23, not 0.21: the lip adds
 * lines *inside* the hollow, so the fish's clear radius drops to 0.90r − scallop.
 * Any change to the lip, the hollow or the fish needs `hypot(w/2, h_centre + h/2)`
 * recomputed against it.
 */
const HOLLOW = 0.23;

const PITCH = 0.05;

const f = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);

/** A teardrop pointing along -Y, from radius r0 out to r1. */
const petal = (r0: number, r1: number, w: number, curve = 0.34) => {
  const d = (r1 - r0) * curve;
  return (
    `M0,${f(-r0)} C${f(w)},${f(-(r0 + d))} ${f(w)},${f(-(r1 - d))} 0,${f(-r1)} ` +
    `C${f(-w)},${f(-(r1 - d))} ${f(-w)},${f(-(r0 + d))} 0,${f(-r0)} Z`
  );
};

const diamond = (r0: number, r1: number, w: number) =>
  `M0,${f(-r0)} L${f(w)},${f(-(r0 + r1) / 2)} L0,${f(-r1)} L${f(-w)},${f(-(r0 + r1) / 2)} Z`;

export interface Rosette {
  size: number;
  /** One entry per band. Each turns independently. */
  rings: string[];
  /** Paired hairlines, the scalloped inner lip and the beaded rim. Never turns. */
  frame: string;
}

/**
 * `rings` is not cosmetic. Every band's radii derive from `(RIM − HOLLOW) / rings`,
 * so a 3-ring rosette is not the inner three bands of a 7-ring one — it is its own
 * geometry, and the two have to be defined separately in the sprite.
 */
export function mandalaMech(size = 760, rings = 7): Rosette {
  const c = size / 2;
  const R = size * RIM;
  const r = size * HOLLOW;
  const step = (R - r) / rings;
  const pitch = size * PITCH;

  const ringPath = (radius: (a: number) => number, n = 260) => {
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      const rr = radius(a);
      pts.push(`${f(c + rr * Math.cos(a))},${f(c + rr * Math.sin(a))}`);
    }
    return `M${pts.join(" L")} Z`;
  };

  const scallop = (rad: number, lobes: number, amp: number, inward = true) => {
    const s = inward ? -1 : 1;
    return ringPath((a) => rad + s * amp * (0.5 - 0.5 * Math.cos(lobes * a)));
  };

  const out: string[] = [];

  for (let ring = 0; ring < rings; ring++) {
    const r0 = r + ring * step;
    const r1 = r + (ring + 1) * step;
    const rm = (r0 + r1) / 2;
    const n = Math.max(10, Math.round((2 * Math.PI * rm) / pitch));
    const half = (Math.PI * rm) / n;
    const pad = step * 0.1;
    const a0 = r0 + pad;
    const a1 = r1 - pad;
    const g: string[] = [];
    const spin = (k: number) => `rotate(${f3((k * 360) / n)})`;
    const centred = (body: string) => `<g transform="translate(${c},${c})">${body}</g>`;

    switch (ring % 6) {
      case 0: {
        // Nested petals with a seed dot at the centre of each.
        const d = petal(a0, a1, half * 0.94, 0.42);
        const d2 = petal(a0 + step * 0.2, a1 - step * 0.2, half * 0.52, 0.46);
        for (let k = 0; k < n; k++) {
          const t = spin(k);
          g.push(`<path d="${d}" transform="${t}"/>`);
          g.push(`<path d="${d2}" transform="${t}"/>`);
          g.push(`<circle cx="0" cy="${f(-rm)}" r="${f(step * 0.055)}" transform="${t}"/>`);
        }
        out.push(centred(g.join("")));
        break;
      }

      case 1: {
        // Guilloche — three closed curves of rm + amp·sin(nθ + φ) at 120° phase
        // offsets. This is the banknote-engraving device, and it does most of the
        // work of making the whole thing read as engraved rather than drawn.
        const amp = step * 0.34;
        out.push(
          [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
            .map((ph) => `<path d="${ringPath((a) => rm + amp * Math.sin(n * a + ph))}"/>`)
            .join(""),
        );
        break;
      }

      case 2: {
        // Interlaced loops: circles at the band's mid-radius, wider than the pitch
        // so they overlap into a chain.
        const lr = Math.min(step * 0.52, half * 1.22);
        for (let k = 0; k < n; k++) {
          g.push(`<circle cx="0" cy="${f(-rm)}" r="${f(lr)}" transform="${spin(k)}"/>`);
        }
        out.push(centred(g.join("")));
        break;
      }

      case 3: {
        // Beading with a double dot, between two scalloped edges facing each other.
        const br = Math.min(step * 0.2, half * 0.62);
        for (let k = 0; k < n; k++) {
          const t = spin(k);
          g.push(`<circle cx="0" cy="${f(-rm)}" r="${f(br)}" transform="${t}"/>`);
          g.push(`<circle cx="0" cy="${f(-rm)}" r="${f(br * 0.34)}" transform="${t}"/>`);
        }
        out.push(
          `<path d="${scallop(a0, n, step * 0.2, false)}"/>` +
            `<path d="${scallop(a1, n, step * 0.2, true)}"/>` +
            centred(g.join("")),
        );
        break;
      }

      case 4: {
        // Cusped diamonds with an inner diamond.
        const d = diamond(a0, a1, half * 0.92);
        const d2 = diamond(a0 + step * 0.22, a1 - step * 0.22, half * 0.46);
        for (let k = 0; k < n; k++) {
          const t = spin(k);
          g.push(`<path d="${d}" transform="${t}"/>`);
          g.push(`<path d="${d2}" transform="${t}"/>`);
        }
        out.push(centred(g.join("")));
        break;
      }

      default: {
        // Trefoils.
        const lobe = Math.min(step * 0.21, half * 0.5);
        for (let k = 0; k < n; k++) {
          const t = spin(k);
          g.push(`<circle cx="0" cy="${f(-(a1 - lobe))}" r="${f(lobe)}" transform="${t}"/>`);
          g.push(
            `<circle cx="${f(-lobe * 0.92)}" cy="${f(-(a0 + lobe * 1.15))}" r="${f(lobe * 0.72)}" transform="${t}"/>`,
          );
          g.push(
            `<circle cx="${f(lobe * 0.92)}" cy="${f(-(a0 + lobe * 1.15))}" r="${f(lobe * 0.72)}" transform="${t}"/>`,
          );
        }
        out.push(centred(g.join("")));
      }
    }
  }

  // The frame: paired hairlines at every edge, a scalloped inner lip, a beaded rim.
  const frame: string[] = [];
  for (let ring = 0; ring <= rings; ring++) {
    frame.push(`<circle cx="${c}" cy="${c}" r="${f(r + ring * step)}" opacity=".5"/>`);
  }
  frame.push(`<circle cx="${c}" cy="${c}" r="${f(r * 0.955)}" opacity=".38"/>`);

  const nl = Math.max(18, Math.round((2 * Math.PI * r) / (pitch * 1.5)));
  frame.push(`<path d="${scallop(r * 0.9, nl, r * 0.055, false)}" opacity=".45"/>`);

  const nb = Math.max(24, Math.round((2 * Math.PI * R) / (pitch * 0.62)));
  const beads: string[] = [];
  for (let k = 0; k < nb; k++) {
    beads.push(
      `<circle cx="0" cy="${f(-R * 1.034)}" r="${f(pitch * 0.13)}" transform="rotate(${f3((k * 360) / nb)})"/>`,
    );
  }
  frame.push(`<g transform="translate(${c},${c})" opacity=".5">${beads.join("")}</g>`);
  frame.push(`<circle cx="${c}" cy="${c}" r="${f(R * 1.07)}" opacity=".3"/>`);

  return { size, rings: out, frame: frame.join("") };
}

/**
 * The outermost ring must sit at ≤ 0.454 of the viewBox or the dome's
 * overflow:hidden shaves the crown. RIM × 1.070 is the beaded rim's outer circle,
 * the furthest thing from centre.
 */
export const OUTERMOST = RIM * 1.07;

export const HOLLOW_RATIO = HOLLOW;
