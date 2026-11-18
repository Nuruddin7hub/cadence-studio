# Usage: python cook/color_check.py <reference.png> <render.png>
import sys
import numpy as np
from PIL import Image

def cells(path, grid=4):
    ref_img = Image.open(path).convert("RGB")
    w_src, h_src = ref_img.size
    target_w = 256
    target_h = max(64, round(256 * h_src / w_src))
    img = ref_img.resize((target_w, target_h)).convert("HSV")
    hsv = np.asarray(img).astype(float) / 255.0
    h, w = hsv.shape[:2]
    out = []
    for y in range(grid):
        for x in range(grid):
            c = hsv[y * h // grid:(y + 1) * h // grid, x * w // grid:(x + 1) * w // grid]
            out.append((c[..., 1].mean(), c[..., 2].mean()))
    return np.array(out)

if len(sys.argv) < 3:
    print("usage: python cook/color_check.py reference.png render.png")
    sys.exit(1)

ref_cells = cells(sys.argv[1])
ren_cells = cells(sys.argv[2])
d = ren_cells - ref_cells
for name, col in (("saturation", 0), ("brightness", 1)):
    worst_idx = int(np.abs(d[:, col]).argmax())
    worst = d[worst_idx, col]
    print(f"{name}: mean delta {d[:, col].mean():+.3f}, worst cell ({worst_idx // 4},{worst_idx % 4}) {worst:+.3f}")
