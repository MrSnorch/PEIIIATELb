#!/usr/bin/env python3
"""
Simple Python script to generate PWA icons from SVG
Requires: pip install cairosvg pillow
"""

import os
from PIL import Image
import cairosvg

def svg_to_png(svg_path, png_path, size):
    """Convert SVG to PNG with specified size"""
    cairosvg.svg2png(
        url=svg_path,
        write_to=png_path,
        output_width=size,
        output_height=size
    )
    print(f"Generated {png_path}")

def main():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Generate required icon sizes
    sizes = [192, 512]
    
    for size in sizes:
        png_path = f'icons/icon-{size}x{size}.png'
        try:
            svg_to_png('icon.svg', png_path, size)
        except Exception as e:
            print(f"Error generating {png_path}: {e}")
            # Create a simple placeholder image
            img = Image.new('RGB', (size, size), color='#16213e')
            img.save(png_path)
            print(f"Created placeholder {png_path}")

if __name__ == '__main__':
    main()
    print("Icon generation complete!")