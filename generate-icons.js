// Simple Node.js script to generate PWA icons from SVG
// This requires Node.js and sharp library
// Run with: npm install sharp && node generate-icons.js

const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
    const svgBuffer = fs.readFileSync('icon.svg');
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(`icons/icon-${size}x${size}.png`);
        console.log(`Generated icon-${size}x${size}.png`);
    }
    
    console.log('All icons generated successfully!');
}

// Check if running directly
if (require.main === module) {
    generateIcons().catch(console.error);
}

module.exports = { generateIcons };