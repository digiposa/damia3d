// One-shot portrait optimizer. Bearer portraits are only ever shown in a 76px HUD
// frame, so the source art (≈800–1400px, 1.5–2.5MB each) is wildly oversized and
// slows every Vite build. This downscales each portrait to PORTRAIT_W px wide
// (keeping aspect) and re-saves it in place — a ~20× size cut with no visible loss.
//
// jimp is not a committed dependency (it would bloat the deploy's `npm ci`). To run:
//   npm i jimp && node scripts/optimize-portraits.mjs && npm remove jimp
import { Jimp } from "jimp";
import { readdirSync } from "node:fs";

const DIR = "src/assets/portraits";
const PORTRAIT_W = 256; // ~3.4× the 76px display — crisp on retina

for (const file of readdirSync(DIR).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
  const path = `${DIR}/${file}`;
  const img = await Jimp.read(path);
  if (img.bitmap.width <= PORTRAIT_W) {
    console.log(`${file}: already ${img.bitmap.width}px, skipped`);
    continue;
  }
  const h = Math.round(img.bitmap.height * (PORTRAIT_W / img.bitmap.width));
  img.resize({ w: PORTRAIT_W, h });
  await img.write(path);
  console.log(`${file} -> ${PORTRAIT_W}x${h}`);
}
