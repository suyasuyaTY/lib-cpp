---
title: "Functional Graph"
tags: [doubling]
sidebar:
  order: 3
---
Functional Graph をサイクルまたは終端を根とする逆向きグラフへ分解する。`Functional_Graph::roots`, `G`

## 実装

```cpp title="functional_graph.cpp"
#include <bits/stdc++.h>

using namespace std;

struct Functional_Graph {
 private:
  int N;          // 頂点数
  vector<int> f;  // 入力, -1の場合行き先なし

  void build() {
    G.assign(N, {});
    roots.clear();

    for (int v = 0; v < N; v++) {
      if (f[v] != -1) G[f[v]].push_back(v);
    }

    vector<int> state(N, -1);  // -1: 未訪問, 0: 今回の探索パス上にある, 1:処理済み
    for (int sv = 0; sv < N; sv++) {
      if (state[sv] != -1) continue;

      vector<int> path;
      int v = sv;

      while (true) {
        if (v == -1) {
          if (!path.empty()) {
            roots.push_back({{path.back()}, false});
          }
          break;
        }

        if (state[v] == -1) {
          state[v] = 0;
          path.push_back(v);
          v = f[v];
          continue;
        }

        if (state[v] == 0) {
          vector<int> cycle;
          bool in_cycle = false;
          for (int u : path) {
            if (u == v) in_cycle = true;
            if (in_cycle) cycle.push_back(u);
          }
          roots.push_back({cycle, true});
          break;
        }

        if (state[v] == 1) {
          break;
        }
      }

      for (int u : path) state[u] = 1;
    }
  }

 public:
  // functional_graphの向きを逆にした時に、根となるグループ
  struct Root {
    vector<int> V;
    bool cycle;  // 根がサイクルになっていない場合はfalse
  };

  vector<Root> roots;     // 根
  vector<vector<int>> G;  // functional_graphの向きを逆にした辺

  Functional_Graph(const vector<int> &f) : N(ssize(f)), f(f) { build(); }
};
```
