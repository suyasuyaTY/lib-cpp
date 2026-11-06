---
title: "重み付き Union-Find"
tags: [union-find, potential]
sidebar:
  order: 17
---
頂点間のポテンシャル差を保ちながら集合を併合する。`merge`, `same`, `get_diff`, `groups`

## 実装

```cpp title="weighted_union_find.cpp"
#include <bits/stdc++.h>
using namespace std;

template <class T> struct WeightedUnionFind {
  vector<int> par;
  vector<T> weight;

  WeightedUnionFind(){};
  WeightedUnionFind(int N, T zero = 0) : par(N, -1), weight(N, zero){};

  int root(int x) {
    if (par[x] < 0) {
      return x;
    } else {
      int r = root(par[x]);
      weight[x] += weight[par[x]];  // 直接根と結ぶので、現在の親から根の重みを加える
      return par[x] = r;
    }
  }

  bool same(int x, int y) {
    return root(x) == root(y);
  }

  int size(int x) {
    return -par[root(x)];
  }

  // v[y] - v[x] = w
  bool merge(int x, int y, T w) {
    // X: xの根, Y: yの根
    // (v[y] - v[x]) + (v[x] - V[X]) - (v[y] - v[Y]) = v[Y] - v[X]
    // Xが親のままであれば、そのままでいい
    w += get_weight(x), w -= get_weight(y);
    x = root(x), y = root(y);
    if (x == y) return false;
    if (par[x] > par[y]) {
      // merge technique
      // y の部分木の方が小さくなるようにする
      swap(x, y);
      w = -w;
    }
    par[x] += par[y];
    par[y] = x;
    weight[y] = w;
    return true;
  }

  // get v[x]
  T get_weight(int x) {
    root(x);
    return weight[x];
  }

  // get v[y] - v[x]
  T get_diff(int x, int y) {
    return get_weight(y) - get_weight(x);
  }

  // get groups
  vector<vector<int>> groups() {
    vector<vector<int>> member(par.size());
    for (int v = 0; v < (int)par.size(); ++v) {
      member[root(v)].push_back(v);
    }
    vector<vector<int>> res;
    for (int v = 0; v < (int)par.size(); ++v) {
      if (!member[v].empty()) res.push_back(member[v]);
    }
    return res;
  }

  // debug
  friend ostream &operator<<(ostream &s, WeightedUnionFind uf) {
    const vector<vector<int>> &gs = uf.groups();
    for (const vector<int> &g : gs) {
      s << "group: ";
      for (int v : g) s << v << "(" << uf.get_weight(v) << ") ";
      s << endl;
    }
    return s;
  }
};
```
