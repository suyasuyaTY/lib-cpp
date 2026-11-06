---
title: "Cartesian Tree"
tags: [tree, monotonic-stack]
sidebar:
  order: 13
---
## 概要

数列$a_n$が与えられた時、区間$[0,n)$に対して、次の操作を再帰的に繰り返すことで得られる二分木を`Cartesian Tree`という

- 区間$[l,r)$が与えられた時、$i \in [l,r)$のうち$a_i$が最小の$i$（複数ある場合は$i$が最も小さい点）を$m$と置く
- 頂点$m$を根、区間$[l,m)$から得られる二分木を左の子、区間$[m+1,r)$から得られる二分木を右の子とした木を返す

## アルゴリズム

## 変数

- `g` ：木の子
- `p` ：ノード`i` の親
- `st` ：今まで作った `Cartesian Tree` の右端の道を持っている
    - 配列を左から右へ見ているので、新しい`i` は常に一番右に追加される
    - 木に追加するときに関係するのは、今ある木の「右端」だけ

```cpp
int N = (int)a.size();
vector<vector<int>> g(N);  // g: 木の子リスト
vector<int> p(N, -1)// p: ノード i の親,
vector<int> st;  // st: 今まで作った Cartesian Treeの右端の道
st.reserve(N);
```

## 追加処理

## 大きい値を処理するとき

```cpp
st = [1, 3]
a[1] = 2, a[3] = 3
```

ここに、`a[i] = 5` が来たとすると、右端より大きいので`i`を右端の子にすればいい

```cpp
if (!st.empty()) p[i] = st.back();  // 右端の要素を i の親にする
st.push_back(i);
```

## 小さい値を処理するとき

```cpp
index: 0 1 2 3
a    : 4 2 5 3

st = [1,3]
```

ここに、`i = 4, a[4] = 1` が来たとする。

今までで一番小さい要素なため、新しい根になる。そのため、`stack` から大きいものを全部`pop` する。

```cpp
while (!st.empty() && a[i] < a[st.back()]) {
  prv = st.back();
  st.pop_back();
}
```

この例では、最後に`pop` された`prv = 1` が`4` の左部分木になる。

```cpp
if (prv != -1) p[prv] = i;
```

この例では、`i` が根になるので追加しないが根にならない場合は`stack` に残った最後の要素の子になる。

```cpp
if (!st.empty()) p[i] = st.back();
```

## 実装

```cpp title="cartesian_tree.cpp"
// https://drken1215.hatenablog.com/entry/2023/10/19/025800
#include <stack>
#include <vector>

using namespace std;

// 最小 Cartesian Tree の構築(a[par] <= a[child])
// - g[v]: 頂点 v の子頂点
// - root: 木の根
//

// https://nyaannyaan.github.io/library/tree/cartesian-tree.hpp.html
// return value : pair<graph, root>
template <typename T>
pair<vector<vector<int>>, int> CartesianTree(vector<T>& a) {
  int N = (int)a.size();
  vector<vector<int>> g(N);
  vector<int> p(N, -1), st;
  st.reserve(N);
  for (int i = 0; i < N; i++) {
    int prv = -1;
    while (!st.empty() && a[i] < a[st.back()]) {
      prv = st.back();
      st.pop_back();
    }
    if (prv != -1) p[prv] = i;
    if (!st.empty()) p[i] = st.back();
    st.push_back(i);
  }
  int root = -1;
  for (int i = 0; i < N; i++) {
    if (p[i] != -1)
      g[p[i]].push_back(i);
    else
      root = i;
  }
  return make_pair(g, root);
}

// Cartesian Tree における頂点 v の部分木が対応する配列上の閉区間
template <typename T>
pair<vector<int>, vector<int>> CartesianTreeIntervals(vector<T>& a) {
  int N = (int)a.size();

  if (N == 0) {
    return {{}, {}};
  }

  auto [g, root] = CartesianTree(a);

  vector<int> L(N), R(N);

  auto dfs = [&](auto self, int v) -> void {
    L[v] = R[v] = v;

    for (int child : g[v]) {
      self(self, child);
      L[v] = min(L[v], L[child]);
      R[v] = max(R[v], R[child]);
    }
  };

  dfs(dfs, root);

  return {L, R};
}
```
