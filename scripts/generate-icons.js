import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA icons from favicon.svg...');

  // 192x192 any
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('✓ Created public/pwa-192x192.png');

  // 512x512 any
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('✓ Created public/pwa-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ Created public/apple-touch-icon.png');

  // Maskable 512x512 (with 15% safe padding around all sides on solid dark emerald background #072415)
  const innerSize = Math.round(512 * 0.78); // 400px inside 512px
  const innerBuffer = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 7, g: 36, b: 21, alpha: 1 }, // #072415
    },
  })
    .composite([
      {
        input: innerBuffer,
        top: Math.round((512 - innerSize) / 2),
        left: Math.round((512 - innerSize) / 2),
      },
    ])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('✓ Created public/pwa-maskable-512x512.png');

  console.log('All PWA icons generated successfully!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
