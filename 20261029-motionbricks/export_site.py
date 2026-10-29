# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "scipy"]
# ///
"""generate.py が書いた npz を、site/ のビューアーが読む JSON にする。

    uv run export_site.py out/photos.npz out/tour.npz

site/motions/<名前>.json と、一覧の site/motions/index.json を書く。
座標は mm 単位の整数にして、平らな配列で持つ。

VRM モデルを動かすために、VRM の人型ボーンごとに「T ポーズからのワールド回転」も書く。
SOMA の T ポーズ (Y up、+Z 向き、左手が +X) は VRM の正規化ボーンの T ポーズと同じ向きなので、
ビューアーはこの差分から親子の相対回転を求めれば、そのまま正規化ボーンに入れられる。
T ポーズは GEM-X と一緒に取ってくる SOMA のアセット (make gem-x) から読む。
"""

import argparse
import json
from pathlib import Path

import numpy as np
from scipy.spatial.transform import Rotation

ROOT = Path(__file__).parent
SITE = ROOT / "site/motions"
SCENARIOS = ROOT / "scenarios"
SOMA_NEUTRAL = ROOT / "gem-x/assets/soma/SOMA_neutral.npz"

# VRM の人型ボーン -> SOMA の関節。間の関節 (Neck2 や指の付け根) の回転は、差分を取るので子に含まれる
VRM_BONES = {
    "hips": "Hips",
    "spine": "Spine1",
    "chest": "Spine2",
    "upperChest": "Chest",
    "neck": "Neck1",
    "head": "Head",
}
for side, soma in (("left", "Left"), ("right", "Right")):
    VRM_BONES |= {
        f"{side}Shoulder": f"{soma}Shoulder",
        f"{side}UpperArm": f"{soma}Arm",
        f"{side}LowerArm": f"{soma}ForeArm",
        f"{side}Hand": f"{soma}Hand",
        f"{side}UpperLeg": f"{soma}Leg",
        f"{side}LowerLeg": f"{soma}Shin",
        f"{side}Foot": f"{soma}Foot",
        f"{side}Toes": f"{soma}ToeBase",
        f"{side}ThumbProximal": f"{soma}HandThumb1",
        f"{side}ThumbIntermediate": f"{soma}HandThumb2",
        f"{side}ThumbDistal": f"{soma}HandThumb3",
    }
    for vrm, finger in (
        ("Index", "Index"),
        ("Middle", "Middle"),
        ("Ring", "Ring"),
        ("Little", "Pinky"),
    ):
        VRM_BONES |= {
            f"{side}{vrm}Proximal": f"{soma}Hand{finger}2",
            f"{side}{vrm}Intermediate": f"{soma}Hand{finger}3",
            f"{side}{vrm}Distal": f"{soma}Hand{finger}4",
        }


def mm(values: np.ndarray) -> list[int]:
    return np.rint(values * 1000).astype(int).ravel().tolist()


def rest_rotations(names: list[str]) -> Rotation:
    soma = np.load(SOMA_NEUTRAL)
    rest_names = list(soma["t_pose_world__v0.2.0__joint_names"])
    rest = soma["t_pose_world__v0.2.0"]
    return Rotation.from_matrix(np.stack([rest[rest_names.index(n)] for n in names]))


def world_rotations(local: np.ndarray, parents: np.ndarray) -> list[Rotation]:
    """ローカル変換 [F, J, 7] から、関節ごとのワールド回転 (F 個まとめた Rotation) を求める。"""
    world = []
    for j, p in enumerate(parents):
        rot = Rotation.from_quat(local[:, j, 3:7])
        world.append(rot if p < 0 else world[p] * rot)
    return world


def bone_rotations(data) -> dict:
    """VRM の人型ボーンごとの、T ポーズからのワールド回転 [F, 4] (xyzw、1e4 倍の整数)。"""
    names = list(data["names"])
    world = world_rotations(data["local"], data["parents"])
    joints = [names.index(soma) for soma in VRM_BONES.values()]
    rest = rest_rotations([names[j] for j in joints])
    rotations = {}
    for k, (bone, j) in enumerate(zip(VRM_BONES, joints)):
        quat = (world[j] * rest[k].inv()).as_quat()
        rotations[bone] = np.rint(quat * 10000).astype(int).ravel().tolist()
    return rotations


def export(npz: Path) -> dict:
    data = np.load(npz)
    scenario = json.loads((SCENARIOS / f"{npz.stem}.json").read_text())
    labels = [
        (step.get("clip") or step["pose"]).rsplit("/", 1)[-1]
        for step in scenario["steps"]
    ]
    positions = data["positions"]
    motion = {
        "fps": float(data["fps"]),
        "frames": positions.shape[0],
        "joints": positions.shape[1],
        "parents": data["parents"].tolist(),
        "boundaries": data["boundaries"].tolist(),
        "labels": labels,
        # 最初の文脈 (待機) の腰の高さ。VRM の腰の高さとの比で、移動量を合わせる
        "hipHeight": float(positions[0, 0, 1]),
        # 各区間の目標は 4 姿勢あるが、ビューアーは最初の 1 姿勢だけ描く
        "targets": mm(data["targets"][:, 0]),
        "positions": mm(positions),
        "bones": bone_rotations(data),
    }
    out = SITE / f"{npz.stem}.json"
    out.write_text(json.dumps(motion, separators=(",", ":")))
    print(f"wrote {out}")
    return {"name": npz.stem, "frames": motion["frames"], "fps": motion["fps"]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("npz", type=Path, nargs="+")
    args = parser.parse_args()
    SITE.mkdir(parents=True, exist_ok=True)
    index = [export(npz) for npz in args.npz]
    (SITE / "index.json").write_text(json.dumps(index, indent=2) + "\n")


if __name__ == "__main__":
    main()
