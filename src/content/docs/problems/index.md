---
title: 問題ページの書き方
sidebar:
  order: 0
---

問題ページは `src/content/docs/problems/<問題ID>.md`（例: `ABC412-G.md`）に置きます.

## 章立て

問題ページは、**問題 → 条件の言いかえ → 解ける形への帰着 → 実装しやすい形への変形** の順に書きます.
[ABC412 G - Degree Harmony](./abc412-g/) が見本です.

| 章 | 書くこと |
| --- | --- |
| `## 問題` | 問題文の要約を数式で書く. 制約も書く. 章番号は付けない |
| `## 1. 条件の言いかえ` | 問題の条件を、扱いやすい同値な形に直す |
| `## 2. <解ける形への帰着>` | 既存のアルゴリズム・ライブラリで解ける問題に直す. 使う記事へリンクし、定理・節番号まで示す |
| `## 3. <実装しやすい形への変形>` | 計算量を落とす工夫、データの持ち方、最終的な計算量 |

- 章の見出しは内容に合わせて具体的に付ける（例: 「最小重み完全マッチングへの変換」「行列式の計算」）.
- 各段階を複数の章に分けたり、不要な段階を省いたりしてよい. 章番号は通し番号にする.
- 言いかえた結果の問題を明示したいときは、章の最後に引用（`>`）で書く.
- 自明でない主張は `:::note[主張 k.l]` で書き、直前に `<a id="claim-k-l"></a>` を置いて参照できるようにする. 証明は `<details>` で折りたたむ.
- アルゴリズム自体の解説は解説記事に書き、問題ページではリンクで参照するだけにする.
- 提出コードは `submission` のリンクで示す. 本文にコードを載せたいときだけ、末尾に `## 提出コード` を置く.

## テンプレート

````md title="src/content/docs/problems/ABC300-E.md"
---
title: ABC300 E - Dice Product 3
problem: https://atcoder.jp/contests/abc300/tasks/abc300_e
submission: https://atcoder.jp/contests/abc300/submissions/XXXXXXXX
uses: [math/pow]          # 使ったライブラリのページ（src/content/docs からのパス、拡張子なし）
tags: [counting, modular] # 問題固有のタグ（src/data/tags.ts のキー）
---
[問題](https://atcoder.jp/contests/abc300/tasks/abc300_e) / [提出コード](https://atcoder.jp/contests/abc300/submissions/XXXXXXXX)

## 問題

（問題文の要約と制約）

## 1. 条件の言いかえ

...

## 2. 〇〇への帰着

...

## 3. 〇〇の計算

...
````

- 冒頭のリンク行は frontmatter の `problem` / `submission` と同じ URL にする. 提出がなければ `[問題](...)` だけにする.
- frontmatter のキーは `submission`（`submition` などと書くと無視される）.

## 自動で行われること

- `uses` に書いたページに付いているタグは、この問題にも自動で付きます.
- `uses` に書いたページの末尾に「このページを使った問題」としてこの問題が表示されます.
- `uses` に存在しないページを書いたり、`tags` に一覧にないタグを書いたりするとビルドエラーになります.
