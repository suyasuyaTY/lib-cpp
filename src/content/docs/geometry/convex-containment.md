---
title: "点が凸図形に包含される条件"
tags: [convexity]
sidebar:
  order: 3
---
反時計回りで点の番号$1,2,3,\dots,N$とつける。$N+1 = 1$とする。

点$(a,b)$が図形に含まれる条件

> すべての$i=1,2,\dots,N$について点$(x_{i}, y_{i})$から点$(x_{i+1},y_{i+1})$へ向かう有向線分の左側にある領域（または境界）に含まれる
> 

数式にすると、次のようになる。

$$
\begin{aligned}    \begin{bmatrix}        x_{i+1} - x_{i} \\        y_{i+1} - y_{i}    \end{bmatrix}    \times    \begin{bmatrix}        a - x_{i} \\        b - y_{i}    \end{bmatrix}    \ge 0\end{aligned}
$$

[https://atcoder.jp/contests/abc251/editorial/3961](https://atcoder.jp/contests/abc251/editorial/3961)
