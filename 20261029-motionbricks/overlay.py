"""GEM-X が写真から推定した姿勢 (pose-image の .pt) を確認する画像を描く。

左に写真と 2D の骨格、右に 3D の骨格を横から見た図を並べる。GEM-X の venv で実行する。

    gem-x/.venv/bin/python overlay.py poses/*.pt
"""

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
from PIL import Image

SOMA_NEUTRAL = Path(__file__).parent / "gem-x/assets/soma/SOMA_neutral.npz"


def parents():
    # SOMA の 78 関節から Root を除いた 77 関節 (Hips が根) の親
    ids = np.load(SOMA_NEUTRAL)["t_pose_world__v0.2.0__parent_ids"][1:] - 1
    ids[0] = -1
    return ids


def draw_bones(ax, points, parents, **kwargs):
    for j, p in enumerate(parents):
        if p >= 0:
            ax.plot(*zip(points[j], points[p]), **kwargs)


def overlay(pt: Path, out: Path) -> None:
    data = torch.load(pt, weights_only=False)
    instance = data["frames"][0]["instances"][0]
    keypoints = instance["keypoints_2d"].numpy()
    joints = instance["joints_camera"].numpy()
    pa = parents()

    fig, (photo, side) = plt.subplots(1, 2, figsize=(12, 6), dpi=100)
    photo.imshow(Image.open(data["source"]))
    draw_bones(photo, keypoints, pa, color="#2563eb", lw=2)
    photo.set_axis_off()

    # カメラ座標 (x 右、y 下、z 奥) を、右から見た図 (横軸 z、縦軸 -y) にする
    draw_bones(side, joints[:, [2, 1]] * [1, -1], pa, color="#2563eb", lw=2)
    side.set_aspect("equal")
    side.set_xlabel("depth (m)")
    side.set_title("side view")
    fig.suptitle(pt.stem)
    fig.tight_layout()
    fig.savefig(out)
    plt.close(fig)
    print(f"wrote {out}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("pt", type=Path, nargs="+")
    args = parser.parse_args()
    for pt in args.pt:
        overlay(pt, pt.with_suffix(".png"))


if __name__ == "__main__":
    main()
