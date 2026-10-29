"""MotionBricks (SOMA) で、クリップや写真から取った姿勢を順に置いてつなぐモーションを生成する。

MotionBricks リポジトリのルートで、その venv の Python から実行する。

    .venv/bin/python generate.py --scenario sequence.json --out out/demo

出力:
    <out>.bvh  生成したモーション (30 fps、入力 BVH と同じ階層)
    <out>.npz  各フレームのローカル変換とワールド座標、目標姿勢、区間の境界

シナリオの JSON:
    {
      "start": {"clip": "locomotion/idle/idle_loop_001__A268", "time": 1.0},
      "steps": [
        {"clip": "variations/zombie_walk_180_R_003__A330", "time": 2.0,
         "forward": 2.5, "side": 0.0, "turn": 0, "targets": 4},
        {"pose": "cross_legged", "pitch": -25, "tokens": [12, 16]},
        ...
      ]
    }

start のクリップ時刻で終わる 4 姿勢を最初の文脈にする。各 step は、clip の time から 30 Hz で
targets 個 (1-4) の姿勢を取り、直前の到達点から見て前方 forward m、左 side m、
向きを turn 度 (左回りが正) ずらした位置に置いて、そこまでのモーションを生成する。

clip の代わりに pose を書くと、photo_pose.py が写真から作った poses/<pose>.npz の姿勢を
targets 個並べて目標にする。pitch は写真のカメラの傾きの補正 (度、X 軸回り)。
tokens は生成の長さ (1 トークン 4 姿勢) で、整数か [最小, 最大] (6-16)。"""

import argparse
import json
from pathlib import Path

import numpy as np
import warp as wp
from scipy.spatial.transform import Rotation

from motionbricks.io.bvh import load_bvh
from motionbricks.io.usd import load_skeleton_from_usd
from motionbricks.io.utils import SOMA_SKELETON_PRIM_PATH, get_asset_file
from motionbricks.model.config import MotionBricksInferenceConfig
from motionbricks.model.contract import MODEL_POSES_PER_TOKEN, MODEL_SAMPLE_RATE
from motionbricks.model.soma.contract import SOMA_N1_FP32_ONNX_PATH
from motionbricks.model.soma.engine import MotionBricksSOMAEngine

MOTIONS = Path("assets/motions/soma")
POSES = Path(__file__).parent / "poses"
# 写真の姿勢の骨の長さは、このクリップから取る (サンプルの BVH はどれも同じ骨格)
BONES_CLIP = "locomotion/idle/idle_loop_001__A268"
UP = np.array([0.0, 1.0, 0.0])  # SOMA のモデル空間と BVH は Y up


def forward_kinematics(local: np.ndarray, parents: np.ndarray) -> np.ndarray:
    """ローカル変換 [F, J, 7] (位置, xyzw クォータニオン) からワールド座標 [F, J, 3] を求める。"""
    frames, joints = local.shape[:2]
    positions = np.zeros((frames, joints, 3))
    rotations = [None] * joints
    for j in range(joints):
        rot = Rotation.from_quat(local[:, j, 3:7])
        if parents[j] < 0:
            positions[:, j] = local[:, j, :3]
            rotations[j] = rot
        else:
            p = parents[j]
            positions[:, j] = positions[:, p] + rotations[p].apply(local[:, j, :3])
            rotations[j] = rotations[p] * rot
    return positions


class Rig:
    def __init__(self):
        self.skeleton = load_skeleton_from_usd(
            get_asset_file("human", "soma_base_skel_minimal_no_root.usd"),
            SOMA_SKELETON_PRIM_PATH,
        )
        self.parents = np.asarray(self.skeleton.parent_indices.numpy())
        self.names = list(self.skeleton.joint_names)
        self.left_leg = self.names.index("LeftLeg")
        self.right_leg = self.names.index("RightLeg")
        self.chest = self.names.index("Chest")
        self.clips = {}

    def clip(self, name):
        if name not in self.clips:
            self.clips[name] = load_bvh(str(MOTIONS / f"{name}.bvh"), self.skeleton)
        return self.clips[name]

    def ground_frame(self, pose: np.ndarray) -> tuple[np.ndarray, float]:
        """1 姿勢 [J, 7] の地面上の位置 (XZ) と向き (Y 軸回りの角度) を返す。"""
        world = forward_kinematics(pose[None], self.parents)[0]
        hip_line = world[self.left_leg] - world[self.right_leg]
        facing = np.cross(hip_line, UP)
        if np.linalg.norm(facing) < 0.5 * np.linalg.norm(hip_line):
            # 横向きに寝ていて腰の線が立っているときは、胸の向きを使う
            facing = np.cross(hip_line, world[self.chest] - world[0])
        yaw = np.arctan2(facing[0], facing[2])
        return np.array([world[0, 0], 0.0, world[0, 2]]), yaw

    def photo(self, name, pitch=0.0) -> np.ndarray:
        """poses/<name>.npz の姿勢を、この骨格の 1 姿勢 [J, 7] にする。最も低い関節を地面に置く。"""
        data = np.load(POSES / f"{name}.npz")
        rotations = dict(zip(data["names"], data["rotations"]))
        pose = self.clip(BONES_CLIP).poses[0].numpy().copy()
        for j, joint in enumerate(self.names):
            pose[j, 3:7] = rotations[joint]
        pitched = Rotation.from_euler("x", pitch, degrees=True) * Rotation.from_quat(
            pose[0, 3:7]
        )
        pose[0, 3:7] = pitched.as_quat()
        pose[0, :3] = 0.0
        pose[0, 1] = -forward_kinematics(pose[None], self.parents)[0, :, 1].min()
        return pose

    def sample(
        self, name, start_time, count, poses: wp.array, offset=None, stream=None
    ):
        clip = self.clip(name)
        offset = offset if offset is not None else wp.transform_identity()
        for i in range(count):
            clip.sample(
                start_time + i / MODEL_SAMPLE_RATE,
                poses[i],
                root_offset=offset,
                stream=stream,
            )


def to_transform(position, yaw) -> wp.transform:
    q = Rotation.from_rotvec(UP * yaw).as_quat()
    return wp.transform(wp.vec3(*position), wp.quat(*q))


def placement(
    rig: Rig, reference: np.ndarray, target: np.ndarray, step: dict
) -> wp.transform:
    """target を、reference から見て step の forward/side/turn の位置に移す変換を返す。"""
    ref_pos, ref_yaw = rig.ground_frame(reference)
    tgt_pos, tgt_yaw = rig.ground_frame(target)
    forward = np.array([np.sin(ref_yaw), 0.0, np.cos(ref_yaw)])
    left = np.cross(UP, forward)
    goal_pos = (
        ref_pos + forward * step.get("forward", 0.0) + left * step.get("side", 0.0)
    )
    goal_yaw = ref_yaw + np.radians(step.get("turn", 0.0))
    # goal = offset * target なので offset = goal * inverse(target)
    goal = to_transform(goal_pos, goal_yaw)
    current = to_transform(tgt_pos, tgt_yaw)
    return wp.mul(goal, wp.transform_inverse(current))


def offset_pose(pose: np.ndarray, offset: wp.transform) -> np.ndarray:
    """1 姿勢 [J, 7] の根を offset で動かす。"""
    placed = pose.copy()
    root = wp.mul(offset, wp.transform(wp.vec3(*pose[0, :3]), wp.quat(*pose[0, 3:7])))
    placed[0] = np.array([*root.p, *root.q])
    return placed


def inference_config(step: dict) -> MotionBricksInferenceConfig | None:
    tokens = step.get("tokens")
    if tokens is None:
        return None
    low, high = (tokens, tokens) if isinstance(tokens, int) else tokens
    return MotionBricksInferenceConfig(allowed_token_counts=tuple(range(low, high + 1)))


def write_bvh(
    path: Path, source_bvh: Path, names: list[str], local: np.ndarray
) -> None:
    """source_bvh の階層をそのまま使い、local [F, J, 7] を MOTION として書き出す。"""
    header, channels, joints = [], [], []
    with source_bvh.open() as f:
        for line in f:
            tokens = line.split()
            if tokens and tokens[0] == "MOTION":
                break
            header.append(line.rstrip("\n"))
            if tokens and tokens[0] in ("ROOT", "JOINT"):
                joints.append(tokens[1].rsplit(":", 1)[-1])
            elif tokens and tokens[0] == "CHANNELS":
                channels.append((joints[-1], tokens[2:]))

    index = {name: i for i, name in enumerate(names)}
    frames = local.shape[0]
    columns = []
    for joint, chans in channels:
        positions = [c for c in chans if c.endswith("position")]
        order = "".join(c[0].upper() for c in chans if c.endswith("rotation"))
        j = index.get(joint)
        # 生成した骨格にない関節 (Root など) は原点、無回転にする
        if positions:
            pos = local[:, j, :3] * 100.0 if j is not None else np.zeros((frames, 3))
            columns.extend(pos[:, "XYZ".index(c[0].upper())] for c in positions)
        if order:
            if j is None:
                euler = np.zeros((frames, 3))
            else:
                euler = Rotation.from_quat(local[:, j, 3:7]).as_euler(
                    order, degrees=True
                )
            columns.extend(euler[:, k] for k in range(len(order)))

    motion = np.stack(columns, axis=1)
    with path.open("w") as f:
        f.write("\n".join(header) + "\n")
        f.write(
            f"MOTION\nFrames: {frames}\nFrame Time: {1.0 / MODEL_SAMPLE_RATE:.6f}\n"
        )
        np.savetxt(f, motion, fmt="%.5f")


def generate(scenario: dict, out: Path) -> None:
    wp.init()
    wp.set_device("cuda:0")
    rig = Rig()
    n = MODEL_POSES_PER_TOKEN
    # モデル空間 (Y up) のまま入出力する
    engine = MotionBricksSOMAEngine(
        SOMA_N1_FP32_ONNX_PATH, model_to_runtime=wp.transform_identity()
    )
    with engine, wp.ScopedStream(engine.stream):
        context = engine.create_input(rig.skeleton)
        target = engine.create_input(rig.skeleton)
        output = engine.create_output(rig.skeleton)
        context_poses = wp.empty_like(context.poses)
        target_poses = wp.empty_like(context.poses)

        start = scenario["start"]
        rig.sample(
            start["clip"],
            start["time"] - (n - 1) / MODEL_SAMPLE_RATE,
            n,
            context_poses,
            stream=engine.stream,
        )
        motion = [context_poses.numpy()]
        targets, boundaries = [], [n]

        for i, step in enumerate(scenario["steps"]):
            count = step.get("targets", n)
            reference = context_poses.numpy()[-1]
            if "pose" in step:
                pose = rig.photo(step["pose"], step.get("pitch", 0.0))
                pose = offset_pose(pose, placement(rig, reference, pose, step))
                target_poses = wp.array(
                    np.repeat(pose[None], n, axis=0), dtype=wp.transform
                )
            else:
                # 先に元の位置で取り、置き場所を決めてから取り直す
                rig.sample(
                    step["clip"],
                    step["time"],
                    count,
                    target_poses,
                    stream=engine.stream,
                )
                offset = placement(rig, reference, target_poses.numpy()[0], step)
                target_poses.zero_()
                rig.sample(
                    step["clip"],
                    step["time"],
                    count,
                    target_poses,
                    offset=offset,
                    stream=engine.stream,
                )
            context.update_from_poses(context_poses, stream=engine.stream)
            # 目標が 4 姿勢に満たないときは、残りを最後の姿勢で埋めてくれる
            target.update_from_poses(target_poses[:count], stream=engine.stream)
            engine.generate_animation(
                context, target, output, config=inference_config(step)
            )
            engine.synchronize()

            frames = output.num_frames
            poses = output.poses[:frames].numpy()
            label = step.get("clip") or step["pose"]
            print(
                f"step {i}: {label} -> {frames} frames ({frames / MODEL_SAMPLE_RATE:.2f} s)"
            )
            motion.append(poses)
            placed = target_poses.numpy()[:count]
            targets.append(np.concatenate([placed, placed[-1:].repeat(n - count, 0)]))
            boundaries.append(boundaries[-1] + frames)
            context_poses = wp.clone(output.poses[frames - n : frames])

    local = np.concatenate(motion)
    out.parent.mkdir(parents=True, exist_ok=True)
    write_bvh(
        out.with_suffix(".bvh"), MOTIONS / f"{start['clip']}.bvh", rig.names, local
    )
    np.savez(
        out.with_suffix(".npz"),
        positions=forward_kinematics(local, rig.parents).astype(np.float32),
        local=local.astype(np.float32),
        names=np.array(rig.names),
        parents=rig.parents,
        targets=np.stack([forward_kinematics(t, rig.parents) for t in targets]).astype(
            np.float32
        ),
        boundaries=np.array(boundaries),
        fps=MODEL_SAMPLE_RATE,
    )
    print(
        f"wrote {out}.bvh / .npz: {local.shape[0]} frames ({local.shape[0] / MODEL_SAMPLE_RATE:.2f} s)"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--scenario", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    generate(json.loads(args.scenario.read_text()), args.out)


if __name__ == "__main__":
    main()
