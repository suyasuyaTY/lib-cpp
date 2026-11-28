---
title: "永続セグメント木"
tags: [range-query, persistent]
sidebar:
  order: 4
---
## 1. 概要

更新のたびに古い状態を捨てずに残し、**過去のすべてのバージョン**に対して取得や更新ができるセグメント木.
過去のバージョンを更新すると、そこから分岐した新しいバージョンができる（完全永続）.
各バージョンは根のノード番号で表し、更新は「新しいバージョンの根」を返す.

列の長さを $N$、更新回数を $Q$ とする.

| 操作 | 計算量 |
| --- | --- |
| 構築（`build`） | 時間・メモリ $O(N)$ |
| 一点更新（`set`、新しいバージョンを作る） | 時間・メモリ $O(\log N)$ |
| 一点取得（`get`） | $O(\log N)$ |
| 区間積（`prod`） | $O(\log N)$ |
| 全体の積（`all_prod`） | $O(1)$ |
| 全体のメモリ | $O(N + Q \log N)$ |

すべてのバージョンを配列で保存すると、更新ごとに時間・メモリとも $O(N)$ かかる. 永続セグメント木では、変化した $O(\log N)$ 個のノードだけを作り直し、残りを古いバージョンと共有する.

典型的な使い方:

- **過去のバージョンへのクエリ**: 「$k$ 回目の更新直後の列の区間積」や「過去のバージョンを書き換えて分岐させる」をオンラインで処理する.
- **区間の値の分布**: 列 $A$ の値ごとの出現回数を、接頭辞 $A_0, \dots, A_{i-1}$ ごとにバージョン $S_i$ として持つ. $S_r - S_l$ が区間 $[l, r)$ の分布になるので、区間内で $x$ 未満の値の個数や区間内の $k$ 番目に小さい値が $O(\log N)$ で求まる.
- **木のパス上の分布**: 根から頂点 $v$ までのパスの分布を、親のバージョンに $v$ の値を足したバージョンとして持つ. パス $u$–$v$ の分布は $S_u + S_v - 2 S_{\mathrm{lca}} + (\mathrm{lca} \text{ の値})$ になる.

## 2. 前提知識

- [セグメント木](../../data-structure/segment-tree/)（ノードが区間を表すこと、区間が $O(\log N)$ 個のノードに分解されること、モノイド）

## 3. 永続セグメント木

### 3.1. データの持ち方

配列で $k$ の子を $2k, 2k + 1$ とする通常の実装ではなく、各ノードが**子のノード番号**を持つ形（再帰的なセグメント木）にする.
ノード $v$ は区間 $[l, r)$ を表し、次を持つ. $m = \lfloor (l + r) / 2 \rfloor$ とする.

- $\mathrm{val}_v$: 区間 $[l, r)$ の積
- $\mathrm{lch}_v$: 区間 $[l, m)$ を表す左の子のノード番号
- $\mathrm{rch}_v$: 区間 $[m, r)$ を表す右の子のノード番号

一度作ったノードは**二度と書き換えない**. するとバージョンは根のノードで決まり、根からたどれる部分木がそのバージョンのセグメント木そのものになる. 区間積・一点取得は、指定したバージョンの根から通常のセグメント木と同じように探索すればよい.

### 3.2. パスコピーによる更新

バージョン $t$ で $a_p \leftarrow x$ としたとき、値が変わるのは葉 $p$ から根までのパス上の $\lceil \log_2 N \rceil + 1$ 個のノードだけである.
そこで、このパス上のノードだけを**複製して新しく作る**.

- 葉 $p$ の複製は値 $x$ を持つ.
- パス上のノード $v$ の複製は、パス側の子には複製した新しい子を、パスでない側の子には $v$ の子（古いノード）をそのまま指し、値を $\mathrm{op}(\mathrm{val}_{\text{左}}, \mathrm{val}_{\text{右}})$ で計算し直す.
- 根の複製が新しいバージョンの根になる.

古いノードは書き換えていないので、バージョン $t$ はそのまま残る. 新しいバージョンの部分木は、パス上で新しいノード、それ以外で古いノードを共有している.
1 回の更新で作るノードは $O(\log N)$ 個なので、時間・メモリとも $O(\log N)$ である.

:::note[共有しても正しい理由]
ノード $v$ の値は $v$ の部分木の葉だけで決まる. パスに含まれないノードの部分木には $p$ が含まれないので、新旧どちらのバージョンでも同じ値を持つ. よって共有してよい.
:::

### 3.3. 区間の $k$ 番目に小さい値

値を座標圧縮して $0, \dots, V - 1$ とする. 長さ $V$ の全要素 $0$ のバージョン $S_0$ から始め、$S_{i+1}$ を「$S_i$ の位置 $A_i$ に $1$ を足したもの」とする.
$S_i$ の位置 $x$ の値は $A_0, \dots, A_{i-1}$ の中の $x$ の出現回数なので、区間 $[l, r)$ の中の $x$ の出現回数は $S_r$ と $S_l$ の位置 $x$ の値の差である.

$k$ 番目（0-indexed）に小さい値は、$S_r$ と $S_l$ の根から**同時に**降りて求める.
2 つの木は形が同じなので、同じ位置のノードは同じ区間を表す. 現在のノードの左の子について、区間 $[l, r)$ の中でその値域に入る個数 $c = \mathrm{val}_{\mathrm{lch}(S_r)} - \mathrm{val}_{\mathrm{lch}(S_l)}$ を求め、$k < c$ なら左へ、そうでなければ $k \leftarrow k - c$ として右へ進む.
深さ分しか進まないので $O(\log V)$ である（`prod` で二分探索すると $O(\log^2 V)$ になる）.

### 3.4. 発展

- **永続遅延セグメント木**: 遅延伝播で子へ作用を下ろすときも、子を書き換えずに複製してから作用させる. 既存のノードに直接伝播すると、それを共有している他のバージョンが壊れる. 1 回の操作で作るノードは $O(\log N)$ 個である.
- **区間のコピー**: あるバージョンの区間 $[l, r)$ を別のバージョンの同じ区間に移したバージョンは、区間を分解した $O(\log N)$ 個のノードのポインタを付け替えるだけで作れる. 通常のセグメント木にはない操作である.
- ノード数は $N + Q \lceil \log_2 N \rceil$ 程度まで増えるので、メモリに注意する. あらかじめ `reserve` しておくと速い.

## 4. 参考資料

- [永続セグメント木 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/persistent_segment_tree)（パスコピーによる永続化、根によるバージョンの管理、区間 $k$ 番目・木のパス上の $k$ 番目、永続遅延セグメント木と区間コピー）
- [Segment Tree - cp-algorithms](https://cp-algorithms.com/data_structures/segment_tree.html)（"Preserving the history of its values (Persistent Segment Tree)" の節: 更新ごとに新しい根を作る実装と区間 $k$ 番目）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（`set`, `get`, `prod`, `all_prod` のインターフェース）

## 5. コード

- `persistent_segtree<S, op, e>`: モノイド $(S, \mathrm{op}, e)$ の列の、複数のバージョンを管理する. バージョンは根のノード番号（`int`）で表す.
- `persistent_segtree(n)`: 長さ $n$ の列を扱う. まだバージョンはない.
- `build(v)`: 列 `v` のバージョンを作り、その根を返す. $O(n)$.
- `build()`: 全要素 `e()` のバージョンを作り、その根を返す. $O(n)$.
- `set(root, p, x)`: バージョン `root` で $a_p \leftarrow x$ としたバージョンを作り、その根を返す. `root` は変わらない. $O(\log n)$.
- `get(root, p)`: バージョン `root` の $a_p$ を返す. $O(\log n)$.
- `prod(root, l, r)`: バージョン `root` の $\mathrm{op}(a_l, \dots, a_{r-1})$ を返す. $l = r$ なら `e()`. $O(\log n)$.
- `all_prod(root)`: バージョン `root` の全要素の積を返す. $O(1)$.
- `value(v)`, `left(v)`, `right(v)`: ノード $v$ の値・左の子・右の子（葉なら $-1$）. ノード $v$ が $[l, r)$ を表すとき、子は $m = \lfloor (l + r) / 2 \rfloor$ で分けた $[l, m)$、$[m, r)$ を表す. 木の上の二分探索を自分で書くときに使う.

```cpp title="persistent_segtree.cpp"
template <class S, S (*op)(S, S), S (*e)()>
struct persistent_segtree {
  // 長さ n の木を扱う（まだバージョンはない）
  persistent_segtree(int n = 0) : _n(n) {}

  // 列 v を初期値とするバージョンを作り、その根を返す. O(n)
  int build(const vector<S>& v) {
    assert((int)v.size() == _n);
    if (_n == 0) return new_node(e(), -1, -1);
    return build(v, 0, _n);
  }

  // 全要素 e() のバージョンを作り、その根を返す. O(n)
  int build() { return build(vector<S>(_n, e())); }

  // バージョン root で a[p] <- x としたバージョンの根を返す（root は変わらない）. O(log n)
  int set(int root, int p, S x) {
    assert(0 <= p && p < _n);
    return set(root, 0, _n, p, x);
  }

  // バージョン root の a[p] を返す. O(log n)
  S get(int root, int p) const {
    assert(0 <= p && p < _n);
    int l = 0, r = _n, v = root;
    while (r - l > 1) {
      int m = (l + r) / 2;
      if (p < m) v = lch[v], r = m;
      else v = rch[v], l = m;
    }
    return val[v];
  }

  // バージョン root の op(a[l], ..., a[r - 1]) を返す. l == r なら e(). O(log n)
  S prod(int root, int l, int r) const {
    assert(0 <= l && l <= r && r <= _n);
    if (l == r) return e();
    return prod(root, 0, _n, l, r);
  }

  // バージョン root の全要素の積を返す. O(1)
  S all_prod(int root) const { return _n == 0 ? e() : val[root]; }

  // ノードの情報（木の上の二分探索を自分で書くとき用）
  S value(int v) const { return val[v]; }
  int left(int v) const { return lch[v]; }
  int right(int v) const { return rch[v]; }
  int size() const { return _n; }
  int node_count() const { return val.size(); }

 private:
  int _n;
  vector<S> val;          // ノードが表す区間の積
  vector<int> lch, rch;   // 子のノード番号（葉なら -1）

  int new_node(S x, int l, int r) {
    val.push_back(x);
    lch.push_back(l);
    rch.push_back(r);
    return (int)val.size() - 1;
  }

  // ノード番号を返す. ノード v は区間 [l, r) を表す
  int build(const vector<S>& v, int l, int r) {
    if (r - l == 1) return new_node(v[l], -1, -1);
    int m = (l + r) / 2;
    int a = build(v, l, m), b = build(v, m, r);
    return new_node(op(val[a], val[b]), a, b);
  }

  // パスコピー: 根から葉 p までのノードだけを作り直し、他の子は共有する
  int set(int v, int l, int r, int p, S x) {
    if (r - l == 1) return new_node(x, -1, -1);
    int m = (l + r) / 2;
    int a = lch[v], b = rch[v];
    if (p < m) a = set(a, l, m, p, x);
    else b = set(b, m, r, p, x);
    return new_node(op(val[a], val[b]), a, b);
  }

  S prod(int v, int l, int r, int ql, int qr) const {
    if (ql <= l && r <= qr) return val[v];
    int m = (l + r) / 2;
    if (qr <= m) return prod(lch[v], l, m, ql, qr);
    if (m <= ql) return prod(rch[v], m, r, ql, qr);
    return op(prod(lch[v], l, m, ql, qr), prod(rch[v], m, r, ql, qr));
  }
};
```

使用例（区間 $[l, r)$ の $k$ 番目（0-indexed）に小さい値. $A_i$ は $0, \dots, V - 1$ に座標圧縮済み）:

```cpp
int op(int a, int b) { return a + b; }
int e() { return 0; }

persistent_segtree<int, op, e> seg(V);
vector<int> root(N + 1);
root[0] = seg.build();
for (int i = 0; i < N; i++) {
  root[i + 1] = seg.set(root[i], A[i], seg.get(root[i], A[i]) + 1);
}

// 2 つのバージョン root[l], root[r] を同時に降りる. O(log V)
auto kth_smallest = [&](int l, int r, int k) {
  int vl = root[l], vr = root[r];
  int lo = 0, hi = seg.size();
  while (hi - lo > 1) {
    int mid = (lo + hi) / 2;
    int c = seg.value(seg.left(vr)) - seg.value(seg.left(vl));  // [l, r) 内で値が [lo, mid) の個数
    if (k < c) {
      vl = seg.left(vl), vr = seg.left(vr), hi = mid;
    } else {
      k -= c;
      vl = seg.right(vl), vr = seg.right(vr), lo = mid;
    }
  }
  return lo;
};
```
