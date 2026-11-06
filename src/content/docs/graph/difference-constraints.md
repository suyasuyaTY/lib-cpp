---
title: "牛ゲー（最短経路問題）"
tags: [shortest-path, potential]
sidebar:
  order: 7
---
## 概要

$$
\begin{aligned}
\max x_T - x_S& \\
x_{v_j} - x_{u_j} &\le W_j \qquad (1 \le j \le M)
\end{aligned}
$$

この問題の下位は、$N$頂点$M$辺からなり、$j$番目の辺が$u_j \rightarrow v_j$に向かう重み$W_j$に有向辺であるようなグラフ$G$を考えると、$S \rightarrow T$最短路長に一致する。

## 証明

## 直感

$x_v - x_u \le W$という制約は、$x_v \le x_u + W$という風に書ける。

これは、最短経路でいうところの$dist[v] \le dist[u] + W$と同じ形である。

## なぜ最短経路が上限になるのか

$S \rightarrow T$へ$S \rightarrow a \rightarrow b \rightarrow T$のようなパスがあるとする。

各辺に対応する制約は次のようになり、

$$
\begin{aligned}
x_{a} - x_{S} &\le W_1 \\
x_{b} - x_{a} &\le W_2 \\
x_{T} - x_{b} &\le W_3 \\
\end{aligned}
$$

全部足すと、途中の$x_a, x_b$が消えて、

$$
\begin{aligned}
x_{T} - x_{S} &\le W_1 + W_2 + W_3 \\
\end{aligned}
$$

になる。

つまり、任意の$S \rightarrow T$パスについて、

$$
\begin{aligned}
x_{T} - x_{S} &\le \text{そのパスの長さ} \\
\end{aligned}
$$

が成り立つので、目的関数は最短路長を超えることはできない。
