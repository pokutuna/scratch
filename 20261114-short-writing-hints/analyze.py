# /// script
# requires-python = ">=3.11"
# dependencies = ["fugashi", "unidic-lite"]
# ///
"""runs/ の生成結果を形態素解析し、指標とトークン列を site/data.js に書き出す。

ページを file:// で開いても読めるよう、fetch ではなく script 要素で読む JS にする。

本文は Markdown のブロック (見出し、段落、箇条書きの項目、引用、コード、表) に分ける。
語種や文の指標は地の文 (段落、箇条書きの項目、引用) だけで数え、見出し、コード、表は除く。
語種は UniDic の goshu (和/漢/外/混/固) を使い、助詞・助動詞・記号・空白を除いた語で数える。
"""

import json
import re
from pathlib import Path

import fugashi

ROOT = Path(__file__).parent
FUNC_POS = {"助詞", "助動詞"}
SKIP_POS = {"補助記号", "空白", "記号"}
GOSHU_CODE = {"和": "wa", "漢": "kan", "外": "gai", "混": "kon", "固": "ko"}
DESU_MASU = re.compile(r"(です|ます|ました|でした|ません|ましょう|でしょう)$")
SENT_SPLIT = re.compile(r"(?<=[。！？])")
# 和語の言い換えを避けたときに出やすい、硬い漢語の述語
STIFF = re.compile(r"(不?可能(である|な|だ)|困難|に該当|が存在|が発生|を実施|を実現)")
PROSE = {"p", "li", "quote"}

HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
LIST_ITEM = re.compile(r"^(\s*)([-*+]|\d+[.)])\s+(.*)$")
FENCE = re.compile(r"^\s*(```|~~~)(.*)$")
HR = re.compile(r"^\s*([-*_])(\s*\1){2,}\s*$")
INLINE = re.compile(r"(`[^`]+`)|\*\*(.+?)\*\*|__(.+?)__|\[([^\]]+)\]\([^)]+\)")

tagger = fugashi.Tagger()


def parse_blocks(text: str) -> list[dict]:
    """Markdown をブロックの列に分ける。インラインの装飾はこの段階では残す。"""
    lines = text.strip().splitlines()
    blocks: list[dict] = []
    para: list[str] = []

    def flush():
        if para:
            blocks.append({"type": "p", "md": "".join(s.strip() for s in para)})
            para.clear()

    i = 0
    while i < len(lines):
        line = lines[i]
        if m := FENCE.match(line):
            flush()
            fence, lang = m.group(1), m.group(2).strip()
            body = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith(fence):
                body.append(lines[i])
                i += 1
            blocks.append({"type": "code", "lang": lang, "text": "\n".join(body)})
        elif not line.strip():
            flush()
        elif m := HEADING.match(line):
            flush()
            blocks.append(
                {"type": "h", "level": len(m.group(1)), "md": m.group(2).strip()}
            )
        elif HR.match(line):
            flush()
            blocks.append({"type": "hr"})
        elif line.lstrip().startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            blocks.append({"type": "table", "rows": rows})
            continue
        elif m := LIST_ITEM.match(line):
            flush()
            item = {
                "type": "li",
                "depth": len(m.group(1).expandtabs(4)) // 2,
                "ordered": m.group(2)[0].isdigit(),
                "md": m.group(3).strip(),
            }
            # 次の行が字下げされた続きの行なら、同じ項目につなげる
            while (
                i + 1 < len(lines)
                and lines[i + 1].startswith((" ", "\t"))
                and lines[i + 1].strip()
                and not LIST_ITEM.match(lines[i + 1])
            ):
                i += 1
                item["md"] += lines[i].strip()
            blocks.append(item)
        elif line.lstrip().startswith(">"):
            flush()
            body = []
            while i < len(lines) and lines[i].lstrip().startswith(">"):
                body.append(lines[i].lstrip()[1:].strip())
                i += 1
            blocks.append({"type": "quote", "md": "".join(body)})
            continue
        else:
            para.append(line)
        i += 1
    flush()
    return blocks


def token_class(w) -> str:
    """ビューで色分けするためのトークン分類。"""
    pos1 = w.feature.pos1
    if pos1 in SKIP_POS:
        return "sym"
    if pos1 == "接続詞":
        return "conj"
    if pos1 in FUNC_POS:
        return "fn"
    return GOSHU_CODE.get(w.feature.goshu, "other")


def tokenize(md: str, counts: dict | None, conjunctions: dict) -> tuple[list, str, int]:
    """インラインの装飾を外してトークン列にする。

    返り値は ([表層形, 分類, 太字なら 1] の列, 装飾を外した文字列, 太字の数)。
    インラインコードは解析せず、分類 "code" の 1 トークンにする。
    counts を渡したときだけ、語の数と接続詞を足し込む。
    """
    segs: list[tuple[str, str]] = []  # (文字列, "text" | "bold" | "code")
    pos = 0
    bold = 0
    for m in INLINE.finditer(md):
        if m.start() > pos:
            segs.append((md[pos : m.start()], "text"))
        if m.group(1):
            segs.append((m.group(1)[1:-1], "code"))
        elif m.group(2) or m.group(3):
            # 太字の中のインラインコードも分ける
            for piece in re.split(r"(`[^`]+`)", m.group(2) or m.group(3)):
                if piece.startswith("`") and piece.endswith("`") and len(piece) > 1:
                    segs.append((piece[1:-1], "boldcode"))
                elif piece:
                    segs.append((piece, "bold"))
            bold += 1
        else:
            segs.append((m.group(4), "text"))
        pos = m.end()
    if pos < len(md):
        segs.append((md[pos:], "text"))

    tokens = []
    for s, kind in segs:
        b = 1 if kind in ("bold", "boldcode") else 0
        if kind in ("code", "boldcode"):
            tokens.append([s, "code", b])
            continue
        joined = ""
        for w in tagger(s):
            cls = token_class(w)
            if counts is not None:
                counts[cls] += 1
                if cls == "conj":
                    conjunctions[w.surface] = conjunctions.get(w.surface, 0) + 1
            surface = w.white_space + w.surface
            tokens.append([surface, cls, b])
            joined += surface
        if len(joined) < len(s):  # 末尾の空白は tagger が返さない
            tokens.append([s[len(joined) :], "sym", b])
    plain = "".join(t[0] for t in tokens)
    return tokens, plain, bold


def analyze(text: str) -> dict:
    blocks = parse_blocks(text)
    counts = {
        k: 0 for k in ["wa", "kan", "gai", "kon", "ko", "other", "conj", "fn", "sym"]
    }
    conjunctions: dict[str, int] = {}
    prose_plain: list[str] = []
    sent_plain: list[str] = []  # 文の指標に使う段落と引用
    list_chars = bold = 0

    out_blocks = []
    for b in blocks:
        if b["type"] in PROSE or b["type"] == "h":
            is_prose = b["type"] in PROSE
            tokens, plain, nb = tokenize(
                b["md"], counts if is_prose else None, conjunctions
            )
            bold += nb
            ob = {k: v for k, v in b.items() if k != "md"}
            ob["tokens"] = tokens
            out_blocks.append(ob)
            if is_prose:
                prose_plain.append(plain)
                if b["type"] == "li":
                    list_chars += len(re.sub(r"\s", "", plain))
                else:
                    sent_plain.append(plain)
        else:
            out_blocks.append(b)

    body = re.sub(r"\s", "", "".join(prose_plain))
    chars = len(body)
    sentences = [s for p in sent_plain for s in SENT_SPLIT.split(p) if s.strip()]
    sent_chars = len(re.sub(r"\s", "", "".join(sent_plain)))
    n_sent = len(sentences)
    content = sum(counts[k] for k in ["wa", "kan", "gai", "kon", "ko", "other", "conj"])
    # 接続詞は和語が多いので、和語に含めて数える
    wa_total = counts["wa"] + counts["conj"]

    # 文あたりの指標は、段落と引用の中だけで数える
    particles = aux = conj = 0
    for p in sent_plain:
        for w in tagger(p):
            if w.feature.pos1 == "助詞":
                particles += 1
            elif w.feature.pos1 == "助動詞":
                aux += 1
            elif w.feature.pos1 == "接続詞":
                conj += 1

    def ratio(n: int, d: int) -> float:
        return round(n / d, 4) if d else 0.0

    def per_sent(n: int) -> float:
        return round(n / n_sent, 2) if n_sent else 0

    def per_1k(n: int) -> float:
        return round(n * 1000 / chars, 2) if chars else 0

    types = [b["type"] for b in blocks]
    return {
        "metrics": {
            "chars": chars,
            "paragraphs": types.count("p"),
            "sentences": n_sent,
            "chars_per_sentence": round(sent_chars / n_sent, 1) if n_sent else 0,
            "wa_ratio": ratio(wa_total, content),
            "kan_ratio": ratio(counts["kan"], content),
            "gai_ratio": ratio(counts["gai"], content),
            "particles_per_sentence": per_sent(particles),
            "aux_per_sentence": per_sent(aux),
            "conj_per_sentence": per_sent(conj),
            "desu_masu_ratio": ratio(
                sum(
                    1 for s in sentences if DESU_MASU.search(s.strip().rstrip("。！？"))
                ),
                n_sent,
            ),
            "stiff_per_1k": per_1k(len(STIFF.findall(body))),
            "headings": types.count("h"),
            "list_items": types.count("li"),
            "list_ratio": ratio(list_chars, chars),
            "bold_per_1k": per_1k(bold),
            "code_blocks": types.count("code"),
            "tables": types.count("table"),
        },
        "stiff": [m.group(0) for m in STIFF.finditer(body)],
        "conjunctions": conjunctions,
        "blocks": out_blocks,
    }


def main() -> None:
    exp = json.loads((ROOT / "experiment.json").read_text())
    prompts = [
        json.loads(l)
        for l in (ROOT / "runs/prompts.jsonl").read_text().splitlines()
        if l
    ]
    texts = []
    missing = 0
    for p in prompts:
        path = ROOT / p["output"]
        if not path.exists():
            missing += 1
            continue
        text = path.read_text()
        texts.append(
            {
                "model": p["model"],
                "concept": p["concept"],
                "condition": p["condition"],
                "n": p["n"],
                "prompt": p["prompt"],
                "text": text.strip(),
                **analyze(text),
            }
        )
    out = ROOT / "site/data.js"
    out.parent.mkdir(exist_ok=True)
    exp.pop("save_instruction", None)
    data = json.dumps({"experiment": exp, "texts": texts}, ensure_ascii=False)
    out.write_text(f"window.DATA = {data};\n")
    note = f" ({missing} missing)" if missing else ""
    print(f"{len(texts)} texts -> {out.relative_to(ROOT)}{note}")


if __name__ == "__main__":
    main()
