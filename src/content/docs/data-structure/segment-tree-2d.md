---
title: "2D Segtree"
tags: [range-query, point-update, 2d, monoid]
sidebar:
  order: 5
---
## 1. 概要

$H \times W$ の 2 次元配列 $a$ に対して、**一点更新**と**長方形 $[i_1, i_2) \times [j_1, j_2)$ の総積**を行うデータ構造.
演算は**可換モノイド**（交換法則を満たすモノイド）であること.

| 操作 | 計算量 |
| --- | --- |
| 構築 | $O(HW)$ |
| 一点更新（`set`） | $O(\log H \log W)$ |
| 一点取得（`get`） | $O(1)$ |
| 長方形の積（`prod`） | $O(\log H \log W)$ |
| 全体の積（`all_prod`） | $O(1)$ |
| メモリ | $O(HW)$（要素数の約 4 倍） |

メモリが $HW$ に比例するので、$H, W$ がともに数千程度までのときに使う.
座標が大きく点の数が少ないときは、点の座標でオフラインに圧縮する方法（領域木、[Wavelet Matrix](../../data-structure/wavelet-matrix/) など）を使う.

## 2. 前提知識

- [セグメント木](../../data-structure/segment-tree/)（ノードが区間を表すこと、区間が $O(\log N)$ 個のノードに分解されること、非再帰の実装で葉 $i$ がノード $\mathrm{size} + i$ になること）
- **可換モノイド**: モノイドで、さらに交換法則 $x \cdot y = y \cdot x$ を満たすもの. 例: 加算、$\min$、$\max$、XOR.

## 3. 2D Segtree

### 3.1. 持ち方

$H, W$ 以上の最小の 2 冪を $H', W'$ とする.
行方向のセグメント木のノード $i$ $(1 \le i < 2H')$ が行の区間 $I_i$ を、列方向のセグメント木のノード $j$ $(1 \le j < 2W')$ が列の区間 $J_j$ を表すとき、すべての組 $(i, j)$ について

$$
d_{i, j} = \prod_{(x, y) \in I_i \times J_j} a_{x, y}
$$

を持つ. 「外側のセグメント木（行）の各ノードに、その行区間を潰した列方向のセグメント木がぶら下がっている」と考えればよい.

2 次元配列 $d$ は $2H' \times 2W'$ なので、$\mathrm{id}(i, j) = i \cdot 2W' + j$ として長さ $4H'W'$ の 1 次元配列に詰める（$2W'$ が 1 行あたりの要素数）.

### 3.2. 構築

葉は $d_{H' + x, W' + y} = a_{x, y}$ である. 次の 2 段階で残りを埋める.

1. **縦方向**: 列の葉 $j \in [W', 2W')$ ごとに、行の内部ノード $i$ を下から $d_{i, j} = d_{2i, j} \cdot d_{2i+1, j}$ で計算する.
2. **横方向**: すべての行ノード $i \in [1, 2H')$ について、列の内部ノード $j$ を下から $d_{i, j} = d_{i, 2j} \cdot d_{i, 2j+1}$ で計算する.

1 で $d_{i, j}$（$j$ は葉）が「行区間 $I_i$ の列 $j$ の積」になり、2 でそれを列方向にまとめるので、すべての $d_{i, j}$ が定義どおりになる. 全体で $O(H'W') = O(HW)$ である.

### 3.3. 一点更新

$a_{x, y}$ を変えたとき値が変わるのは、行ノード $i$ が葉 $H' + x$ の祖先（自身を含む）で、かつ列ノード $j$ が葉 $W' + y$ の祖先であるような $d_{i, j}$ だけで、$O(\log H \log W)$ 個ある. 構築と同じ順に

1. 列の葉 $W' + y$ について、行の祖先 $i$ を下から計算し直す.
2. 行の葉 $H' + x$ とその祖先 $i$ それぞれについて、列の祖先 $j$ を下から計算し直す.

とすればよい.

### 3.4. 長方形の積

行の区間 $[i_1, i_2)$ を、セグメント木と同じように $O(\log H)$ 個の行ノードに分解する.
分解した行ノード $i$ それぞれについて、列の区間 $[j_1, j_2)$ を $O(\log W)$ 個の列ノードに分解し、$d_{i, j}$ を掛ける.
長方形は $O(\log H \log W)$ 個の互いに交わらない $I_i \times J_j$ に分けられるので、その積が答えである.

:::caution[可換性が必要]
長方形の要素を掛ける順番は、構築（列ごとに縦に掛けてから横に掛ける）と取得（行ノードごとに横に掛けてから縦に掛ける）で異なる. そのため、この実装は**交換法則を満たす演算でしか正しくない**.
例えば文字列の連結で `{{"a", "b", "c"}}` の `prod(0, 1, 0, 3)` を計算すると、右端側から取ったノード `"c"` を左側のノード `"ab"` より先に掛けてしまうので `"cab"` になる.
行方向も同じなので、1 行・1 列に限っても非可換な演算には使えない.
:::

## 4. 参考資料

- [二次元セグメント木 - Nyaan's Library](https://nyaannyaan.github.io/library/data-structure-2d/2d-segment-tree.hpp.html)（コードの元にした実装. `id(h, w)` による 1 次元配列への詰め方、構築・更新・取得の方法. CC0-1.0）
- [Segment Tree - cp-algorithms](https://cp-algorithms.com/data_structures/segment_tree.html)（"Generalization to higher dimensions" の節: 2 次元セグメント木の考え方と計算量、座標圧縮版）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（テンプレート引数 `S`, `op`, `e` のインターフェース）

## 5. コード

- `segtree_2d<S, op, e>`: 可換モノイド $(S, \mathrm{op}, e)$ の 2 次元配列を管理する.
- `segtree_2d(h, w)`: $h \times w$ で全要素 `e()` に初期化する. $O(hw)$.
- `segtree_2d(v)`: 2 次元配列 `v`（各行の長さは等しい）で初期化する. $O(hw)$.
- `set(i, j, x)`: $a_{i, j} \leftarrow x$. $O(\log h \log w)$.
- `get(i, j)`: $a_{i, j}$ を返す. $O(1)$.
- `prod(i1, i2, j1, j2)`: $[i_1, i_2) \times [j_1, j_2)$ の全要素の積を返す. 空なら `e()`. $O(\log h \log w)$.
- `all_prod()`: 全要素の積を返す. $O(1)$.

```cpp title="segtree_2d.cpp"
template <class S, S (*op)(S, S), S (*e)()>
struct segtree_2d {
  // h × w で全要素 e() に初期化する. O(hw)
  segtree_2d(int h = 0, int w = 0) : segtree_2d(vector<vector<S>>(h, vector<S>(w, e()))) {}

  // 2 次元配列 v で初期化する. O(hw)
  segtree_2d(const vector<vector<S>>& v) : _h(v.size()), _w(v.empty() ? 0 : v[0].size()) {
    H = W = 1;
    while (H < _h) H <<= 1;
    while (W < _w) W <<= 1;
    d.assign(4 * H * W, e());
    for (int i = 0; i < _h; i++)
      for (int j = 0; j < _w; j++) d[id(H + i, W + j)] = v[i][j];
    // 縦方向: 列 j (葉) ごとに行のセグメント木を作る
    for (int j = W; j < 2 * W; j++)
      for (int i = H - 1; i >= 1; i--) d[id(i, j)] = op(d[id(2 * i, j)], d[id(2 * i + 1, j)]);
    // 横方向: 行ノード i ごとに列のセグメント木を作る
    for (int i = 1; i < 2 * H; i++)
      for (int j = W - 1; j >= 1; j--) d[id(i, j)] = op(d[id(i, 2 * j)], d[id(i, 2 * j + 1)]);
  }

  // a[i][j] <- x. O(log h log w)
  void set(int i, int j, S x) {
    assert(0 <= i && i < _h && 0 <= j && j < _w);
    i += H, j += W;
    d[id(i, j)] = x;
    for (int k = i >> 1; k >= 1; k >>= 1) d[id(k, j)] = op(d[id(2 * k, j)], d[id(2 * k + 1, j)]);
    for (; i >= 1; i >>= 1)
      for (int k = j >> 1; k >= 1; k >>= 1) d[id(i, k)] = op(d[id(i, 2 * k)], d[id(i, 2 * k + 1)]);
  }

  // a[i][j] を返す. O(1)
  S get(int i, int j) const {
    assert(0 <= i && i < _h && 0 <= j && j < _w);
    return d[id(i + H, j + W)];
  }

  // [i1, i2) × [j1, j2) の全要素の積を返す. 空なら e(). O(log h log w)
  S prod(int i1, int i2, int j1, int j2) const {
    assert(0 <= i1 && i1 <= i2 && i2 <= _h);
    assert(0 <= j1 && j1 <= j2 && j2 <= _w);
    S res = e();
    i1 += H, i2 += H;
    for (; i1 < i2; i1 >>= 1, i2 >>= 1) {
      if (i1 & 1) res = op(res, inner_prod(i1++, j1, j2));
      if (i2 & 1) res = op(res, inner_prod(--i2, j1, j2));
    }
    return res;
  }

  // 全要素の積を返す. O(1)
  S all_prod() const { return d[id(1, 1)]; }

 private:
  int _h, _w, H, W;  // H, W は h, w 以上の最小の 2 冪
  vector<S> d;       // d[id(i, j)]: 行ノード i の区間 × 列ノード j の区間の積

  int id(int i, int j) const { return i * 2 * W + j; }

  // 行ノード i について、列 [j1, j2) の積を返す
  S inner_prod(int i, int j1, int j2) const {
    S res = e();
    j1 += W, j2 += W;
    for (; j1 < j2; j1 >>= 1, j2 >>= 1) {
      if (j1 & 1) res = op(res, d[id(i, j1++)]);
      if (j2 & 1) res = op(res, d[id(i, --j2)]);
    }
    return res;
  }
};
```

使用例（長方形の和）:

```cpp
long long op(long long a, long long b) { return a + b; }
long long e() { return 0; }

segtree_2d<long long, op, e> seg(a);  // a: vector<vector<long long>>
seg.set(i, j, seg.get(i, j) + x);      // a[i][j] += x
long long s = seg.prod(i1, i2, j1, j2);  // [i1, i2) × [j1, j2) の和
```
