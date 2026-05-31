import os
from PIL import Image, ImageDraw

def draw_shield(size):
    # Create image with transparent alpha channel
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Background Rounded Rect with Violet Gradient (represented simply as rounded box)
    r = size // 5  # Radius
    # Outer boundaries
    pad = max(1, size // 12)
    left, top = pad, pad
    right, bottom = size - pad, size - pad
    
    # Draw dark violet/indigo background with nice rounded corners
    draw.rounded_rectangle(
        [left, top, right, bottom],
        radius=r,
        fill=(139, 92, 246, 255), # Vivid violet #8b5cf6
        outline=(167, 139, 250, 255), # #a78bfa border
        width=max(1, size // 32)
    )
    
    # 2. Draw a minimalist shield symbol in the center
    # Shield shape points relative to dimensions
    cx = size // 2
    cy = size // 2
    w = size // 3
    h = size // 3
    
    # Simple shield polygon vertices
    # Top-left, Top-right, Bottom-mid, curves
    points = [
        (cx - w, cy - h),  # Top Left
        (cx + w, cy - h),  # Top Right
        (cx + w, cy),      # Mid Right
        (cx, cy + h),      # Bottom Point
        (cx - w, cy)       # Mid Left
    ]
    
    # Draw shield outline in white
    draw.polygon(
        points,
        fill=(255, 255, 255, 255)
    )
    
    # Subtle inner cutout line/detail for premium look
    draw.polygon(
        [
            (cx - w + max(1, size // 16), cy - h + max(1, size // 16)),
            (cx, cy - h + max(1, size // 16)),
            (cx, cy + h - max(2, size // 10)),
            (cx - w + max(1, size // 16), cy)
        ],
        fill=(139, 92, 246, 255)
    )

    return img

def main():
    os.makedirs('icons', exist_ok=True)
    sizes = [16, 48, 128]
    for size in sizes:
        img = draw_shield(size)
        img.save(f'icons/icon-{size}.png', 'PNG')
        print(f"Generated icons/icon-{size}.png")

if __name__ == '__main__':
    main()
