---
title: "Mo's Algorithm"
tags: [offline, range-query, sqrt]
sidebar:
  order: 1
---
## 概要

更新のない配列に対する区間クエリを、順番を並べ替えて処理する。区間の両端への要素の追加・削除が高速にでき、クエリを先読みできる場合に使える。

## アルゴリズム

### クエリの並べ替え

左端を幅 $B$ のブロックに分け、ブロック番号の昇順に処理する。同じブロックでは右端を、偶数ブロックなら昇順、奇数ブロックなら降順にする。これにより右端の大移動を減らせる。

### 計算量

配列長 $N$、クエリ数 $Q$、追加・削除 $O(T)$、答えの取得 $O(K)$ とする。

- 左端の移動：$O(QB + N)$、右端の移動：$O(N^2/B)$。
- 全体：$O(T(QB + N^2/B) + QK)$。
- $B \approx N/\sqrt{Q}$ とすると $O(TN\sqrt{Q} + QK)$（$1 \le Q \le N^2$）。

### 実装

```cpp
int N, Q;

vector<int> A(N);
vector<pair<int, int>> query(Q);  // [l, r)

auto sort_query = [&](int n, const vector<pair<int, int>> &query) -> vector<int> {
    int q = query.size();
    int B = max(1, int(n / sqrt(max(1, q))));
    vector<int> idxs(q);
    iota(idxs.begin(), idxs.end(), 0);
    ranges::sort(idxs, [&](int a, int b) {
        int ab = query[a].first / B, bb = query[b].first / B;
        if (ab != bb) return ab < bb;
        if (ab % 2 == 0) return query[a].second < query[b].second;
        return query[a].second > query[b].second;
    });
    return idxs;
};

auto solve = [&]() -> vector<int> {
    vector<int> ans(Q);
    auto idxs = sort_query(N, query);
    int res = 0;
    // 集計用の状態を初期化
    auto add = [&](int i) -> void {
        // A[i] を追加し、状態と res を更新
    };
    auto remove = [&](int i) -> void {
        // A[i] を削除し、状態と res を更新
    };
    auto get = [&](int idx) -> int {
        return res;  // 必要ならクエリ idx に応じて計算
    };

    int l = 0, r = 0;
    for (int idx : idxs) {
        auto [L, R] = query[idx];
        while (l > L) add(--l);
        while (r < R) add(r++);
        while (l < L) remove(l++);
        while (r > R) remove(--r);
        ans[idx] = get(idx);
    }
    return ans;
};

auto ans = solve();
```

## 木上のパスクエリ

TODO: Euler Tour のノートを参照（入るとき・出るときに各頂点を記録する列）。区間内で奇数回現れる頂点だけを集計する。

```cpp
// 疑似コード：sort_query は上のラムダを使用
vector<int> in(N), out(N), order;
{
    auto dfs = [&](auto& dfs, int v, int p) -> void {
        in[v] = order.size();
        tour.push_back(v);
        for (int w : G[v]) {
                if (w == p) continue;
                dfs(dfs, w, v);
            }
            out[v] = order.size();
            order.push_back(v);
        };
    dfs(dfs, 0, -1);
}
vector<pair<int, int>> path(Q);  // 頂点 u, v

auto solve = [&]() -> vector<int> {
    vector<pair<int, int>> query(Q);
    vector<int> extra(Q, -1), ans(Q);
    for (int i = 0; i < Q; i++) {
        auto [u, v] = path[i];
        if (in[u] > in[v]) swap(u, v);
        query[i] = {in[u] + 1, in[v] + 1};
        extra[i] = LCA(u, v);
    }

    auto idxs = sort_query(order.size(), query);
    vector<bool> active(N, false);
    int res = 0;
    // 集計用の状態を初期化
    auto add = [&](int v) -> void {
        // 頂点 v を追加し、状態と res を更新
    };
    auto remove = [&](int v) -> void {
        // 頂点 v を削除し、状態と res を更新
    };
    auto toggle = [&](int v) -> void {
        if (active[v]) remove(v);
        else add(v);
        active[v] = !active[v];
    };
    auto get = [&](int idx) -> int {
        return res;
    };

    int l = 0, r = 0;
    for (int idx : idxs) {
        auto [L, R] = query[idx];
        while (l > L) toggle(order[--l]);
        while (r < R) toggle(order[r++]);
        while (l < L) toggle(order[l++]);
        while (r > R) toggle(order[--r]);
        if (extra[idx] != -1) add(extra[idx]);
        ans[idx] = get(idx);
        if (extra[idx] != -1) remove(extra[idx]);
    }
    return ans;
};
```

## 平方分割

例として、値の種類数を $M$ とし、区間内の $k$ 番目に小さい値を求める。値ごとの出現回数を管理すると、次の違いがある（ソートを除く、$1 \le Q \le N^2$）。

| データ構造 | 追加・削除 $T$ | 答えの取得 $K$ | Mo 全体 |
| --- | --- | --- | --- |
| Fenwick 木 | $O(\log M)$ | $O(\log M)$ ※ | $O((N\sqrt{Q} + Q)\log M)$ |
| [平方分割](../../data-structure/sqrt-decomposition/) | $O(1)$ | $O(\sqrt{M})$ | $O(N\sqrt{Q} + Q\sqrt{M})$ |

※ Fenwick 木上で二分累乗による探索を行う。累積和を呼ぶ通常の二分探索だと $O(\log^2 M)$。

平方分割では各値と所属ブロックの出現回数を更新し、答えはブロック単位、その内部の順に走査する。追加・削除は $O(N\sqrt{Q})$ 回、答えの取得は $Q$ 回なので、更新の多い Mo では平方分割が有利になる場合がある。

## 実装

```cpp title="mo_algorithm.cpp"
#include <algorithm>
#include <cassert>
#include <cmath>
#include <ranges>
#include <vector>

// 計算量（平面に置き換えて考える, x 軸をブロックに分ける）
// ・B: ブロックサイズ, W: 区間の全体幅, N: クエリの数
// ・一つのブロック内の y 方向の移動: y 軸方向の最大の移動距離 W, ブロックの数 W / B -> W^2 / B
// ・一つのブロック内の x 方向の移動: x 軸方向の最大の移動距離 B, 地点間の移動 N -> N * B
// ・ブロックをまたぐ x 方向の移動: x 軸方向の最大の移動距離 2 * B, 移動回数 W / B -> 2 * W
// 相加相乗平均より、 B = \frac{W}{\sqrt{N}} が最適

// Reference (original implementation):
//   ei1333の日記: "Mo's akgorithm")
//   https://ei1333.hateblo.jp/entry/2017/09/11/211011
// Accessed: 2026-03-08
//
// Notes:
//   - Adapted to ACL-style monoid interface (S, op, e).

class Mo {
 private:
  int N, Q, block_size;

  std::vector<std::pair<int, int>> query;
  std::vector<int> idxs;

  bool qcomp(int a, int b) const {
    int ab = query[a].first / block_size;
    int bb = query[b].first / block_size;

    if (ab != bb) return ab < bb;

    // 典型テク：ブロックが偶数なら r 昇順、奇数なら r 降順
    if (ab % 2 == 0)
      return query[a].second < query[b].second;
    else
      return query[a].second > query[b].second;
  }

 public:
  Mo(int n) : N(n) {}

  // [l, r) として入れる
  void add(int l, int r) {
    query.emplace_back(l, r);
  }

  void build() {
    Q = ssize(query);
    assert(Q > 0);

    block_size = N / std::min(N, static_cast<int>(sqrt(Q)));
    idxs.resize(Q);

    std::ranges::iota(idxs, 0);

    std::ranges::sort(idxs, [this](int a, int b) { return qcomp(a, b); });
  }

  // ここを実装
  std::vector<int> solve(const std::vector<int> &A) {
    int l = 0, r = 0;
    for (auto idx : idxs) {
      while (l > query[idx].first);
      while (r < query[idx].second);
      while (l < query[idx].first);
      while (r > query[idx].second);
    }
  }
};
```

## 参考

- [Mo's algorithm - ei1333の日記](https://ei1333.hateblo.jp/entry/2017/09/11/211011)
