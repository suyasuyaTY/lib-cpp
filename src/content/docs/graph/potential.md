---
title: "ポテンシャル"
tags: [shortest-path, potential]
sidebar:
  order: 8
---
## Dijkstra法

負の重みを持つグラフでDijkstra法を行うための手法

:::note

始点$s$とした最短経路の数式表示

- $d_s = 0$
- 全ての辺$(i,j)$において、$d_j \le d_i + dist(i, j)$
- 以上が成り立つときの$d$の取れる最大値
:::

ある$p_i$という値を導入して、距離を$dist'(i,j) = dist(i,j) + p_i - p_j$としたグラフを考える。

このグラフ上で頂点$s$を始点とした最短距離を計算して、$d_i'$を求めたとすると次の条件が成り立つ

$$
\begin{aligned}    d_j' &\le d_i' + dist'(i,j) \\    d_j' &\le d_i' + dist(i,j) + p_i - p_j \\    d_j' + p_j & \le d_i' + p_i + dist(i,j) \end{aligned}
$$

$d_i = d'_i + p_i$とすると、最短距離の定義を満たしているように見える。

$d_s = p_s$となっていることに注意しポテンシャルの影響を取り除いた最短距離は、$ans_i = d'_i + p_i - p_s$と求められる。

$dist'(i,j) = dist(i,j) + p_i - p_j \ge 0$にしたいことを考えると、

$p_j \le p_i + dist(i,j)$となるので、最短距離をポテンシャルに使用すればいいことがわかる。
