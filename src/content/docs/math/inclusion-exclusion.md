---
title: "包除原理"
tags: [counting]
sidebar:
  order: 14
---
## **包除原理**

## 定義

集合$S_1, S_2, \dots, S_N$、$[N] = \{1, 2, \dots, N\}$としたとき、

$$
\left|\bigcup_{i=1}^N S_i \right| = \sum_{i=1}^{N} (-1)^{i-1} \sum_{J \subset |N|, |J| = i} \left|\bigcap_{j \in J} S_j \right|
$$

## 証明

$$
\sum_{i=0}^{n} \binom{n}{i} (-1)^{i} = (1 - 1)^{n} = 0 \qquad \sum_{i=1}^n \binom{n}{i} (-1)^{i - 1} = 1
$$

- $x$：$\bigcup_{i=1}^N S_i$の要素、$k$個の集合に属している
- $T_i$：$i$個の集合の共通部分
    - $x \in T_i$を満たす$T_i$の個数は$\binom{k}{i}$個
    - 二項定理の式と定義の式を見比べると、$x$はちょうど1回だけ数えられている

## よく使う変形

$n$個の条件$S_1,S_2,\dots,S_n$があり、$\left|\bigcap_{i=1}^{n} S_i \right|$を求めたい。

$$
\begin{aligned}
\left|\bigcap_{i=1}^{n} S_i \right|
&= |U| - \left| \overline{\bigcap_{i=1}^{n} S_i} \right| \\
&= |U| - \left| \bigcup_{i=1}^{n} \overline{S_i} \right| \\
&= |U|
   + \sum_{k=1}^{n} (-1)^k
     \sum_{\substack{J \subseteq [n] \\ |J| = k}}
     \left| \bigcap_{j \in J} \overline{S_j} \right| \\
&= \sum_{k=0}^{n} (-1)^k
   \sum_{\substack{J \subseteq [n] \\ |J| = k}}
   \left| \bigcap_{j \in J} \overline{S_j} \right|.
\end{aligned}
$$

## 一般化**包除原理**

## 定義

- 数列$A$：$A_0 = 0$を満たす数列
- 数列$B$：$B_0 = 0$を満たす数列
- $C_k$：$k$個の集合に属する$x (\in \bigcup_{i=1}^N S_i)$の個数

$$
\sum_{k = 1}^{N} C_k B_k = \sum_{r = 1}^{N} A_r \sum_{J \subset |N|, |J| = i} \left|\bigcap_{j \in J} S_j \right|
$$
