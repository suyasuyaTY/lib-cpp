---
title: "スパーステーブル"
tags: [range-query, static]
sidebar:
  order: 6
---
## 概要

- 静的な配列に対するべき等な演算に対する区間クエリを高速に処理するデータ構造
- 区間長が$2^k$の時の情報から区間長が$2^{k+1}$の時の情報を構成する。

## 構築・クエリ処理

長さが2のべき乗であるようなすべての区間$[L,R)$における区間クエリを計算し、配列に格納する

## 構築

1. $2^K \le N$ を満たす最大の非負整数$K$を取る
2. $k=0,1,\dots,K$および$0 \le i \le N - 2^k$ を満たす非負整数の組$(k,i)$に対して、$[i, i+ 2^k)$における区間クエリを計算
    1. `dp[0][i] = f(A[i])` と初期化
    2. `dp[k+1][i] = f(dp[k][i], dp[k][i + 2^k])` と2つの区間に分割

## クエリ処理

区間$[L,R)$におけるクエリの求め方

1. $k = \lfloor \log_2(R-L) \rfloor$、つまり$2^k \le R - L < 2^{k+1}$を満たす非負整数を求める
2. $[L, L +2^k), [R - 2^k, R)$の和集合になるので、この二つをまとめる

[Library Checker](https://judge.yosupo.jp/submission/349017)

```cpp
struct SparseTable {
  int N, K;
  vector<vector<int>> table;

  SparseTable(const vc<int>& A) {
    N = A.size();
    K = 0;
    while (1 << (K + 1) <= N) ++K;

    table.resize(K + 1);
    table[0] = A;
    for (int k = 0; k < K; ++k) {
      int m = N - (1 << (k + 1)) + 1;
      table[k + 1].resize(m);
      for (int i = 0; i < m; ++i) {
        table[k + 1][i] = min(table[k][i], table[k][i + (1 << k)]);
      }
    }
  }

  // min of half interval [L,R)
  int query(int L, int R) {
    int k = std::bit_width(n) - 1;
    return min(table[k][L], table[k][R - (1 << k)]);
  }
};
```
