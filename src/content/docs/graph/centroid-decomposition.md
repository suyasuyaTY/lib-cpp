---
title: "重心分解"
tags: [tree]
sidebar:
  order: 15
---
## 概要

### 重心
- 木からある頂点を削除すると、元の木は何個かの木に分解される。その部分木のサイズが元の木のサイズの半分以下になるような頂点。
- 必ず存在し、1個または2個存在する。

### 重心分解

1. 重心を見つける
2. 重心に関する処理を行う。
3. 重心を削除する
4. 分割された各部分木について同じ処理を再帰する

- 子ノードに進むたびに木の頂点数が半分以下になるため、分解の深さは $O(\log N)$ 
- 各頂点が出てくる回数は最大でも $O(\log N)$ なので、典型的な重心分解の計算量は $O(\log N)$ となる

## コード

### 1 段階の重心分解

```cpp
 int N;
vector<vector<int>> G(N);

vector<int> subtree_size(N);
vector<int> centroids;

auto dfs = [&](auto &dfs, int v, int p) -> void {
    subtree_size[v] = 1;
    bool is_centroid = true;
    for (int w : G[v]) {
        if (w == p) continue;
        dfs(dfs, w, v);
        if (subtree_size[w] > N / 2) is_centroid = false;
        subtree_size[v] += subtree_size[w];
    }
    if (N - subtree_size[v] > N / 2) is_centroid = false;
    if (is_centroid) centroids.push_back(v);
};
dfs(dfs, 0, -1);
```

## 再帰的な重心分解

```cpp
int N;
vector<vector<int>> G(N);

vector<int> subtree_size(N);
vector<bool> removed(N);

auto calc_size = [&](auto &calc_size, int v, int p) -> int {
    subtree_size[v] = 1;

    for (int w : G[v]) {
        if (w == p || removed[w]) continue;

        subtree_size[v] += calc_size(calc_size, w, v);
    }

    return subtree_size[v];
};

// 親側の部分木: tree_size - subtree_size[v]
// 再帰に入っていることから、tree_size - subtree_size[v] <= tree_size
auto find_centroid = [&](auto &find_centroid, int v, int p, int tree_size) -> int {
    for (int w : G[v]) {
        if (w == p || removed[w]) continue;

        if (subtree_size[w] > tree_size / 2) {
        return find_centroid(find_centroid, w, v, tree_size);
        }
    }

    return v;
};

auto decompose = [&](auto &decompose, int v) -> void {
    int tree_size = calc_size(calc_size, v, -1);

    int centroid = find_centroid(find_centroid, v, -1, tree_size);

    // centroid に関する処理
    // ...

    removed[centroid] = true;

    for (int w : G[centroid]) {
        if (removed[w]) continue;

        decompose(decompose, w);
    }
};

decompose(decompose, 0);
```

## 問題例

### [ABC359-G Sum of Tree Distance](https://atcoder.jp/contests/abc359/tasks/abc359_g)

木上で、頂点に種類・値があり、「同じ種類どうし」にパスや部分木の情報を集計したいが、種類が多くてそのままでは無理

| 手法    | 多すぎて困るもの   | 分割するもの     | 分割後に簡単になること                             |
| ----- | ---------- | ---------- | --------------------------------------- |
| 重心分解  | 頂点ペア・パス    | 木そのもの      | 重心を通るパスだけに限定して、`u-c` と `c-v` に分解して考えられる |
| マージテク | 種類ごとの部分木情報 | 部分木が持つ種類集合 | 実際に存在する種類だけを持ち、小さい集合を大きい集合へまとめられる       |
| 平方分割  | 種類数        | 種類の出現回数    | 頻出種類は種類数が少なく、希少種類は各種類の頂点数が少ないことを利用できる   |


解き方の考え方
1. 任意の $(u,v)$ を直接扱うのが難しい
2. 重心 $c$ を通る $(u,v)$ だけに限定する
3. $path(u,v) = path(u,c) + path(c,v)$ と分解して集計
4. $c$ を通らないペアは各部分木の再帰に任せる
