// 単語分割。ビルド時 (Node) と検索時 (ブラウザ) でこのファイルを共有する。
//
// 単語表は「語 → ベクトル」の表なので、ビルド時と検索時で 1 文字でも区切り方が違うと、その語のベクトルが使われない。
// Python に Intl.Segmenter と同じ分割はないため、ビルド時の分割も Node でこのファイルを使う (scripts/tokenize_cli.mjs)。
//
// 1. NFKC で正規化して小文字にする (全角英数字を半角に)
// 2. 英数字の語を正規表現で取り出す。ハイフンとアンダースコアでつながった語は 1 語 (scroll-snap, dropna_false)
//    Intl.Segmenter に任せると、package.json のような語を 1 語にするかが ICU の版で変わるため
// 3. 残りの部分を Intl.Segmenter で分け、単語らしい部分 (isWordLike) だけを拾う
// 4. 助詞などのストップワードを除く

const STOPWORDS = new Set([
  ..."the a an and or of to in for with on by is are be as it this that from at".split(" "),
  ..."の を は が に で と も へ や か な だ です ます する した して し こと もの よう ため から まで って いる ある れる られる という これ それ た て".split(" "),
]);

const SEGMENTER = new Intl.Segmenter("ja", { granularity: "word" });
const ASCII_WORD = /[a-z0-9]+(?:[-_][a-z0-9]+)*/g;

export function tokenize(text) {
  const normalized = text.normalize("NFKC").toLowerCase();
  const words = [];
  const rest = normalized.replace(ASCII_WORD, (w) => {
    words.push(w);
    return " ";
  });
  for (const { segment, isWordLike } of SEGMENTER.segment(rest)) {
    if (isWordLike) words.push(segment);
  }
  return words.filter((w) => !STOPWORDS.has(w));
}
