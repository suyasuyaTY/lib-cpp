---
title: ABC482 G - Degree Harmony 2
problem: https://atcoder.jp/contests/abc482/tasks/abc482_g
submission: https://atcoder.jp/contests/abc482/submissions/80598371
uses: [graph/matroid-parity, graph/matroid, linear-algebra/gaussian-elimination]
tags: [randomized]
---
[問題](https://atcoder.jp/contests/abc482/tasks/abc482_g) / [提出コード](https://atcoder.jp/contests/abc482/submissions/80598371)

## 問題

$N$ 頂点 $M$ 辺の単純無向グラフ $G = (V, F)$ と正整数列 $A$ が与えられる.
辺集合 $S \subseteq F$ を選び、すべての頂点 $i$ で $\deg_S(i) \leq A_i$ を満たすようにするとき、$|S|$ の最大値を求めよ.
$K = \sum_i A_i$ とおくと、制約は $N \leq 500$、$K \leq 500$.

## 1. 台集合と分割マトロイド

台集合の要素を「辺と、その一方の端点」の組とする.

$$
E = \lbrace (e, i) : e \in F,\ i \text{ は } e \text{ の端点} \rbrace,
\qquad |E| = 2M
$$

要素 $(e, i)$ は「辺 $e$ を選ぶと、頂点 $i$ の次数を 1 消費する」ことを表す.
辺 $e = \lbrace u, v \rbrace$ に対し

$$
P_e = \lbrace (e, u), (e, v) \rbrace
$$

を 1 ペアとする. これで、辺を選ぶこととペアを選ぶことが 1 対 1 に対応する.
同じ頂点 $i$ に接続する辺でも、辺が異なれば $(e, i)$ は別の要素である.

頂点 $i$ ごとに $E_i = \lbrace (e, i) : e \in F,\ i \in e \rbrace$ と分け、独立集合を

$$
\mathcal{I} = \lbrace X \subseteq E : |X \cap E_i| \leq A_i \quad (i = 1, \dots, N) \rbrace
$$

と定める. これは [分割マトロイド](../../graph/matroid/)そのものである.
辺集合 $S$ が使う要素を $X_S = \bigcup_{e \in S} P_e$ とすると、$|X_S \cap E_i| = \deg_S(i)$ なので

$$
\boxed{
X_S \in \mathcal{I}
\iff
\deg_S(i) \leq A_i \quad (i = 1, \dots, N)
}
$$

となる. よって求める答えは、この分割マトロイド上のパリティ問題の最大ペア数である.

## 2. 線形表現

[マトロイドパリティ 3 章](../../graph/matroid-parity/) の公式を使うため、この分割マトロイドを [マトロイド（基礎）7.4 節](../../graph/matroid/) の方法で列ベクトルに表す.
$K$ 個の座標を、頂点 $i$ ごとに $A_i$ 個のブロック $B_i$ に分ける.
十分大きな奇素数 $p > M$ を選び、$\mathbb{F}_p$ 上で計算する.
各辺 $e$ に相異なる値 $t_e$ を割り当てる（辺番号 $1, \dots, M$ でよい）.

要素 $(e, i)$ に対応するベクトル $\mathbf{c}_{e,i} \in \mathbb{F}_p^K$ は、$B_i$ の部分だけを

$$
\mathbf{c}_{e,i}[B_i] =
\begin{pmatrix}
1 \\ t_e \\ t_e^2 \\ \vdots \\ t_e^{A_i-1}
\end{pmatrix}
$$

とし、他のブロックはすべて $0$ とする.
マトロイド（基礎）7.4 節の分割マトロイドの表現そのものなので、これで $\deg_S(i) \leq A_i$ が線形独立性に対応する.
$\mathbf{c}_{e,i}[B_i]$ は Vandermonde の列でなく乱数ベクトルにしてもよい.

$A_i = 1$ がすべての頂点で成り立つ場合、$\mathbf{c}_{e,i} = \mathbf{e}_i$ となり、[マトロイドパリティ 1 章](../../graph/matroid-parity/) の通常のマッチングの表現に戻る.

## 3. 交代行列の rank で答えを求める

辺 $e = \lbrace u, v \rbrace$（$u < v$）のペアを
$\mathbf{a}_e = \mathbf{c}_{e,u}$、$\mathbf{b}_e = \mathbf{c}_{e,v}$ として、$K \times K$ の交代行列

$$
T(x) = \sum_{e \in F} x_e
\bigl(\mathbf{a}_e \mathbf{b}_e^\top - \mathbf{b}_e \mathbf{a}_e^\top\bigr)
$$

を作り、各 $x_e$ に $\mathbb{F}_p$ の乱数を代入して $\mathrm{rank}\, T / 2$ を答えとする（[マトロイドパリティ 定理 3.4](../../graph/matroid-parity/#thm-3-4)）.
台集合の要素数は $2M$ だが、rank を計算する行列の大きさは $K \times K$ でよい.

## 4. 行列の構築と計算量

頂点 $i$ のブロックの開始位置を $s_i = \sum_{j < i} A_j$ とし、行・列の添字は $0$ 始まりとする.
辺 $e = \lbrace u, v \rbrace$（$u < v$）が寄与するのは、ブロック $(B_u, B_v)$ とその転置だけである.
$0 \leq a < A_u$、$0 \leq b < A_v$ に対し

$$
\begin{aligned}
T_{s_u+a,\,s_v+b} &\mathrel{+}= r_e \, t_e^a t_e^b, \\
T_{s_v+b,\,s_u+a} &\mathrel{-}= r_e \, t_e^a t_e^b
\end{aligned}
$$

と更新すればよい. 辺ごとに $t_e$ の累乗を前計算すれば、1 辺あたり $O(A_u A_v)$ で構築できる.
グラフは単純なので

$$
\sum_{\lbrace u,v \rbrace \in F} A_u A_v
\leq \sum_{u < v} A_u A_v
= \frac{K^2 - \sum_i A_i^2}{2}
= O(K^2)
$$

である. したがって行列構築は $O(K^2)$、ガウス消去は $O(K^3)$ で、全体の計算量は **$O(K^3)$**、必要な領域は **$O(K^2)$** となる（体上の演算を $O(1)$ とする）.
全テストケースの $K^3$ の総和に対する制約に対応している.
