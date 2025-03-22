@echo off
REM Logo Variation Generator for ButterflyBlue Creations
REM This script requires ImageMagick to be installed and in your PATH
REM Download ImageMagick from: https://imagemagick.org/script/download.php

echo ButterflyBlue Creations Logo Generator
echo ======================================
echo.

REM Check if the source logo exists
if not exist "primary_logo.png" (
    echo ERROR: primary_logo.png not found in this directory!
    echo Please copy your logo file to this directory and rename it to "primary_logo.png"
    echo.
    pause
    exit /b
)

echo Found primary logo. Generating variations...
echo.

REM Create white version for dark backgrounds
echo Creating white logo version...
magick convert primary_logo.png -channel RGB -fuzz 10%% -fill white -opaque black white_logo.png

REM Create square version for social media
echo Creating square social media version...
magick convert primary_logo.png -resize 1000x1000 -background transparent -gravity center -extent 1000x1000 square_logo.png

REM Create favicon
echo Creating favicon...
magick convert primary_logo.png -resize 16x16 -background transparent favicon.ico

echo.
echo Logo variations created successfully!
echo.
echo NOTE: For the vector version (SVG), please use a vector editing program like Inkscape or Adobe Illustrator.
echo A proper vector conversion cannot be done automatically from a raster image.
echo.
echo Next steps:
echo 1. Review the generated files and make any necessary adjustments
echo 2. Create a vector version using a vector editing program
echo 3. Update your brand style guide with these new logo variations
echo.
pause