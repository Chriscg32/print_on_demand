#!/bin/bash

# Logo Variation Generator for ButterflyBlue Creations
# This script requires ImageMagick to be installed
# Install on Mac: brew install imagemagick
# Install on Linux: sudo apt-get install imagemagick

echo "ButterflyBlue Creations Logo Generator"
echo "======================================"
echo

# Check if the source logo exists
if [ ! -f "primary_logo.png" ]; then
    echo "ERROR: primary_logo.png not found in this directory!"
    echo "Please copy your logo file to this directory and rename it to \"primary_logo.png\""
    echo
    exit 1
fi

echo "Found primary logo. Generating variations..."
echo

# Create white version for dark backgrounds
echo "Creating white logo version..."
convert primary_logo.png -channel RGB -fuzz 10% -fill white -opaque black white_logo.png

# Create square version for social media
echo "Creating square social media version..."
convert primary_logo.png -resize 1000x1000 -background none -gravity center -extent 1000x1000 square_logo.png

# Create favicon
echo "Creating favicon..."
convert primary_logo.png -resize 16x16 -background none favicon.ico

echo
echo "Logo variations created successfully!"
echo
echo "NOTE: For the vector version (SVG), please use a vector editing program like Inkscape or Adobe Illustrator."
echo "A proper vector conversion cannot be done automatically from a raster image."
echo
echo "Next steps:"
echo "1. Review the generated files and make any necessary adjustments"
echo "2. Create a vector version using a vector editing program"
echo "3. Update your brand style guide with these new logo variations"
echo