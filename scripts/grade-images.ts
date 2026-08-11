/**
 * Grades the source photography and writes it into /public/img.
 *
 * The raw set splits into hard midday turquoise and warm evening gold, and only
 * the warm half belongs to this brand. Every frame is graded warm before it ships:
 * saturation down on the sea, warmth up, contrast slightly down. On top of that the
 * page applies a depth-driven filter at runtime (--imgfx), so this bake is the
 * brand grade only — not the depth.
 *
 * Run with: npx vite-node scripts/grade-images.ts
 *
 * Deliberately a build-time script rather than a CSS filter. A filter on a large
 * photograph is a per-frame compositing cost on exactly the screens this site is
 * read on, and it cannot do a crop.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { IMAGES, SOURCE_DIR, PUBLIC_DIR } from "../content/images";

async function main() {
  mkdirSync(join(process.cwd(), PUBLIC_DIR), { recursive: true });

  for (const image of IMAGES) {
    const input = join(SOURCE_DIR, image.source);
    let pipeline = sharp(input).rotate();

    if (image.crop) {
      const [left, top, width, height] = image.crop;
      pipeline = pipeline.extract({ left, top, width, height });
    }

    /**
     * Warm, not sepia. Do not use sharp's `tint()` here — it works off luminance,
     * so it desaturates the frame before colouring it and the sea comes out grey.
     * The warmth is a per-channel gain instead: red up, blue down, green held. Then
     * saturation slightly off the sea and a touch of contrast out of it.
     */
    const graded = image.ungraded
      ? pipeline
      : pipeline
          .modulate({ saturation: 0.92, brightness: 1.01 })
          .linear([1.035, 1.0, 0.945], [-2, 0, 6]);

    const out = join(process.cwd(), PUBLIC_DIR, `${image.slug}.jpg`);
    const info = await graded
      .resize({ width: image.width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);

    console.log(`${image.slug.padEnd(18)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
  }
}

main();
