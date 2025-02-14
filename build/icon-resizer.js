const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const sizes = [16, 32, 48, 64, 128, 256, 512];
  const iconPath = path.join(__dirname, './icons/icon-512.png');

  // Create PNG directory
  const pngDir = path.join(__dirname, './icons/png');
  fs.mkdirSync(pngDir, { recursive: true });

  // Generate PNGs at different sizes
  for (const size of sizes) {
    await sharp(iconPath)
      .resize(size, size)
      .png()
      .toFile(path.join(pngDir, `${size}x${size}.png`));
  }

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
