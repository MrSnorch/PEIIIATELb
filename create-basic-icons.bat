@echo off
echo Creating basic PWA icons...

REM Create 192x192 icon
powershell -Command "& {Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap 192,192; $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::FromArgb(22,33,62)); $g.Dispose(); $bmp.Save('icons\icon-192x192.png', [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()}"

REM Create 512x512 icon
powershell -Command "& {Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap 512,512; $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::FromArgb(22,33,62)); $g.Dispose(); $bmp.Save('icons\icon-512x512.png', [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()}"

echo Icons created successfully!
echo Place the generated PNG files in the icons folder
pause