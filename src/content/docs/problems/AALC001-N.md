---
title: AALC001 N - 九九
problem: https://atcoder.jp/contests/aalc001/tasks/aalc001_n
uses: [data-structure/segment-tree]
tags: [offline]
---
[問題](https://atcoder.jp/contests/aalc001/tasks/aalc001_n)

## 問題

$N \times N$ のグリッドがあり、マス $(i, j)$ $(1 \le i, j \le N)$ の値ははじめ $i \cdot j$ である.
$k = 1, \dots, Q$ について、$a_k \le i \le c_k$、$b_k \le j \le d_k$ を満たすマス $(i, j)$ の値をすべて $0$ にする.
すべての操作の後の全マスの値の総和を $998244353$ で割った余りを求めよ.
制約は $1 \le N, Q \le 2 \times 10^5$.

## 1. 条件の言いかえ

マス $(i, j)$ を覆う長方形の個数を $C_{i,j}$ とすると、操作後の値は $C_{i,j} = 0$ なら $i \cdot j$、そうでなければ $0$ である. よって答えは

$$
\sum_{i=1}^{N} i \cdot \sum_{j:\ C_{i,j} = 0} j
$$

行 $i$ を $1$ から順に見ていくと、長方形 $k$ は行 $a_k$ で列 $[b_k, d_k]$ の $C$ に $+1$ され、行 $c_k + 1$ で $-1$ される.

> 長さ $N$ の非負整数列 $C$（各位置 $j$ に重み $j$）に対して、区間加算をしながら「$C_j = 0$ となる $j$ の重みの和」を $N$ 回求める.

## 2. 最小値を取る要素の重みの総和への帰着

$C_j \ge 0$ なので、$C_j = 0$ となる位置があるとき、それは $C$ の最小値を取る位置そのものである.
したがって、[セグメント木](../../data-structure/segment-tree/) の 3.2 節「最小値を取る要素の重みの総和」（`weighted_min`）で、区間加算をしながら全体の $(m, w)$ を求め、$m = 0$ なら $w$、そうでなければ $0$ が $\sum_{j:\ C_{i,j} = 0} j$ になる.

## 3. 行ごとの走査

- 初期値は $(C_j, W_j) = (0, j)$.
- 行 $i$ では、$c_k + 1 = i$ の長方形を $-1$、$a_k = i$ の長方形を $+1$ してから `all_prod()` を見る.

区間加算は全部で $2Q$ 回、`all_prod` は $N$ 回なので、全体で $O(N + Q \log N)$ である.
重みの和は最大 $N(N+1)/2 \approx 2 \times 10^{10}$ なので `long long` で持ち、行ごとに $i$ を掛けて $998244353$ で割る.
