---
title: "双対セグメント木"
tags: [range-update, monoid]
sidebar:
  order: 2
---
## 1. 概要

列 $a_0, \dots, a_{N-1}$ に対して、**区間への作用**と**一点取得**を行うデータ構造.
セグメント木（一点更新・区間取得）とちょうど逆の役割をもつので「双対」と呼ばれる.

| 操作 | 計算量 |
| --- | --- |
| 区間作用（`apply(l, r, f)`） | $O(\log N)$ |
| 一点作用（`apply(p, f)`） | $O(\log N)$ |
| 一点更新（`set`） | $O(\log N)$ |
| 一点取得（`get`） | $O(\log N)$ |

遅延セグメント木と違って区間の集約値を持たないので、要素の型 $S$ と作用 $\mathrm{mapping}$ を用意しなくてよく、**作用素のモノイド $(F, \circ, \mathrm{id})$ だけ**で書ける.

## 2. 前提知識

- [セグメント木](../../data-structure/segment-tree/)（完全二分木の各ノードが区間を表すこと、区間 $[l, r)$ が $O(\log N)$ 個のノードに分割されること）
- **モノイド**: 集合 $F$ と二項演算 $\circ$ の組で、結合法則 $(f \circ g) \circ h = f \circ (g \circ h)$ と単位元 $\mathrm{id}$（$f \circ \mathrm{id} = \mathrm{id} \circ f = f$）をもつもの.
  双対セグメント木では $F$ を「写像の集合」、$\circ$ を写像の合成と考えると分かりやすい.

## 3. 双対セグメント木

### 3.1. 持ち方

要素 $a_i$ も作用 $f$ も同じモノイド $F$ の元として扱い、区間作用は

$$
a_i \leftarrow f \circ a_i \quad (l \le i < r)
$$

とする. 例えば chmax なら $F = \mathbb{Z} \cup \lbrace -\infty \rbrace$、$f \circ g = \max(f, g)$、$\mathrm{id} = -\infty$ であり、$a_i$ は「今までに $i$ にかかった chmax の値の最大値」になる.
要素と作用を区別したいとき（$a_i$ の初期値が別にあるとき）は、取得した作用を初期値に自分で適用すればよい.

完全二分木のノード $k$ に、**ノード $k$ が表す区間全体にかかっていて、まだ子に下ろしていない作用** $\mathrm{lz}_k$ を持たせる.
葉 $p$ の $\mathrm{lz}$ は $a_p$ そのものである. このとき

$$
a_p = \mathrm{lz}_{k_1} \circ \mathrm{lz}_{k_2} \circ \cdots \circ \mathrm{lz}_{k_m}
$$

が成り立つ. ここで $k_1, k_2, \dots, k_m$ は根から葉 $p$ までのパス上のノードである（根に近いノードほど新しい作用なので左に来る）.

### 3.2. 区間作用

セグメント木の区間取得と同様に、$[l, r)$ をちょうど覆う $O(\log N)$ 個のノード $k$ について $\mathrm{lz}_k \leftarrow f \circ \mathrm{lz}_k$ とする.

ただし、それだけでは作用の順序が壊れることがある.
覆うノード $k$ の祖先 $u$ に古い作用 $g$ が残っていると、$k$ の下の葉では $g \circ (f \circ \cdots)$ の順になり、新しい $f$ が古い $g$ より先にかかったことになってしまう.
そこで、作用を書き込む前に、$l$ と $r - 1$ の祖先のうち境界をまたぐノードの作用を根から順に子へ下ろしておく（`push`）.
覆うノードの祖先はすべて $l$ か $r - 1$ の祖先なので、これで覆うノードより上には作用が残らない.

作用が**可換**（$f \circ g = g \circ f$）なら順序を気にする必要がないので、`push` を省いてもよい.

### 3.3. 一点取得・一点更新

葉 $p$ の祖先を根から順に `push` すると、葉より上の作用がすべて $\mathrm{lz}_p$ に集まり、$\mathrm{lz}_p = a_p$ となる.
あとは $\mathrm{lz}_p$ を読む（`get`）か書き換える（`set`）だけである.

作用が可換なら、`push` せずに葉から根までの $\mathrm{lz}$ を合成して返してもよい.

## 4. 参考資料

- [Lazy Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/lazysegtree.html)（テンプレート引数 `composition`, `id` と `apply` のインターフェース、`push` の仕方）
- [Dual Segment Tree (双対セグメント木) - Luzhiled's Library](https://ei1333.github.io/library/structure/segment-tree/dual-segment-tree.hpp.html)（作用素のモノイドだけで書く双対セグメント木の実装）

## 5. コード

- `dual_segtree<F, composition, id>`: モノイド $(F, \circ)$ の列を管理する. `composition(f, g)` は $f \circ g$（$g$ を先に、$f$ を後に作用させたもの）、`id()` は単位元を返す.
- `dual_segtree(n)`: 長さ $n$ で全要素 `id()` に初期化する. $O(n)$.
- `dual_segtree(v)`: 列 `v` で初期化する. $O(n)$.
- `apply(l, r, f)`: $l \le i < r$ について $a_i \leftarrow f \circ a_i$. $O(\log n)$.
- `apply(p, f)`: $a_p \leftarrow f \circ a_p$. $O(\log n)$.
- `set(p, x)`: $a_p \leftarrow x$. $O(\log n)$.
- `get(p)`: $a_p$ を返す. $O(\log n)$.

```cpp title="dual_segtree.cpp"
#include <bits/stdc++.h>
using namespace std;

template <class F, F (*composition)(F, F), F (*id)()>
struct dual_segtree {
  // 長さ n で全要素 id() に初期化する. O(n)
  dual_segtree(int n = 0) : dual_segtree(vector<F>(n, id())) {}

  // 列 v で初期化する. O(n)
  dual_segtree(const vector<F>& v) : _n(v.size()) {
    log = 0;
    while ((1 << log) < _n) log++;
    size = 1 << log;
    lz.assign(2 * size, id());
    for (int i = 0; i < _n; i++) lz[size + i] = v[i];
  }

  // a[p] <- x. O(log n)
  void set(int p, F x) {
    assert(0 <= p && p < _n);
    p += size;
    for (int i = log; i >= 1; i--) push(p >> i);
    lz[p] = x;
  }

  // a[p] を返す. O(log n)
  F get(int p) {
    assert(0 <= p && p < _n);
    p += size;
    for (int i = log; i >= 1; i--) push(p >> i);
    return lz[p];
  }

  // a[p] <- composition(f, a[p]). O(log n)
  void apply(int p, F f) {
    assert(0 <= p && p < _n);
    p += size;
    for (int i = log; i >= 1; i--) push(p >> i);
    lz[p] = composition(f, lz[p]);
  }

  // i = l, ..., r - 1 について a[i] <- composition(f, a[i]). O(log n)
  void apply(int l, int r, F f) {
    assert(0 <= l && l <= r && r <= _n);
    if (l == r) return;
    l += size;
    r += size;

    // 境界をまたぐノードの作用を先に子へ下ろしておく（作用の順序を保つため）
    for (int i = log; i >= 1; i--) {
      if (((l >> i) << i) != l) push(l >> i);
      if (((r >> i) << i) != r) push((r - 1) >> i);
    }

    while (l < r) {
      if (l & 1) all_apply(l++, f);
      if (r & 1) all_apply(--r, f);
      l >>= 1;
      r >>= 1;
    }
  }

 private:
  int _n, size, log;
  vector<F> lz;  // lz[k]: ノード k の区間全体にかかっていて、まだ子に下ろしていない作用（葉では要素そのもの）

  void all_apply(int k, F f) {
    lz[k] = composition(f, lz[k]);
  }

  // ノード k の作用を子へ下ろす
  void push(int k) {
    all_apply(2 * k, lz[k]);
    all_apply(2 * k + 1, lz[k]);
    lz[k] = id();
  }
};
```

使用例（区間 chmax・一点取得）:

```cpp
long long composition(long long f, long long g) { return max(f, g); }
long long id() { return LLONG_MIN; }

dual_segtree<long long, composition, id> seg(n);
seg.apply(l, r, x);              // i in [l, r) について a[i] <- max(a[i], x)
long long v = max(a0[p], seg.get(p));  // 初期値 a0[p] と合わせて取得
```

使用例（区間アフィン変換 $a_i \leftarrow b a_i + c$、作用は非可換）:

```cpp
using F = pair<long long, long long>;  // x -> first * x + second
F composition(F f, F g) { return {f.first * g.first % MOD, (f.first * g.second + f.second) % MOD}; }
F id() { return {1, 0}; }

dual_segtree<F, composition, id> seg(n);
seg.apply(l, r, {b, c});
auto [s, t] = seg.get(p);
long long v = (s * a0[p] + t) % MOD;  // 初期値 a0[p] に作用させる
```
