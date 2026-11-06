---
title: "重軽分解(HLD)"
tags: [tree, path-query, range-query]
sidebar:
  order: 14
---
## コード

```cpp
int N;
vector<vector<int>> G;

vector<int> subtree_size(N), depth(N), parent(N);
{
    // 1st dfs
    // calculate subtree size, put the heavy child first.
    auto dfs = [&](auto& dfs, int v, int p) -> void {
        parent[v] = p;
        depth[v] = (p == -1 ? 0 : depth[p] + 1);
        subtree_size[v] = 1;

        // 先頭に親が来ていたら一番後ろに置く
        if (!G[v].empty() && G[v][0] == p) swap(G[v][0], G[v].back());
        for (int& w : G[v]) {
            if (w == p) continue;
            dfs(dfs, w, v);
            subtree_size[v] += subtree_size[w];
            // 一番多い要素よりも多かったら一番前に置く
            if (subtree_size[w] > subtree_size[G[v][0]]) swap(G[v][0], w);
        }
    };
    dfs(dfs, 0, -1);
}

vector<int> vertex(N), id(N), head(N);
{
    // 2nd dfs
    int k = 0;
    auto dfs = [&](auto& dfs, int v, int p) -> void {
        id[v] = k;
        vertex[k++] = v;
        for (int& w : G[v]) {
            if (w == p) continue;
            bool heavy = (w == G[v][0]);
            // この辺が heavy edge なら、子の head は親の head の一致
            head[w] = (heavy ? head[v] : w);
            dfs(dfs, w, v);
        }
    };
    dfs(dfs, 0, -1);
}
```

## LCA

```cpp
 auto Level_Ancestor = [&](int v, int d) -> int {
    assert(depth[v] >= d);
    while (depth[head[v]] > d) {
      v = parent[head[v]];
    }
    return vertex[id[v] - (depth[v] - d)];
  };

auto LCA = [&](int u, int v) -> int {
    while (head[u] != head[v]) {
        if (depth[head[u]] < depth[head[v]]) swap(u, v);
        u = parent[head[u]];
    }
    return depth[u] < depth[v] ? u : v;
};
```

## パスクエリ

系 2 より, $u$ から $v$ までのパスを通る light edge の個数は $O(\log N)$ であるので、 heavy edge 上の区間に分割できる。

### 問題 7 のコード

```cpp
using S = ll;
S op(S a, S b) {
  return a + b;
}
S e() {
  return 0;
}

void solve() {
  vector<ll> A(N);

  vector<S> B(N);  // HLD の行きがけ順に頂点の値を並べ替える
  for (int v = 0; v < N; v++) {
    B[id[v]] = A[v];
  }

  segtree<S, op, e> seg(B);

  // u -> v までのパスクエリを解く
  auto path_query = [&](int u, int v) -> S {
    S ans = e();
    while (head[u] != head[v]) {
      // head が深い方を処理する
      if (depth[head[u]] < depth[head[v]]) {
        swap(u, v);
      }

      // head[u] ~ u は 1 本の heavy path
      ans = op(ans, seg.prod(id[head[u]], id[u] + 1));

      // light edge を 1 本超える
      u = parent[head[u]];
    }

    // 最後は同じ heavy path 上
    if (depth[u] > depth[v]) {
      swap(u, v);
    }

    ans = op(ans, seg.prod(id[u], id[v] + 1));

    return ans;
  };
}
```

### 辺に値を置く場合

- 根以外の頂点 `v` について、辺 `(parent[v], v)` の値を子側の `id[v]` に格納する
- 異なる heavy path を処理する区間 `head[u] -> u` には、`head[u]` とその親を結ぶ light edge も `id[head[u]]` に格納されているため、処理は変わらない
- 同じ heavy path に入ったとき、 LCA の `id` に格納されている辺は LCA とその親を結ぶ辺であり、`u` から `v` のパスには含まれないので、 LCA の位置を除外する。

```cpp
using S = ll;
S op(S a, S b) {
  return a + b;
}
S e() {
  return 0;
}

void solve() {
  // edge_value[v] は辺 (parent[v], v) の値。根 0 の値は使用しない。
  vector<S> edge_value(N);

  // 辺の値を子側の頂点の位置へ格納する。
  vector<S> B(N, e());
  for (int v = 1; v < N; v++) {
    B[id[v]] = edge_value[v];
  }
  segtree<S, op, e> seg(B);

  auto path_query = [&](int u, int v) -> S {
    S ans = e();
    while (head[u] != head[v]) {
      if (depth[head[u]] < depth[head[v]]) {
        swap(u, v);
      }

      // id[head[u]] には head[u] とその親を結ぶ light edge の値がある。
      ans = op(ans, seg.prod(id[head[u]], id[u] + 1));
      u = parent[head[u]];
    }

    if (depth[u] > depth[v]) {
      swap(u, v);
    }

    // id[u] にあるのは LCA とその親を結ぶ辺なので、パスから除外する。
    // u == v なら空区間になり e() を返す。
    ans = op(ans, seg.prod(id[u] + 1, id[v] + 1));

    return ans;
  };
}
```

### 非可換な演算

- 文字列連結や行列積、関数の合成といった非可換な演算ではパスを進む向きを考慮して値を保存する必要がある
- セグメント木の各要素に、区間の正順と逆順の 2 つの積を持たせる
- `u` 側と `v` 側の結果を別々に持ち、最後に `u -> LCA -> v` の順で結合する

```cpp
using T = /* 頂点に持たせる値の型 */;

T combine(T a, T b) {
  // 文字列連結や行列積などの結合的な演算
}

T identity() {
  // combine の単位元
}

struct S {
  // セグメント木の各区間について、両方向の積を持つ。
  T forward;  // 左端 -> 右端
  T reverse;  // 右端 -> 左端
};

S op(S a, S b) {
  // 正順では a * b、逆順では b * a の順に結合する。
  return {
      combine(a.forward, b.forward),
      combine(b.reverse, a.reverse),
  };
}

S e() {
  return {identity(), identity()};
}

void solve() {
  vector<T> A(N);

  // 葉では正順と逆順が同じ値になる。
  vector<S> B(N);
  for (int v = 0; v < N; v++) {
    B[id[v]] = {A[v], A[v]};
  }
  segtree<S, op, e> seg(B);

  auto path_query = [&](int u, int v) -> T {
    // left は元の u -> LCA、right は LCA -> 元の v の積を持つ。
    T left = identity();
    T right = identity();

    while (head[u] != head[v]) {
      if (depth[head[u]] >= depth[head[v]]) {
        // 行きがけ順なので、 head[u] -> u の順番で計算されている
        // そのため, reverse を使う
        S part = seg.prod(id[head[u]], id[u] + 1);
        left = combine(left, part.reverse);
        u = parent[head[u]];
      } else {
        // v -> head[v] の順番で計算されているので、 forward を使う
        S part = seg.prod(id[head[v]], id[v] + 1);
        right = combine(part.forward, right);
        v = parent[head[v]];
      }
    }

    if (depth[u] >= depth[v]) {
      // v が LCA。LCA の値は left 側へ一度だけ含める。
      S part = seg.prod(id[v], id[u] + 1);
      left = combine(left, part.reverse);
    } else {
      // u が LCA。LCA の二重計上を避けるため id[u] を除外する。
      S part = seg.prod(id[u] + 1, id[v] + 1);
      right = combine(part.forward, right);
    }

    return combine(left, right);
  };

  auto set_vertex = [&](int v, T x) -> void {
    // 向きによって頂点値が変わらない場合は、両方向へ同じ値を設定する。
    // 辺の向きで値や作用が変わる問題では forward と reverse を個別に設定する。
    seg.set(id[v], {x, x});
  };
}
```

## 実装

```cpp title="HLD.cpp"
#include <bits/stdc++.h>

using namespace std;

void HLD() {
  int N;
  vector<vector<int>> G;

  vector<int> subtree_size(N), depth(N), parent(N);
  {
    // 1st dfs
    // calculate subtree size, put the heavy child first.
    auto dfs = [&](auto& dfs, int v, int p) -> void {
      parent[v] = p;
      depth[v] = (p == -1 ? 0 : depth[p] + 1);
      subtree_size[v] = 1;

      // 先頭に親が来ていたら一番後ろに置く
      if (!G[v].empty() && G[v][0] == p) swap(G[v][0], G[v].back());
      for (int& w : G[v]) {
        if (w == p) continue;
        dfs(dfs, w, v);
        subtree_size[v] += subtree_size[w];
        // 一番多い要素よりも多かったら一番前に置く
        if (subtree_size[w] > subtree_size[G[v][0]]) swap(G[v][0], w);
      }
    };
    dfs(dfs, 0, -1);
  }

  vector<int> vertex(N), id(N), head(N);
  {
    // 2nd dfs
    int k = 0;
    auto dfs = [&](auto& dfs, int v, int p) -> void {
      id[v] = k;
      vertex[k++] = v;
      for (int& w : G[v]) {
        if (w == p) continue;
        bool heavy = (w == G[v][0]);
        // この辺が heavy edge なら、子の head は親の head の一致
        head[w] = (heavy ? head[v] : w);
        dfs(dfs, w, v);
      }
    };
    dfs(dfs, 0, -1);
  }

  auto Level_Ancestor = [&](int v, int d) -> int {
    assert(depth[v] >= d);
    while (depth[head[v]] > d) {
      v = parent[head[v]];
    }
    return vertex[id[v] - (depth[v] - d)];
  };

  auto LCA = [&](int u, int v) -> int {
    while (head[u] != head[v]) {
      if (id[u] > id[v]) swap(u, v);
      v = parent[head[v]];
    }
    return (id[u] < id[v] ? u : v);
  };
}
```

## 参照元

[重軽分解（HLD）](https://info.atcoder.jp/entry/algorithm_lectures/heavy_light_decomposition)
