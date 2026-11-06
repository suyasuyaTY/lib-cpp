---
title: "長方形の和集合の面積"
tags: [offline, range-query]
sidebar:
  order: 2
---
## 概要

> $\{(x,y): l_i \le x \le r, d_i \le y \le u_i \}$ で表される長方形の和集合の面積を求めよ。

$x$ 軸に沿って長方形が存在する区間を見ていくことで、すべての平面を走査する。

## 実装

```cpp
class rectangle_union {
 private:
  using S = pll;  // S: {区間の最小値, その最小値を持つ区間の合計長}
  using F = int;  // 区間に加算する値
  static S op(S x, S y) {
    if (x.first == y.first) return {x.first, x.second + y.second};
    return min(x, y);
  }
  static S mapping(F f, S x) {
    return {x.first + f, x.second};
  }
  static F composition(F f, F g) {
    return f + g;
  }
  static S e() { return {LINF, 0}; }
  static F id() { return 0; }

  vector<array<int, 4>> query;
  vector<int> Y;  // 座標圧縮用

 public:
  rectangle_union() {}

  // x \in [l, r], y \in [d, u] で表される長方形を追加
  void add_rectangle(int l, int r, int d, int u) {
    // 面積が0の長方形は無視
    r += 1, u += 1
    if (l >= r || d >= u) return;
    query.push_back({l, d, u, 1});
    query.push_back({r, d, u, -1});
    Y.push_back(d);
    Y.push_back(u);
  }

  ll solve() {
    // Y座標の座標圧縮
    ranges::sort(Y);
    Y.erase(unique(Y.begin(), Y.end()), Y.end());

    // 区間が0個なら面積は0
    if (Y.size() < 2) {
      return 0;
    }

    // セグメント木の初期化
    int M = Y.size();
    vector<S> v(M - 1);
    for (int i = 0; i < M - 1; i++) {
      v[i] = {0, (ll)Y[i + 1] - Y[i]};
    }
    lazy_segtree<S, op, e, F, mapping, composition, id> seg(v);

    // イベントのソート
    ranges::sort(query);

    // 平面走査
    ll ans = 0;
    int prev_x = query[0][0];  // 最初のイベントx座標
    size_t idx = 0;

    // 考慮するY軸の全長
    ll total_Y_length = (ll)Y.back() - Y.front();

    while (idx < query.size()) {
      int current_x = query[idx][0];

      // 面積の加算
      if (current_x > prev_x) {
        S ret = seg.all_prod();
        ll positive_length = total_Y_length - (ret.first == 0 ? ret.second : 0);
        ans += positive_length * (ll)(current_x - prev_x);
      }

      // セグメント木の更新 (同じx座標のイベントを全て処理)
      while (idx < query.size() && query[idx][0] == current_x) {
        auto [_, d_orig, u_orig, type] = query[idx++];

        // Y座標を圧縮後のインデックスに変換
        int d_idx = lower_bound(Y.begin(), Y.end(), d_orig) - Y.begin();
        int u_idx = lower_bound(Y.begin(), Y.end(), u_orig) - Y.begin();

        // 区間 [d_idx, u_idx) に type (+1 or -1) を適用
        if (d_idx < u_idx) {
          seg.apply(d_idx, u_idx, type);
        }
      }

      prev_x = current_x;
    }

    return ans;
  }
};
```

## 問題例

### [ABC346-G Alone](https://atcoder.jp/contests/abc346/tasks/abc346_g)

- $i$ を固定したとき, $A[i] = x$ がただ一つだけ現れる区間は次のようにあらわすことができる
  - $i$ の直前に $A[s] = x$ となる $s$。（もしなければ $s = -1$）
  - $i$ の直後に $A[t] = x$ となる $t$。（もしなければ $t = N$）
  - $L \in [s + 1, i], R \in [i, t - 1]$
- 各 $i$ に対しこれは簡単に求まるので、この和集合の面積を求めればいい。
