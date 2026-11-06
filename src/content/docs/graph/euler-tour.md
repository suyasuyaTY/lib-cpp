---
title: "オイラーツアー"
tags: [tree, subtree-query, path-query, inverse-required]
sidebar:
  order: 12
---
[オイラーツアーテクニック - AtCoderInfo](https://info.atcoder.jp/entry/algorithm_lectures/euler_tour_technique)

## 概要

根付き木に対して、根からDFSを行うことで、すべての辺を双方向に1度ずつ通るようなウォークが得られる。

このウォークをオイラーツアーという。

## 部分木クエリ

- `in[v]` ：部分木`v` に入ったタイミング
- `out[v]` ：部分木`v` から出るタイミング
- 同じ頂点が複数回出現するのを避けるために、行きがけ順で`v_tour` に入れる
- 部分木`v` には、半開区間`[in[v], out[v])` が対応している

```cpp
void dfs(int v, int p) {
  v_in[v] = v_tour.size();
  v_tour.push_back(v);
  for (const int nv : g[v]) {
    if (nv == p) continue;
    dfs(nv, v);
  }
  v_out[v] = v_tour.size();
}
```

## パスクエリ

辺を根→葉に通った時に正の重み、葉→根に通った時に負の重みを与えることで、根からその頂点までのパスの重みを求めることができる。

- 逆元が必要
- 根からその親に仮想の辺が出ているとすると実装しやすい
- `in[v]` ：親から頂点`v` への辺を使うタイミング
- `out[v]` ：頂点`v` から親への辺を使うタイミング

```cpp
void dfs(int v, int p) {
 dfs(int v, int p) {
  e_in[v] = e_tour.size();
  e_tour.push_back(v + 1);

  for (const int nv : g[v]) {
    if (nv == p) continue;
    dfs(nv, v);
  }

  e_out[v] = e_tour.size();
  e_tour.push_back(-(v + 1));
}
}
```

- 頂点重みをその頂点から親への辺の重みに対応させることでパスクエリで解くことができる。

## 実装

```cpp title="euler_tour.cpp"
#include <bits/stdc++.h>

using namespace std;

void euler_tour_vertex() {
  int N;
  vector<vector<int>> G;

  vector<int> in(N), out(N), tour;
  {
    auto dfs = [&](auto &dfs, int v, int p) -> void {
      in[v] = tour.size();
      tour.push_back(v);
      for (int w : G[v]) {
        if (w == p) continue;
        dfs(dfs, w, v);
      }
      out[v] = tour.size();
    };
    dfs(dfs, 0, -1);
  }
}

void euler_tour_edge() {
  int N;

  struct Edge {
    int to, id;
  };

  vector<vector<Edge>> G;

  vector<int> in(N), out(N), tour;
  // 辺 i の子側の頂点
  // 辺 0 は根から仮想親に伸びている辺
  vector<int> e_child(N);

  {
    auto dfs = [&](auto &dfs, int v, int p) -> void {
      in[v] = tour.size();
      tour.push_back(v + 1);

      for (auto [w, edge_id] : G[v]) {
        if (w == p) continue;
        e_child[edge_id] = w;
        dfs(dfs, w, v);
      }

      out[v] = tour.size();
      tour.push_back(-(v + 1));
    };
    dfs(dfs, 0, -1);
  }
}
```
