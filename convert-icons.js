const sharp = require('sharp');
const path = require('path');

const sizes = [16, 48, 128];
const inputFile = path.join(__dirname, 'icons', 'icon.svg');

async function convertIcon() {
  try {
    for (const size of sizes) {
      const outputFile = path.join(__dirname, 'icons', `icon${size}.png`);
      await sharp(inputFile)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`Successfully created ${size}x${size} icon`);
    }
  } catch (error) {
    console.error('Error converting icons:', error);
    process.exit(1);
  }
}

convertIcon();