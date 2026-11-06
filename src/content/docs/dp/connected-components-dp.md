---
title: "連結成分を分解するDP"
tags: [bit-dp, counting]
sidebar:
  order: 6
---
## 概要

全体として数えやすいもの$f(S)$から、単純に計算するのが難しいもの$g(S)$を取り出すbitDP

## 具体例

[Editorial - AtCoder Beginner Contest 213](https://atcoder.jp/contests/abc213/editorial/2392)

- $f(S)$：$S$上の全部の構造の個数。
- $g(S)$：$S$上の「連結な構造」「1つの成分になる構造」の個数。

グラフは連結成分に一意に分解できるので、

$$
f(S) = \sum_{\{S_1,\dots,S_k\}} \prod_{i=1}^{k} g(S_i)
$$

という形になる。

ここで、$k=1$の部分を取り出すと、

$$
g(S) = f(S) - \sum_{\{S_1,\dots,S_k\}, k > 1} \prod_{i=1}^{k} g(S_i)
$$

のようになる。

このまま、集合分割を全部列挙すると重いので、$S$の中の代表元$a$を1つ固定して、

$$
g(S) = f(S) - \sum_{\substack{T \subsetneq S \\ a \in T}} g(T) f(S \setminus T)
$$

の形にすると、全体で$O(3^N)$になるというテクニック。

## コード

1. 代表元（最下位bit）を明示的に指定
    
    ```cpp
    for (int bit = 1; bit < (1 << N); bit++) {
        int a = bit & -bit; // S の中の代表元、最下位bit
    
        g[bit] = f[bit];
    
        for (int sub = (bit - 1) & bit; sub > 0; sub = (sub - 1) & bit) {
            if ((sub & a) == 0) continue; // 代表元 a を含む sub だけ見る
    
            g[sub] -= g[sub] * f[bit ^ sub];
        }
    }
    ```
    
2. 代表元（最上位bit）を暗黙的に採用
    
    ```cpp
    for (int bit = 1; bit < (1 << N); bit++) {
          g[bit] = f[bit];
          for (int sub = (bit - 1) & bit; sub > (bit - sub); sub = (sub - 1) & bit) {
              g[bit] -= g[sub] * f[bit - sub];
          }
      }
    ```
