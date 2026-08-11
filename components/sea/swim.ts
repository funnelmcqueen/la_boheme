/**
 * The seascape physics.
 *
 * Every creature holds a heading and a cruising speed and wanders slowly off it.
 * Passing wave fronts shove them outward, the emblem refuses contact, and soft
 * walls hold them inside a basin. One rAF drives all of it; nothing here touches
 * layout and nothing writes anything but a transform.
 *
 * Kept apart from the component so it can be stepped in a test without a browser.
 *
 * NOTE — never name a variable `t` in this file. A transform string declared as
 * `var t = 'translate3d(...)'` once shadowed the rAF timestamp, so `t/1000` was
 * NaN for every creature after the first and the wave force silently did nothing
 * to thirteen of fourteen of them. Nothing threw. Three rounds of tuning force
 * constants failed because the numbers were never the problem. The timestamp is
 * `now`, the elapsed step is `dt`, and a transform is `transform`.
 */

export type Kind = "fish" | "prawn" | "octopus" | "mote";

export interface Basin {
  width: number;
  height: number;
  /** The emblem's baseline centre — the point the rings turn about and the point
      the wave fronts leave from, so the mark and the water share one origin. */
  originX: number;
  originY: number;
  /** The exclusion ellipse around the whole mark, wordmark included. */
  emblemX: number;
  emblemY: number;
  emblemRX: number;
  emblemRY: number;
  /** The bottom of the whole lockup, wordmark included, in column coordinates. */
  markBottom: number;
  hole: number;
}

export interface Swimmer {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Cruising speed. */
  speed: number;
  width: number;
  height: number;
  /** Which way a fish faces. Mirrored, never rotated through 180°. */
  facing: 1 | -1;
  /** The drawn angle, in degrees. Chases the heading; never snaps to it. */
  angle: number | null;
  wobble: number;
  wobbleRate: number;
  /** Which way it slips past the mark, so two creatures do not take the same line. */
  slip: 1 | -1;
  /** 0–1, so a re-entry is a fade rather than a jump. Only octopuses use it. */
  fade: number;
}

/** Mirrors the CSS on the wave fronts: each expands from `s0` to 1 over its own
    duration. Reading the radius back off the DOM would return the animated
    matrix, so the phase is recomputed here instead. */
export const WAVES = [
  { duration: 19, offset: 0 },
  { duration: 19, offset: 6.3 },
  { duration: 19, offset: 12.6 },
  { duration: 26, offset: 9 },
];

/**
 * The basin. Soft walls at 3–67% × 3–72% of the column — the part actually
 * visible once the horizontal and vertical masks are accounted for.
 *
 * Not a wrapping plane. Wrapping was tried and it empties the frame: once the
 * wave force reaches every creature they all drift the same way and leave
 * together, and ten visible fell to five inside twenty seconds. Soft walls turn
 * things back well before the edge, so nothing ever leaves and nothing has to be
 * teleported back in.
 */
export const BASIN = { x0: 0.03, x1: 0.67, y0: 0.03, y1: 0.72 };

/**
 * How far outside the exclusion surface the emblem's field is felt, as a fraction
 * of the column width. A distance, not a multiple of the mark — so resizing the
 * keep-out changes what is protected without changing how much warning a creature
 * gets to turn in.
 */
export const FIELD_REACH = 0.78;

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/**
 * Shortest signed arc from `from` to `to`, in degrees. Always within ±180.
 *
 * The obvious form, `((to - from + 540) % 360) - 180`, is wrong for arguments more
 * than 540° apart, because JavaScript's % keeps the sign of the dividend and the
 * result falls outside ±180. That matters here because a prawn's drawn angle
 * accumulates — measured between −1035° and +448° over half a minute — so the gap
 * does exceed 540, and when it does the creature takes the long way round. Which
 * is the spinning this whole mechanism exists to prevent.
 */
export const shortestArc = (from: number, to: number) =>
  ((((to - from) % 360) + 540) % 360) - 180;

/** Keep an accumulated angle in ±180 so it cannot drift without bound. */
const normaliseAngle = (deg: number) => ((((deg % 360) + 540) % 360) - 180);

/**
 * The sum of every passing front's push at a point, 0 upward.
 * `seconds` is the wall clock; each front is a gaussian band at its own radius.
 */
export function waveForce(seconds: number, distance: number, maxRadius: number, s0: number) {
  let force = 0;
  for (const wave of WAVES) {
    const phase = ((seconds + wave.offset) % wave.duration) / wave.duration;
    const radius = (s0 + (1 - s0) * phase) * maxRadius;
    const band = maxRadius * 0.17;
    const u = (distance - radius) / band;
    if (u > -2.6 && u < 2.6) force += Math.exp(-u * u) * (1 - phase * 0.4);
  }
  return Math.min(1.8, force);
}

/**
 * How far a point sits from the emblem, measured in ellipse space: 1 on the
 * mark's edge, 2 a full mark away. Measuring in ellipse space rather than as a
 * radius is what makes the field match the shape of the mark instead of a circle
 * drawn around it.
 */
export function emblemDistance(basin: Basin, x: number, y: number, pad: number) {
  const rx = basin.emblemRX + pad;
  const ry = basin.emblemRY + pad;
  const ux = (x - basin.emblemX) / rx;
  const uy = (y - basin.emblemY) / ry;
  return { ux, uy, rx, ry, magnitude: Math.hypot(ux, uy) || 1e-4 };
}

/** Half-width padding, so a creature's whole box clears the mark, not its centre. */
export const padFor = (s: Swimmer) => (s.kind === "mote" ? 3 : s.width * 0.55 + 6);

/**
 * Where a re-entering octopus comes back in.
 *
 * Anywhere but directly beneath the mark. An octopus only rises, so one that
 * re-enters under the emblem is on a collision course from the first frame and
 * meets the repulsion field head-on, where the field has to do all its work in one
 * axis. Measured with a uniform spawn: closest approach 1.01 in ellipse units, a
 * hundredth away from the hard clamp. Starting it to one side means the field
 * deflects rather than blocks, which is the behaviour the whole design wants.
 */
export function reentryX(s: Swimmer, basin: Basin, random = Math.random) {
  const pad = padFor(s);
  const shadowLeft = basin.emblemX - (basin.emblemRX + pad);
  const shadowRight = basin.emblemX + (basin.emblemRX + pad);
  const left = basin.width * 0.05;
  const right = basin.width * 0.6;

  const leftRoom = Math.max(0, shadowLeft - left);
  const rightRoom = Math.max(0, right - shadowRight);
  if (leftRoom + rightRoom <= 0) return left + random() * (right - left);

  return random() * (leftRoom + rightRoom) < leftRoom
    ? left + random() * leftRoom
    : shadowRight + random() * rightRoom;
}

/**
 * Advance one creature. `now` is seconds since the loop started; `dt` is the
 * elapsed step, already clamped by the caller.
 */
export function step(s: Swimmer, basin: Basin, now: number, dt: number, maxRadius: number, s0: number) {
  const mote = s.kind === "mote";

  // Wander: slow heading drift, so nothing swims in a straight line.
  s.wobble += s.wobbleRate * dt * (mote ? 0.4 : 1);
  let heading = Math.atan2(s.vy, s.vx) + Math.sin(s.wobble) * 0.16 * dt;
  let speed = Math.hypot(s.vx, s.vy) || s.speed;
  s.vx = Math.cos(heading) * speed;
  s.vy = Math.sin(heading) * speed;

  // Every passing front gives an outward shove, so the animals ride the waves
  // instead of ignoring them.
  const dx = s.x - basin.originX;
  const dy = s.y - basin.originY;
  const distance = Math.hypot(dx, dy) || 1;
  const wave = waveForce(now, distance, maxRadius, s0);
  if (wave > 0.02) {
    const push = wave * (mote ? 520 : 260) * dt;
    s.vx += (dx / distance) * push;
    s.vy += (dy / distance) * push;
  }

  /**
   * The emblem refuses contact. Strength climbs as an inverse square of the gap,
   * so a creature is turned long before it arrives and the hard clamp below is a
   * safety net that should almost never fire.
   *
   * The onset is a distance in pixels, not a multiple of the ellipse. Expressed in
   * ellipse units — the original `um < 3.4` — the reach scales with the shape, so
   * shrinking the keep-out from the whole lockup to the dome alone shrank the
   * warning with it: vertical onset fell from about 833px to 639px, and an octopus,
   * which only rises and cannot leave that axis, arrived with 200px less room to
   * turn in and rode the boundary the rest of the way. Measured: 799 clamp firings
   * in thirty seconds, every one of them an octopus, while fish sat at 2.16 and
   * prawns at 2.72.
   *
   * The ellipse defines the exclusion. The reach is its own quantity.
   */
  const pad = padFor(s);
  const field = emblemDistance(basin, s.x, s.y, pad);

  // Distance from the mark's centre, and the radius of the exclusion surface in
  // that same direction — so `gapPx` is real pixels of clear water.
  const centreDistance = Math.hypot(s.x - basin.emblemX, s.y - basin.emblemY);
  const surface = centreDistance / field.magnitude;
  const gapPx = centreDistance - surface;
  const reach = basin.width * FIELD_REACH;

  if (gapPx < reach) {
    let gx = field.ux / field.rx;
    let gy = field.uy / field.ry;
    const length = Math.hypot(gx, gy) || 1;
    gx /= length;
    gy /= length;
    const gap = Math.max(0.04, gapPx / reach);
    const magnitude = Math.min(mote ? 4200 : 5200, (mote ? 60 : 90) / (gap * gap));
    s.vx += gx * magnitude * dt;
    s.vy += gy * magnitude * dt;
    // A little sideways, so it slips past the mark instead of bouncing straight
    // back off it.
    const sideways = s.slip * 0.26;
    s.vx += -gy * magnitude * sideways * dt;
    s.vy += gx * magnitude * sideways * dt;
  }

  // Soft walls.
  const bx0 = basin.width * BASIN.x0;
  const bx1 = basin.width * BASIN.x1;
  const by0 = basin.height * BASIN.y0;
  const by1 = basin.height * BASIN.y1;
  const wallK = mote ? 1.4 : 2.4;
  if (s.x < bx0) s.vx += (bx0 - s.x) * wallK * dt;
  else if (s.x > bx1) s.vx -= (s.x - bx1) * wallK * dt;
  if (s.y < by0) s.vy += (by0 - s.y) * wallK * dt;
  else if (s.y > by1) s.vy -= (s.y - by1) * wallK * dt;

  // Ease back toward cruising speed. A shove is felt for a while, but repeated
  // fronts must not keep adding energy until everything is flung off the canvas.
  speed = Math.hypot(s.vx, s.vy);
  const eased = Math.min(speed + (s.speed - speed) * Math.min(1, 0.55 * dt), s.speed * 3.4);
  s.vx = (s.vx / speed) * eased;
  s.vy = (s.vy / speed) * eased;

  // Species constraints, applied after the forces so the field can still deflect
  // them without ever turning a fish around or sinking an octopus.
  // How close to the mark a creature is, 0 far away and 1 right against it. Both
  // species relax their axis constraint by this, so neither ends up pressing
  // against the rosette on the one axis it is not allowed to use.
  const near = Math.max(Math.min(1, wave * 0.8), Math.max(0, 1 - distance / (basin.hole * 2.1)));

  if (s.kind === "fish") {
    // Level far from the emblem, free to climb close to it, so a fish can swim
    // around the rosette instead of pressing against it.
    s.vy *= 0.9 + 0.09 * near;
    const cap = (0.22 + 1.3 * near) * Math.abs(s.vx);
    if (Math.abs(s.vy) > cap) s.vy = cap * (s.vy < 0 ? -1 : 1);
    // A front can overpower a fish and drive it the other way. Rather than swim
    // backwards it turns, with a deadband so the facing does not flicker while it
    // is being pushed through zero.
    if (s.vx > 5) s.facing = 1;
    else if (s.vx < -5) s.facing = -1;
    s.vx += s.facing * s.speed * 0.38 * dt;
  } else if (s.kind === "octopus") {
    // Octopuses only rise.
    s.vx *= 0.92;
    s.vy = -Math.abs(s.vy);

    /**
     * "Only rise" and "the emblem pushes outward" contradict each other directly
     * beneath the mark: the field pushes the octopus down, this line flips it
     * straight back up, and the two fight to a standstill.
     *
     * Capping horizontal speed against |vy| made that unrecoverable — as the
     * conflict crushed vy toward zero the cap collapsed with it, closing the only
     * way out. Measured: an octopus parked under the mark at vy ≈ −1.4 against a
     * cruising speed of 25.9, with the closest approach sitting at 1.02 in ellipse
     * units, a fiftieth from the hard clamp.
     *
     * So the cap is taken against cruising speed, which keeps the creature
     * predominantly vertical but lets it slip sideways when its rise is blocked;
     * and the rise itself has a floor, so it can never be held still.
     */
    // The same relaxation the fish gets, on the other axis. Held to 28% of
    // cruising speed in open water, but free to move sideways near the mark —
    // otherwise an octopus that meets the rosette head-on can only press into it,
    // and rides the exclusion boundary the whole way up. Measured without this:
    // 1,171 clamp firings in a sixty-second run, against zero with it.
    const cap = (0.28 + 1.3 * near) * s.speed;
    if (Math.abs(s.vx) > cap) s.vx = cap * (s.vx < 0 ? -1 : 1);
    s.vy = -Math.max(Math.abs(s.vy), s.speed * 0.35);
  }

  s.x += s.vx * dt;
  s.y += s.vy * dt;

  // The hard clamp. Anything inside the ellipse is placed on its boundary and has
  // the inward part of its velocity removed, so it slides around rather than
  // stopping dead. This should never fire — the field above turns them first.
  const after = emblemDistance(basin, s.x, s.y, pad);
  let clamped = false;
  if (after.magnitude < 1) {
    clamped = true;
    s.x = basin.emblemX + (after.ux / after.magnitude) * after.rx;
    s.y = basin.emblemY + (after.uy / after.magnitude) * after.ry;
    let gx = after.ux / after.rx;
    let gy = after.uy / after.ry;
    const length = Math.hypot(gx, gy) || 1;
    gx /= length;
    gy /= length;
    const inward = s.vx * gx + s.vy * gy;
    if (inward < 0) {
      s.vx -= inward * gx;
      s.vy -= inward * gy;
    }
  }

  // Backstop at the basin edge, in case a front overpowers the wall.
  const ex = basin.width * 0.78;
  const ey = basin.height * 0.83;
  if (s.x < -basin.width * 0.04) {
    s.x = -basin.width * 0.04;
    if (s.vx < 0) s.vx = -s.vx * 0.4;
  } else if (s.x > ex) {
    s.x = ex;
    if (s.vx > 0) s.vx = -s.vx * 0.4;
  }
  // Octopuses are exempt from the ceiling: they are allowed to leave upward and
  // re-enter below. Everything else turns back here.
  if (s.kind !== "octopus" && s.y < -basin.height * 0.03) {
    s.y = -basin.height * 0.03;
    if (s.vy < 0) s.vy = -s.vy * 0.4;
  } else if (s.y > ey) {
    s.y = ey;
    if (s.vy > 0) s.vy = -s.vy * 0.4;
  }

  /**
   * An octopus rises through the water *below* the mark, and re-enters at the
   * bottom when it reaches the underside of the lockup.
   *
   * This is not the wrapping plane the basin replaced. That wrapped *everything*
   * on both axes, so once the wave force reached every creature they all left
   * together and the frame emptied — ten visible down to five inside twenty
   * seconds. This is a species rule on one axis, and the population is constant.
   *
   * Its ceiling is the mark, not the top of the frame. "Only rise" and "never
   * touch the emblem" cannot both hold for a creature whose path crosses a mark
   * spanning most of the column: it has no way round, so it presses into the
   * keep-out and slides along it. Measured with the ceiling at the top of the
   * frame and a working field: 799 clamp firings in thirty seconds and 60 samples
   * of an octopus crossing the VAJANA lettering, every one of them the same
   * species. Fish and prawns, which can turn off their axis, never came near.
   *
   * So the octopuses have the lower water and the mark has the upper. Nothing is
   * given up: "only rise" stays absolutely true, and it is the one rule of theirs
   * that carries meaning.
   */
  if (s.kind === "octopus") {
    const ceiling = basin.markBottom;
    // Fade over the last stretch, so leaving and returning is a dissolve rather
    // than a creature blinking out at a fixed line.
    const fadeOver = Math.max(60, s.height);
    s.fade = clamp((s.y - s.height / 2 - ceiling) / fadeOver, 0, 1);

    if (s.y - s.height / 2 < ceiling) {
      s.y = basin.height * BASIN.y1 + s.height / 2;
      s.x = reentryX(s, basin);
      s.vy = -Math.abs(s.speed);
      s.vx = 0;
      s.angle = null;
      s.fade = 0;
    }
  }

  return { clamped };
}

/**
 * The drawn angle. Three different rules, because orientation is not one problem.
 *
 * Binding rotation directly to the velocity is what made everything look like it
 * was spinning, so every one of these chases its target through the shortest arc
 * and never snaps to it.
 */
export function orient(s: Swimmer, dt: number) {
  // A heading derived from a near-zero velocity is meaningless — atan2 of two
  // values hovering around zero swings wildly, and the drawn angle chases the
  // noise. Below a tenth of cruising speed, hold the last angle.
  if (s.angle !== null && Math.hypot(s.vx, s.vy) < s.speed * 0.1) {
    return { angle: s.angle, mirror: s.kind === "fish" && s.facing < 0 };
  }

  if (s.kind === "fish") {
    // A fish holds a horizontal axis and faces its run by mirroring, never by
    // rotating through 180°. The angle is only a small tilt off level.
    const tilt = clamp((s.vy / Math.abs(s.vx || 1)) * 26, -9, 9) * s.facing;
    if (s.angle === null) s.angle = tilt;
    s.angle += (tilt - s.angle) * Math.min(1, 2.4 * dt);
    return { angle: s.angle, mirror: s.facing < 0 };
  }

  if (s.kind === "octopus") {
    // An octopus travels mantle-first. The engraving points up, so the drawn
    // angle is the heading plus 90° — which, with vy forced negative and vx
    // capped at 28% of it, only ever works out to a lean of about ±16°.
    const target = (Math.atan2(s.vy, s.vx) * 180) / Math.PI + 90;
    if (s.angle === null) s.angle = normaliseAngle(target);
    s.angle = normaliseAngle(s.angle + shortestArc(s.angle, target) * Math.min(1, 1.2 * dt));
    return { angle: s.angle, mirror: false };
  }

  // Only a prawn chases a full heading.
  const target = (Math.atan2(s.vy, s.vx) * 180) / Math.PI;
  if (s.angle === null) s.angle = normaliseAngle(target);
  s.angle = normaliseAngle(s.angle + shortestArc(s.angle, target) * Math.min(1, 1.1 * dt));
  return { angle: s.angle, mirror: false };
}

/**
 * The transform for a creature. `x` and `y` are its *centre*, so the box is
 * offset by half its size in both axes — subtracting only the width put
 * everything half its own height below where the collision maths believed it was.
 */
export function transformFor(s: Swimmer, angle: number, mirror: boolean) {
  const base = `translate3d(${(s.x - s.width / 2).toFixed(1)}px,${(s.y - s.height / 2).toFixed(1)}px,0)`;
  if (s.kind === "mote") return base;
  return `${base} rotate(${angle.toFixed(1)}deg)${mirror ? " scaleX(-1)" : ""}`;
}
