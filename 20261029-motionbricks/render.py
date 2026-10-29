"""generate.py が書いた npz から、骨格の動画 (mp4) を描く。

matplotlib と ffmpeg があればよい (Colab の標準環境で動く)。

    python render.py out/tour.npz
"""

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FFMpegWriter

VIEW = 2.0  # キャラクターを中心に表示する半径 (m)


def bones(parents):
    return [(j, p) for j, p in enumerate(parents) if p >= 0]


def render(npz: Path, out: Path) -> None:
    data = np.load(npz)
    # Y up のデータを、matplotlib の Z up に並べ替える (x, z, y)
    positions = data["positions"][..., [0, 2, 1]]
    targets = data["targets"][..., [0, 2, 1]]
    parents, boundaries, fps = data["parents"], data["boundaries"], float(data["fps"])
    pairs = bones(parents)

    fig = plt.figure(figsize=(6, 6), dpi=120)
    ax = fig.add_subplot(projection="3d")
    writer = FFMpegWriter(fps=fps)
    root = positions[:, 0]

    with writer.saving(fig, str(out), dpi=120):
        for frame in range(len(positions)):
            ax.cla()
            center = root[frame]
            ax.set_xlim(center[0] - VIEW, center[0] + VIEW)
            ax.set_ylim(center[1] - VIEW, center[1] + VIEW)
            ax.set_zlim(0, 2 * VIEW)
            ax.set_box_aspect((1, 1, 1))
            ax.view_init(elev=15, azim=-60)
            ax.set_axis_off()

            # 地面のグリッド
            grid = np.arange(np.floor(center[0] - VIEW), np.ceil(center[0] + VIEW) + 1)
            for x in grid:
                ax.plot(
                    [x, x],
                    [center[1] - VIEW, center[1] + VIEW],
                    [0, 0],
                    color="#ddd",
                    lw=0.5,
                )
            grid = np.arange(np.floor(center[1] - VIEW), np.ceil(center[1] + VIEW) + 1)
            for y in grid:
                ax.plot(
                    [center[0] - VIEW, center[0] + VIEW],
                    [y, y],
                    [0, 0],
                    color="#ddd",
                    lw=0.5,
                )

            # 根の軌跡
            ax.plot(root[: frame + 1, 0], root[: frame + 1, 1], 0, color="#999", lw=1)

            # 今向かっている目標姿勢 (4 姿勢のうち最初のもの)
            step = np.searchsorted(boundaries, frame, side="right") - 1
            if 0 <= step < len(targets):
                ghost = targets[step, 0]
                for j, p in pairs:
                    ax.plot(*zip(ghost[j], ghost[p]), color="#f59e0b", lw=1, alpha=0.6)

            pose = positions[frame]
            color = "#16a34a" if frame < boundaries[0] else "#2563eb"
            for j, p in pairs:
                ax.plot(*zip(pose[j], pose[p]), color=color, lw=2)

            label = "context" if step < 0 else f"step {step + 1}/{len(targets)}"
            ax.set_title(f"{label}   {frame / fps:5.2f} s", fontsize=10)
            writer.grab_frame()
    plt.close(fig)
    print(f"wrote {out}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("npz", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    render(args.npz, args.out or args.npz.with_suffix(".mp4"))


if __name__ == "__main__":
    main()
