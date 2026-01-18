@echo off
echo Creating PWA icons from SVG...

REM This script assumes you have ImageMagick installed
REM If not, you can manually create the icons or use online converters

echo Please create the following icon sizes from icon.svg:
echo - 72x72.png
echo - 96x96.png  
echo - 128x128.png
echo - 144x144.png
echo - 152x152.png
echo - 192x192.png
echo - 384x384.png
echo - 512x512.png

echo Place all PNG files in a folder named "icons" in the same directory as index.html

echo Alternatively, you can use online SVG to PNG converters:
echo 1. Go to https://convertio.co/svg-png/
echo 2. Upload icon.svg
echo 3. Convert to PNG with the required sizes
echo 4. Rename and organize in the icons folder

pause