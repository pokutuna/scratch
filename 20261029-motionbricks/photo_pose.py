"""GEM-X が写真から推定した姿勢 (pose-image の .pt) を、MotionBricks で使える形に変換する。

GEM-X の venv で実行する。.pt と同じ名前の .npz を書く。

    gem-x/.venv/bin/python photo_pose.py poses/*.pt

npz の中身:
    names      77 関節の名前 (Hips から RightToeEnd)
    rotations  [77, 4] ローカル回転 (xyzw)。MotionBricks のサンプル BVH と同じ関節座標系
    positions  [77, 3] ワールド座標 (m、Y up)。確認用

SOMA の関節座標系は、サンプル BVH の関節座標系と一致する (骨は各関節のローカル X 軸に沿う)。
そのため、GEM-X の姿勢を SOMA で順運動学にかけ、各関節のワールド回転から親に対する回転を
求めれば、そのまま BVH のローカル回転になる。

ワールドは、カメラ座標 (x 右、y 下、z 奥) を X 軸回りに 180 度回した Y up の座標にする。
カメラが水平だとみなした座標なので、見下ろして撮った写真は傾く。傾きは generate.py の
シナリオの pitch で直す。
"""

import argparse
from pathlib import Path

import numpy as np
import torch
from scipy.spatial.transform import Rotation
from soma import SOMALayer, Unit

SOMA_ASSETS = Path(__file__).parent / "gem-x/assets/soma"
CAMERA_TO_WORLD = np.diag([1.0, -1.0, -1.0])


def soma_layer() -> SOMALayer:
    # GEM-X の推論と同じ設定にする (gem/common/soma/body.py)
    return SOMALayer(
        identity_model_type="soma",
        lod="xlo",
        mode="warp",
        device="cpu",
        output_unit=Unit.METERS,
        data_root=str(SOMA_ASSETS),
        correctives_model_path=None,
        reference_pose={"version": "0.2.0"},
        enable_procedural_transforms=True,
    )


def convert(layer: SOMALayer, pt: Path, out: Path) -> None:
    instance = torch.load(pt, weights_only=False)["frames"][0]["instances"][0]
    params = instance["parameters"]
    # scale_params の先頭は全体のスケール (1 固定)、残り 56 個に 4 個の 1 を足して渡す
    local_scale = torch.cat([params["scale_params"][1:], torch.ones(4)])
    layer.prepare_identity(
        params["identity_coeffs"][None], local_scale[None], global_scale=torch.ones(1)
    )
    pose = torch.cat([params["global_orient"], params["body_pose"]])
    result = layer.pose(
        pose[None], pose2rot=False, fk_only=True, apply_correctives=False
    )

    # Root を除いた 77 関節
    world = result["transforms"][0, 1:].detach().numpy().astype(np.float64)
    positions = result["joints"][0].detach().numpy().astype(np.float64)
    names = list(layer._public_joint_names)[1:]
    parents = np.load(SOMA_ASSETS / "SOMA_neutral.npz")[
        "t_pose_world__v0.2.0__parent_ids"
    ][1:] - 1

    rotations = np.empty((len(names), 3, 3))
    for j, p in enumerate(parents):
        if j == 0:
            rotations[j] = CAMERA_TO_WORLD @ world[j, :3, :3]
        else:
            rotations[j] = world[p, :3, :3].T @ world[j, :3, :3]

    np.savez(
        out,
        names=np.array(names),
        rotations=Rotation.from_matrix(rotations).as_quat().astype(np.float32),
        positions=((positions - positions[0]) @ CAMERA_TO_WORLD.T).astype(np.float32),
    )
    print(f"wrote {out}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("pt", type=Path, nargs="+")
    args = parser.parse_args()
    layer = soma_layer()
    for pt in args.pt:
        convert(layer, pt, pt.with_suffix(".npz"))


if __name__ == "__main__":
    main()
