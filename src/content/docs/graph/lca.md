---
title: "LCA（最小共通祖先）"
tags: [tree]
sidebar:
  order: 13
---
Euler Tour と Sparse Table から最小共通祖先を求める。`LCA(v_tour, depth_tour, v_in)`, `query(u, v)`

## 実装

```cpp title="LCA.cpp"
#include <bits/stdc++.h>

using namespace std;

struct LCA {
  int n;
  vector<int> log_table;
  vector<vector<int>> st;  // v_tour の index を持つ
  const vector<int>& v_tour;
  const vector<int>& depth_tour;
  const vector<int>& v_in;

  LCA(const vector<int>& v_tour,
      const vector<int>& depth_tour,
      const vector<int>& v_in)
      : v_tour(v_tour), depth_tour(depth_tour), v_in(v_in) {
    n = v_tour.size();

    log_table.assign(n + 1, 0);
    for (int i = 2; i <= n; i++) {
      log_table[i] = log_table[i / 2] + 1;
    }

    int K = log_table[n] + 1;
    st.assign(K, vector<int>(n));

    for (int i = 0; i < n; i++) {
      st[0][i] = i;
    }

    for (int k = 1; k < K; k++) {
      for (int i = 0; i + (1 << k) <= n; i++) {
        int a = st[k - 1][i];
        int b = st[k - 1][i + (1 << (k - 1))];

        if (depth_tour[a] <= depth_tour[b]) {
          st[k][i] = a;
        } else {
          st[k][i] = b;
        }
      }
    }
  }

  int query(int u, int v) {
    int l = v_in[u];
    int r = v_in[v];

    if (l > r) swap(l, r);

    int len = r - l + 1;
    int k = log_table[len];

    int a = st[k][l];
    int b = st[k][r - (1 << k) + 1];

    if (depth_tour[a] <= depth_tour[b]) {
      return v_tour[a];
    } else {
      return v_tour[b];
    }
  }
};
```
