---
title: "2D Segtree"
tags: [range-query, point-update, 2d, monoid]
sidebar:
  order: 5
---
## 性質

`H×W` の2次元配列`A` に対して、次を扱う

- 一点更新：`A[h][w] = x`
- 長方形クエリ：`[h1,h2) × [w1,w2)` の総積

をどちらも$O(\log H \cdot \log W)$で求めることができる

## 概念

1. 行方向にセグメント木を作る
2. 外側（ある行区間）に対して、その行区間の情報を持たせた列方向のセグメント木を作る
3. 長方形`[h1,h2) × [w1,w2)` を聞かれたら
    - 外側の木で`[h1,h2)` を分解
    - 各ノードにぶら下がる内側の木で`[w1,w2)` を求める
    - それらを合成

## method解説

## 1. id

2次元`seg2[2*H][2*W]` という配列を1次元`seg[4*H*W]` に圧縮

- `id(h,w) = h*(2W) + w` の意味
    - `2W` は 「1行あたりの要素数」
    - `h` 行目の先頭に飛ぶには `h * (2W)` 個スキップ
    - そこから `w` 列目に行くにはさらに `+ w`

## 2. build

1. 縦方向を構築（1列のみの区間の列に対するセグメント木を構築）
2. 横方向を構築（1列に関するセグメント木が完成しているので、列をまとめる）

## 3. update

更新を行った後にbuildと同じような感じで再計算する

## 実装

```cpp title="2d_segment_tree.cpp"
#include <bits/stdc++.h>

using namespace std;

// Reference (original implementation):
//   Nyaan's Library: "二次元セグメント木" (data-structure-2d/2d-segment-tree.hpp)
//   https://nyaannyaan.github.io/library/data-structure-2d/2d-segment-tree.hpp.html
//   https://github.com/NyaanNyaan/library (CC0-1.0)
// Accessed: 2026-02-28
//
// Notes:
//   - Adapted to ACL-style monoid interface (S, op, e).

template <class S, S (*op)(S, S), S (*e)()>
struct SegmentTree2D {
 private:
  int id(int h, int w) const { return h * 2 * W + w; }

 public:
  int H, W;
  vector<S> seg;

  SegmentTree2D(int h, int w) { init(h, w); }

  void init(int h, int w) {
    H = W = 1;
    while (H < h) H <<= 1;
    while (W < w) W <<= 1;
    seg.assign(4 * H * W, e());
  }

  // build にのみ呼ぶ
  void set(int h, int w, const S x) { seg[id(h + H, w + W)] = x; }

  void build() {
    // w in [W, 2W)
    for (int w = W; w < 2 * W; w++) {
      for (int h = H - 1; h; h--) {
        seg[id(h, w)] = op(seg[id(2 * h + 0, w)], seg[id(2 * h + 1, w)]);
      }
    }
    // h in [0, 2H)
    for (int h = 0; h < 2 * H; h++) {
      for (int w = W - 1; w; w--) {
        seg[id(h, w)] = op(seg[id(h, 2 * w + 0)], seg[id(h, 2 * w + 1)]);
      }
    }
  }

  S get(int h, int w) const { return seg[id(h + H, w + W)]; }
  S operator()(int h, int w) const { return seg[id(h + H, w + W)]; }

  void update(int h, int w, const S x) {
    h += H, w += W;
    seg[id(h, w)] = x;
    for (int i = h >> 1; i; i >>= 1) {
      seg[id(i, w)] = op(seg[id(2 * i + 0, w)], seg[id(2 * i + 1, w)]);
    }
    for (; h; h >>= 1) {
      for (int j = w >> 1; j; j >>= 1) {
        seg[id(h, j)] = op(seg[id(h, 2 * j + 0)], seg[id(h, 2 * j + 1)]);
      }
    }
  }

  S _inner_query(int h, int w1, int w2) {
    S res = e();
    for (; w1 < w2; w1 >>= 1, w2 >>= 1) {
      if (w1 & 1) res = op(res, seg[id(h, w1)]), w1++;
      if (w2 & 1) --w2, res = op(res, seg[id(h, w2)]);
    }
    return res;
  }

  // [[h1,h2), [w1,w2)) 半開
  S query(int h1, int h2, int w1, int w2) {
    if (h1 >= h2 || w1 >= w2) return e();
    S res = e();
    h1 += H, h2 += H, w1 += W, w2 += W;
    for (; h1 < h2; h1 >>= 1, h2 >>= 1) {
      if (h1 & 1) res = op(res, _inner_query(h1, w1, w2)), h1++;
      if (h2 & 1) --h2, res = op(res, _inner_query(h2, w1, w2));
    }
    return res;
  }
};
```
