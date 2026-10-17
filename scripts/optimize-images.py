"""Create web derivatives without changing the approved source artwork.

Run with Python + Pillow. Source files are kept for future exports.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [
    ("KaosNauts.png", "wordmark", [432, 864, 1200]),
    ("images/launch-site-gouache.png", "launch-site", [480, 960, 1440]),
    ("images/space-gouache.png", "space", [480, 960, 1113]),
    ("images/albert-workshop.webp", "workshop", [480, 960, 1122]),
]

for source, stem, widths in SOURCES:
    with Image.open(ROOT / source) as image:
        for width in widths:
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            output = ROOT / "images" / f"{stem}-{width}.webp"
            resized.save(output, "WEBP", quality=90, method=6)
            print(f"{output.name}: {width}x{height}, {output.stat().st_size:,} bytes")
