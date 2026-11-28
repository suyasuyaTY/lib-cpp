---
title: "動的セグメント木"
tags: [range-query, point-update, monoid]
status: verified
sidebar:
  order: 3
---
## 1. 概要

添え字の範囲 $[L, R)$ は広いが、値を更新する位置は少ないときに使うセグメント木.

管理する範囲の幅を $U = R - L$、更新した位置の個数を $K$ とする.

| 操作 | 計算量 |
| --- | --- |
| 構築（全要素 $e$） | $O(1)$ |
| 一点更新（`set`） | $O(\log U)$ |
| 一点取得（`get`） | $O(\log U)$ |
| 区間積（`prod`） | $O(\log U)$ |
| 全体の積（`all_prod`） | $O(1)$ |
| メモリ | $O(1 + K \log U)$ |

特に、クエリを処理する途中で新しい位置が決まり、事前に座標圧縮できない**オンライン**の問題で便利である.
更新位置がすべて事前に分かるなら、座標圧縮と通常のセグメント木を組み合わせる方法も選べる（そちらの方が定数倍が軽い）.

## 2. 前提知識

- [セグメント木](../../data-structure/segment-tree/)

## 3. 動的セグメント木

### 3.1. データの持ち方

各ノードは半開区間 $[l, r)$ を担当し、次を持つ. $m = l + \lfloor (r - l) / 2 \rfloor$ とする.

- `val`: 区間 $[l, r)$ の集約値
- `left`: 区間 $[l, m)$ を担当する左の子の番号（子がまだなければ `-1`）
- `right`: 区間 $[m, r)$ を担当する右の子の番号（子がまだなければ `-1`）

ノードは `vector` にまとめて保存する.
初期状態では根だけを作り、**ノードのない区間はすべての値が単位元 $e$** であるとみなす.

### 3.2. 一点更新

`set` では区間を半分ずつに分け、更新位置を含む子だけをたどる.
その経路で不足するノードを作り、葉の値を書き換えてから、帰りがけに親の集約値を $\mathrm{op}(\text{左の子}, \text{右の子})$ で計算し直す.

木の高さは $\lceil \log_2 U \rceil$ で、$U = 10^{18}$ でも約 60 段である. 1 回の `set` で作るノードは経路上の高々 $\lceil \log_2 U \rceil$ 個なので、異なる $K$ 個の位置を更新したときのノード数は $O(1 + K \log U)$ である.

### 3.3. 区間積・一点取得

`prod` では、ノードがない区間や検索範囲と重ならない区間は $e$ を返す.
検索範囲に完全に含まれる区間は保存済みの `val` を返し、境界にかかる区間だけをさらに分割する.
通常のセグメント木と同じく、各段で境界にかかるノードは高々 2 個なので、訪れるノードは $O(\log U)$ 個である.

`get` と `prod` はノードを作らないため、未更新の広い区間を問い合わせてもメモリは増えない.

:::tip
区間作用が必要なら、遅延セグメント木を同じように動的にできる（子を作るときに親の遅延作用を持たせる）. また、ノードを書き換えずにコピーして作り直すと[永続セグメント木](../../data-structure/persistent-segment-tree/)になる.
:::

## 4. 参考資料

- [Segment Tree - cp-algorithms](https://cp-algorithms.com/data_structures/segment_tree.html)（"Dynamic segment tree" の節: 必要なノードだけをポインタで作る方法と計算量）
- [Dynamic Segment Tree - Nyaan's Library](https://nyaannyaan.github.io/library/segment-tree/dynamic-segment-tree.hpp.html)（遅延伝播付きの動的セグメント木の実装例）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（`set`, `get`, `prod`, `all_prod` のインターフェース）

## 5. コード

- `dynamic_segtree<S, op, e>`: モノイド $(S, \mathrm{op}, e)$ の列を管理する.
- `dynamic_segtree(l, r)`: 添え字の範囲 $[l, r)$ で、全要素 `e()` に初期化する. $O(1)$.
- `set(p, x)`: $a_p \leftarrow x$. $O(\log U)$.
- `get(p)`: $a_p$ を返す. $O(\log U)$.
- `prod(l, r)`: $\mathrm{op}(a_l, \dots, a_{r-1})$ を返す. $l = r$ なら `e()`. $O(\log U)$.
- `all_prod()`: 全要素の積を返す. $O(1)$.

```cpp title="dynamic_segtree.cpp"
template <class S, S (*op)(S, S), S (*e)()>
struct dynamic_segtree {
 private:
  using ll = long long;

  struct node {
    S val;
    int left, right;

    node() : val(e()), left(-1), right(-1) {}
  };

  vector<node> d;

  ll _l, _r;  // 動的セグメント木が管理する範囲

  // 単位元を持つノードを追加し、その番号を返す
  int new_node() {
    d.emplace_back();
    return (int)d.size() - 1;
  }

  // 未作成のノードは単位元として扱う
  S value(int v) const {
    return v == -1 ? e() : d[v].val;
  }

  // [l, r) を探索中、位置 p の値を x に置き換える
  void set_impl(int v, ll l, ll r, ll p, S x) {
    if (r - l == 1) {
      d[v].val = x;
      return;
    }

    ll m = l + (r - l) / 2;

    if (p < m) {
      if (d[v].left == -1) {
        int nv = new_node();
        d[v].left = nv;
      }
      set_impl(d[v].left, l, m, p, x);
    } else {
      if (d[v].right == -1) {
        int nv = new_node();
        d[v].right = nv;
      }
      set_impl(d[v].right, m, r, p, x);
    }

    d[v].val = op(value(d[v].left), value(d[v].right));
  }

  // [l, r) を探索中、位置 p の値を求める
  S get_impl(int v, ll l, ll r, ll p) const {
    if (v == -1) {
      return e();
    }

    if (r - l == 1) {
      return d[v].val;
    }

    ll m = l + (r - l) / 2;

    if (p < m) {
      return get_impl(d[v].left, l, m, p);
    } else {
      return get_impl(d[v].right, m, r, p);
    }
  }

  // [l, r) を探索中, [ql, qr) の prod を求める
  S prod_impl(int v, ll l, ll r, ll ql, ll qr) const {
    if (v == -1) {
      return e();
    }

    if (r <= ql || qr <= l) {
      return e();
    }

    if (ql <= l && r <= qr) {
      return d[v].val;
    }

    ll m = l + (r - l) / 2;

    return op(
        prod_impl(d[v].left, l, m, ql, qr),
        prod_impl(d[v].right, m, r, ql, qr));
  }

 public:
  // [l, r) を管理する木を作る（初期値はすべて e()）
  dynamic_segtree(ll l, ll r) : _l(l), _r(r) {
    assert(l < r);
    d.emplace_back();  // root = 0
  }

  // a[p] = x
  void set(ll p, S x) {
    assert(_l <= p && p < _r);
    set_impl(0, _l, _r, p, x);
  }

  // a[p] を取得する
  S get(ll p) const {
    assert(_l <= p && p < _r);
    return get_impl(0, _l, _r, p);
  }

  // [l, r) の値を op でまとめる（空区間なら e()）
  S prod(ll l, ll r) const {
    assert(_l <= l && l <= r && r <= _r);

    if (l == r) {
      return e();
    }

    return prod_impl(0, _l, _r, l, r);
  }

  // 管理範囲全体の集約値を取得する
  S all_prod() const {
    return d[0].val;
  }
};
```

使用例（$[0, 10^{18})$ 上の区間和）:

```cpp
long long op(long long a, long long b) { return a + b; }
long long e() { return 0; }

dynamic_segtree<long long, op, e> seg(0, (long long)1e18);
seg.set(p, seg.get(p) + x);       // a[p] += x
long long s = seg.prod(l, r);     // [l, r) の和
```
