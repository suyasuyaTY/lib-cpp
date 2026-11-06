---
title: "動的セグメント木"
tags: [range-query, point-update, monoid]
sidebar:
  order: 3
---
## 概要

添え字の範囲は広いが、値を更新する位置は少ないときに使うセグメント木。たとえば $[0, 10^{18})$ の位置に値を置き、1点更新や区間和・区間最大値を求めたい場合に使える。
通常のセグメント木では添え字の範囲に比例するメモリが必要になるが、動的セグメント木では更新に必要な経路だけノードを作るため、使わない位置の分までメモリを確保せずに済む。

特に、クエリを処理する途中で新しい位置が決まり、事前に座標圧縮できないオンライン問題で便利。更新位置がすべて事前にわかるなら、座標圧縮と通常のセグメント木を組み合わせる方法も選べる。

## 実装

### データの持ち方

各ノードは半開区間 $[l, r)$ を担当し、その区間の集約値 `val` と左右の子の番号を持つ。ノードは `vector` にまとめて保存し、子がまだなければ番号を `-1` にする。初期状態では根だけを作り、すべての位置の値を単位元 `e()` として扱う。

`set` では区間を半分ずつに分け、更新位置を含む子だけをたどる。その経路で不足するノードを作り、葉の値を書き換えてから親の集約値を更新する。同じ経路のノードは再利用するので、更新のたびに木全体を作る必要はない。

`prod` では、ノードがない区間や検索範囲と重ならない区間は `e()` を返す。検索範囲に完全に含まれる区間は保存済みの `val` を返し、境界にかかる区間だけをさらに分割する。`get` と `prod` はノードを作らないため、未更新の広い区間を問い合わせてもメモリは増えない。

管理する範囲の幅を $U = r - l$ とすると、木の高さは $O(\log U)$ で、幅が $10^{18}$ でも約60段。`op` と `e` が $O(1)$ なら、1点更新・1点取得・区間取得はそれぞれ $O(\log U)$、全体の集約値の取得は $O(1)$ になる。異なる $K$ 個の位置を更新したときのノード数は $O(1 + K\log U)$ で、範囲全体に比例するメモリは不要。ただし、更新位置が多い場合はノード数も増えるので、通常のセグメント木より常に省メモリになるわけではない。

`op` は結合則を満たす演算、`e()` はその単位元とする。以下の実装では、管理範囲の両端と幅が `long long` に収まることを前提とする。

### コード

```cpp
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
