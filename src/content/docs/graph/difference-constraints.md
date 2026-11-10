---
title: "牛ゲー（差分制約系）"
tags: [shortest-path, potential]
sidebar:
  order: 7
---
## 1. 概要

変数 $x_1, \dots, x_N$ に「2 変数の差の上限」の制約が $M$ 個ついた問題

$$
\begin{aligned}
\text{maximize} \quad & x_T - x_S \\
\text{subject to} \quad & x_{v_j} - x_{u_j} \le W_j \qquad (1 \le j \le M)
\end{aligned}
$$

を考える. これは、各制約を辺 $u_j \to v_j$（重み $W_j$）にしたグラフ $G$ 上の**最短路問題**に帰着できる.

| $G$ の状態 | 答え |
| --- | --- |
| 負閉路がある | 制約を満たす $x$ が存在しない |
| 負閉路がなく、$S$ から $T$ に到達できない | いくらでも大きくできる（$+\infty$） |
| 負閉路がなく、$S$ から $T$ に到達できる | $S \to T$ の最短路長 $\mathrm{dist}(S, T)$ |

## 2. 前提知識

- 単一始点最短路
  - [Dijkstra (単一始点最短路) - Luzhiled's Library](https://ei1333.github.io/library/graph/shortest-path/dijkstra.hpp.html)（辺の重みがすべて非負のとき. $O(M \log N)$）
  - [Bellman Ford (単一始点最短路) - Luzhiled's Library](https://ei1333.github.io/library/graph/shortest-path/bellman-ford.hpp.html)（負の辺があるとき. 負閉路も検出できる. $O(NM)$）
- 始点 $S$ からの最短距離 $d$ は、すべての辺 $u \to v$（重み $W$）について $d_v \le d_u + W$ を満たす（三角不等式）.

## 3. 差分制約と最短路

### 3.1. グラフへの変換

制約 $x_v - x_u \le W$ は $x_v \le x_u + W$ と書ける.
これは最短距離の三角不等式 $d_v \le d_u + W$ と同じ形なので、辺 $u \to v$（重み $W$）に対応させる.

### 3.2. 最短路長が上限になる

$S$ から $T$ へのパス $S = p_0 \to p_1 \to \dots \to p_k = T$ を 1 つとり、各辺の重みを $w_1, \dots, w_k$ とする.
各辺に対応する制約

$$
\begin{aligned}
x_{p_1} - x_{p_0} &\le w_1 \\
x_{p_2} - x_{p_1} &\le w_2 \\
&\ \ \vdots \\
x_{p_k} - x_{p_{k-1}} &\le w_k
\end{aligned}
$$

を全部足すと、途中の $x_{p_1}, \dots, x_{p_{k-1}}$ が打ち消し合って

$$
x_T - x_S \le w_1 + w_2 + \dots + w_k
$$

となる. どのパスについても成り立つので、$x_T - x_S \le \mathrm{dist}(S, T)$ である.

同じ議論を閉路に使うと、閉路 $C$ について $0 \le (C \text{ の重みの和})$ が得られる.
したがって**負閉路があると、制約を満たす $x$ は存在しない**.

### 3.3. 上限が達成できる

負閉路がないとする. 次の 2 つは、どちらもすべての制約を満たす.

- $d_v = \mathrm{dist}(S, v)$（$S$ から到達できない頂点は $+\infty$）. 三角不等式そのものである.
  $u$ から $v$ への辺があれば、$u$ に到達できるとき $v$ にも到達できるので、$+\infty$ を含めても破綻しない.
- $\varphi_v$: すべての頂点へ重み $0$ の辺を張った超頂点からの最短距離（負閉路がないので有限）.

2 つの解 $a, b$ がどちらも $a_v \le a_u + W$, $b_v \le b_u + W$ を満たすなら、$\min(a_v, b_v) \le \min(a_u, b_u) + W$ も成り立つ.
そこで定数 $C$ をとって

$$
x_v = \min(d_v, \ \varphi_v + C)
$$

とすると、これも制約をすべて満たす.

- **$T$ に到達できるとき**: $C$ を十分大きく（到達できるすべての $v$ で $\varphi_v + C \ge d_v$ と）とると、到達できる頂点では $x_v = d_v$ となる. 特に $x_T - x_S = d_T - d_S = \mathrm{dist}(S, T)$ で、3.2 の上限が達成される.
- **$T$ に到達できないとき**: $C$ を大きくすると $x_S = d_S = 0$ のまま、$x_T = \varphi_T + C$ はいくらでも大きくなる.

また、$W_j$ がすべて整数なら $d, \varphi$ も整数なので、**整数解**が得られる.

### 3.4. いろいろな制約の書き方

| 制約 | 辺 |
| --- | --- |
| $x_v - x_u \le W$ | $u \to v$（重み $W$） |
| $x_v - x_u \ge W$ | $v \to u$（重み $-W$）（$x_u - x_v \le -W$ と書き直す） |
| $x_v - x_u = W$ | $u \to v$（重み $W$）と $v \to u$（重み $-W$） |
| $x_v \le x_u$ | $u \to v$（重み $0$） |
| $x_v - x_u < W$（整数） | $u \to v$（重み $W - 1$） |
| $x_v \le c$, $x_v \ge c$（定数との比較） | 基準の変数 $x_0 = 0$ を追加し、$x_v - x_0 \le c$, $x_0 - x_v \le -c$ とする |

目的関数が最小化 $\min (x_T - x_S)$ のときは、$-\max (x_S - x_T)$ と書き直して $-\mathrm{dist}(T, S)$ を求める.

### 3.5. 解き方の選び方

- 辺の重みがすべて非負: Dijkstra 法で $\mathrm{dist}(S, T)$ を求める. 負閉路は起きない.
- 負の重みの辺がある: Bellman–Ford 法を使う.
  ただし、$S$ から到達できない負閉路も「解なし」の原因になるので、**解の存在まで判定したいときは超頂点から**（または全頂点の距離を $0$ で初期化して）負閉路を検出する.

## 4. 参考資料

- [牛ゲーが最短経路問題に帰着する理由をふんわりと理解する - Qiita](https://qiita.com/horiso/items/ca818df8ddbc5be58ec1)（最短経路問題を線形計画問題として書くと牛ゲーの形になること）
- [牛ゲーが最短経路問題で解けることの説明 - Zenn](https://zenn.dev/masutech/articles/compro-cowgame-theory)（牛ゲーが最短経路問題に帰着することの数理最適化の言葉による説明）
- [Dijkstra (単一始点最短路) - Luzhiled's Library](https://ei1333.github.io/library/graph/shortest-path/dijkstra.hpp.html)、[Bellman Ford (単一始点最短路) - Luzhiled's Library](https://ei1333.github.io/library/graph/shortest-path/bellman-ford.hpp.html)（最短路の実装）
