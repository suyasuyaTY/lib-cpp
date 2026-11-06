---
title: 問題ページの書き方
sidebar:
  order: 0
---

問題ページは `src/content/docs/problems/<コンテスト種別>/<問題ID>.md` に置きます。

````md title="src/content/docs/problems/abc/abc300_e.md"
---
title: ABC300 E - Dice Product 3
problem: https://atcoder.jp/contests/abc300/tasks/abc300_e
submission: https://atcoder.jp/contests/abc300/submissions/XXXXXXXX
uses: [math/pow]          # 使ったライブラリのページ（src/content/docs からのパス、拡張子なし）
tags: [counting, modular] # 問題固有のタグ（src/data/tags.ts のキー）
---

## 考察

...

## 提出コード

```cpp
// AtCoder に提出したコード
```
````

## 自動で行われること

- `uses` に書いたページに付いているタグは、この問題にも自動で付きます。
- `uses` に書いたページの末尾に「このページを使った問題」としてこの問題が表示されます。
- `uses` に存在しないページを書いたり、`tags` に一覧にないタグを書いたりするとビルドエラーになります。
