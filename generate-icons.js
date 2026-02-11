const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

const svgContent = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0C0C14"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.3125}" fill="#FF6B35"/>
  <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Inter, system-ui, sans-serif" font-size="${size*0.25}" font-weight="bold" text-anchor="middle" fill="#0C0C14">O</text>
</svg>
`;

async function generateIcons() {
  for (const size of sizes) {
    const svg = Buffer.from(svgContent(size));
    await sharp(svg)
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
  
  // Apple Touch Icon
  const appleSvg = Buffer.from(svgContent(180));
  await sharp(appleSvg)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

generateIcons().catch(console.error);