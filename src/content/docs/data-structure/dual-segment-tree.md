---
title: "双対セグメント木"
tags: [range-update, monoid]
status: verified
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

遅延セグメント木と違って区間の集約値を持たないので、要素の二項演算 $\mathrm{op}$ と単位元 $e$ は要らない.
要素の集合 $S$、作用素のモノイド $(F, \circ, \mathrm{id})$、作用 $\mathrm{mapping}$ だけで書ける.

## 2. 前提知識

- [セグメント木](../../data-structure/segment-tree/)

## 3. 双対セグメント木

### 3.1. 要素と作用

要素の集合 $S$ と作用素のモノイド $(F, \circ, \mathrm{id})$ を用意し、$f \in F$ を $x \in S$ に作用させた結果を $\mathrm{mapping}(f, x) \in S$ と書く.
$\mathrm{mapping}$ には次の 2 つを課す.

- $\mathrm{mapping}(f \circ g, x) = \mathrm{mapping}(f, \mathrm{mapping}(g, x))$
- $\mathrm{mapping}(\mathrm{id}, x) = x$

区間作用は $l \le i < r$ について $a_i \leftarrow \mathrm{mapping}(f, a_i)$ とする操作である.

### 3.2. データの持ち方

完全二分木の各ノードに次を持たせる.

- 葉 $p$: 要素 $d_p \in S$
- 内部ノード $k$: 作用 $\mathrm{lz}_k \in F$. **ノード $k$ が表す区間全体にかかっていて、まだ子に下ろしていない作用**である.

根から葉 $p$ の親までのパス上の内部ノードを $k_1, k_2, \dots, k_m$ とすると、

$$
a_p = \mathrm{mapping}(\mathrm{lz}_{k_1} \circ \mathrm{lz}_{k_2} \circ \cdots \circ \mathrm{lz}_{k_m},\ d_p)
$$

が成り立つ（根に近いノードほど新しい作用なので左に来る）.

### 3.3. 区間作用

セグメント木の区間取得と同様に、$[l, r)$ をちょうど覆う $O(\log N)$ 個のノード $k$ について $\mathrm{all\_apply}(k, f)$ を行う.

覆うノード $k$ の祖先 $u$ に古い作用 $g$ が残っていると、$k$ の下の葉では $g \circ (f \circ \cdots)$ の順になり、新しい $f$ が古い $g$ より先にかかったことになってしまう.
作用の順序を保つため、作用を書き込む前に、$l$ と $r - 1$ の祖先のうち境界をまたぐノードについて、根に近いものから順に $\mathrm{push}$ しておく.

### 3.4. 一点取得・一点更新

葉 $p$ の祖先を根に近いものから順に $\mathrm{push}$ すると、祖先の $\mathrm{lz}$ はすべて $\mathrm{id}$ になり、$d_p = a_p$ となる.
あとは $d_p$ を読む（`get`）か書き換える（`set`）だけである.
祖先に作用が残っていないので、$d_p$ を書き換えた後の値に古い作用がかかることはない.

## 4. 参考資料

- [Lazy Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/lazysegtree.html)（テンプレート引数 `mapping`, `composition`, `id` と作用の条件、`push` の仕方）
- [Dual Segment Tree (双対セグメント木) - Luzhiled's Library](https://ei1333.github.io/library/structure/segment-tree/dual-segment-tree.hpp.html)（双対セグメント木の実装）

## 5. コード

- `dual_segtree<S, F, mapping, composition, id>`: $S$ の列を管理する.
  - `mapping(f, x)` は $f$ を $x$ に作用させた結果を返す.
  - `composition(f, g)` は $f \circ g$（$g$ を先に、$f$ を後に作用させたもの）を返す.
  - `id()` は $F$ の単位元を返す.
- `dual_segtree(n, x)`: 長さ $n$ で全要素 $x$ に初期化する. $O(n)$.
- `dual_segtree(v)`: 列 `v` で初期化する. $O(n)$.
- `apply(l, r, f)`: $l \le i < r$ について $a_i \leftarrow \mathrm{mapping}(f, a_i)$. $O(\log n)$.
- `apply(p, f)`: $a_p \leftarrow \mathrm{mapping}(f, a_p)$. $O(\log n)$.
- `set(p, x)`: $a_p \leftarrow x$. $O(\log n)$.
- `get(p)`: $a_p$ を返す. $O(\log n)$.

```cpp title="dual_segtree.cpp"
template <class S, class F, S (*mapping)(F, S), F (*composition)(F, F), F (*id)()>
struct dual_segtree {
  // 長さ n で全要素 x に初期化する. O(n)
  dual_segtree(int n, S x) : dual_segtree(vector<S>(n, x)) {}

  // 列 v で初期化する. O(n)
  dual_segtree(const vector<S>& v) : _n(v.size()), d(v) {
    log = 0;
    while ((1 << log) < _n) log++;
    size = 1 << log;
    lz.assign(size, id());
  }

  // a[p] <- x. O(log n)
  void set(int p, S x) {
    assert(0 <= p && p < _n);
    push_path(p + size);
    d[p] = x;
  }

  // a[p] を返す. O(log n)
  S get(int p) {
    assert(0 <= p && p < _n);
    push_path(p + size);
    return d[p];
  }

  // a[p] <- mapping(f, a[p]). O(log n)
  void apply(int p, F f) {
    assert(0 <= p && p < _n);
    push_path(p + size);
    d[p] = mapping(f, d[p]);
  }

  // i = l, ..., r - 1 について a[i] <- mapping(f, a[i]). O(log n)
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
  vector<S> d;   // d[p]: 葉 p の要素
  vector<F> lz;  // lz[k] (1 <= k < size): 内部ノード k の区間全体にかかっていて、まだ子に下ろしていない作用

  // ノード k に作用 f をかける（内部ノードなら合成、葉なら要素に作用）
  void all_apply(int k, F f) {
    if (k < size) {
      lz[k] = composition(f, lz[k]);
    } else if (k - size < _n) {
      d[k - size] = mapping(f, d[k - size]);
    }
  }

  // 内部ノード k の作用を子へ下ろす
  void push(int k) {
    all_apply(2 * k, lz[k]);
    all_apply(2 * k + 1, lz[k]);
    lz[k] = id();
  }

  // 葉 k の祖先を根から順に push する
  void push_path(int k) {
    for (int i = log; i >= 1; i--) push(k >> i);
  }
};
```