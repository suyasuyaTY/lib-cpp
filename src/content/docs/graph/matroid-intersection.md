---
title: "マトロイド交差"
tags: [matroid]
sidebar:
  order: 10
---
## 1. 概要

同じ台集合 $E$ の上に 2 つのマトロイド $M_1 = (E, \mathcal{I}_1)$、$M_2 = (E, \mathcal{I}_2)$ があるとき、両方の制約を同時に満たす集合（**共通独立集合**）$S \in \mathcal{I}_1 \cap \mathcal{I}_2$ の最大サイズを求める問題.

共通独立集合族 $\mathcal{I}_1 \cap \mathcal{I}_2$ は一般にはマトロイドにならないので、単純な貪欲法は使えない.
それでも、最大サイズや重み最大の共通独立集合は多項式時間で求められる.

例: 二部マッチング

辺集合を $E$、左側の頂点集合を $L$、右側の頂点集合を $R$ とする.
辺集合 $S \subseteq E$ がマッチングであるとは、各頂点に接続する $S$ の辺が高々 1 本であることである.
これを左側と右側に分けると、2 つの分割マトロイドができる.

| マトロイド | グループ | 上限 | 意味 |
| --- | --- | --- | --- |
| $M_L$ | 頂点 $u \in L$ に接続する辺の集合 | 1 | 左側の各頂点は高々 1 回使う |
| $M_R$ | 頂点 $v \in R$ に接続する辺の集合 | 1 | 右側の各頂点は高々 1 回使う |

$S$ がマッチング $\iff$ $S$ が $M_L$ でも $M_R$ でも独立、なので

$$
\boxed{
\text{最大二部マッチング}
=
\text{2つの分割マトロイドの最大共通独立集合}
}
$$

という関係が得られる.

## 2. 前提知識

- [マトロイド（基礎）](../../graph/matroid/)
- 行列の rank、行列式、[掃き出し法](../../linear-algebra/gaussian-elimination/)
- [Schwartz–Zippel の補題](https://info.atcoder.jp/entry/algorithm_lectures/polynomial_over_Fp)

## 3. 共通独立集合の最大サイズの求め方

2 つのマトロイドがどちらも同じ体 $\mathbb{F}$ 上の線形マトロイドとして表せるときは、行列の rank 1 回で最大サイズが求まる.
基礎 7.4 節より、一様・分割・グラフィックマトロイドはどれも線形マトロイドに変換できる.

$M_1$ を $m_1 \times n$ 行列 $A$ の列、$M_2$ を $m_2 \times n$ 行列 $B$ の列で表す（$n = |E|$）.
$A$ の $j$ 列目と $B$ の $j$ 列目が、どちらも要素 $j$ に対応する.

### 3.1. 共通独立集合になる条件

同じ列番号の集合 $S$ を選んだときに、**両方の行列で線形独立**でなければならない.

$$
S \in \mathcal{I}_1 \cap \mathcal{I}_2
\iff
A[\ast, S] \text{ と } B[\ast, S] \text{ の列がどちらも線形独立}
$$

### 3.2. Cauchy–Binet の公式

<a id="thm-3-1"></a>

:::note[定理 3.1（Cauchy–Binet）]
$P$ を $k \times n$ 行列、$Q$ を $n \times k$ 行列とすると

$$
\det(PQ) = \sum_{S \subseteq \lbrace 1, \dots, n \rbrace, \ |S| = k} \det P[\ast, S] \cdot \det Q[S, \ast]
$$
:::

<details>
<summary>証明</summary>

$P$ の $j$ 列目を $p_j$ と書く. $PQ$ の $i$ 列目は

$$
(PQ)[\ast, i] = \sum_{j=1}^{n} Q_{ji} \, p_j
$$

である. 行列式は各列について線形（多重線形性）なので、$k$ 個の列それぞれを展開すると

$$
\begin{align*}
\det(PQ) &= 
\det\bigl(\sum_{j=1}^{n} Q_{j1} p_{j}, \sum_{j=1}^{n} Q_{j2} p_{j}, \dots, \sum_{j=1}^{n} Q_{jk} p_{j}\bigr) \\
&= \sum_{j_1, \dots, j_k \in \lbrace 1, \dots, n \rbrace} Q_{j_1 1} Q_{j_2 2} \cdots Q_{j_k k} \cdot \det\bigl(p_{j_1}, p_{j_2}, \dots, p_{j_k}\bigr) \\
\end{align*}
$$

となる.

残った項を、集合 $S = \lbrace j_1, \dots, j_k \rbrace$ ごとにまとめる.
$S = \lbrace s_1 < s_2 < \dots < s_k \rbrace$ とすると、$(j_1, \dots, j_k)$ はある置換 $\sigma$ によって $j_i = s_{\sigma(i)}$ と書ける.
列の並べ替えで行列式は $\mathrm{sgn}(\sigma)$ 倍になるので

$$
\det\bigl(p_{s_{\sigma(1)}}, \dots, p_{s_{\sigma(k)}}\bigr) = \mathrm{sgn}(\sigma) \det P[\ast, S]
$$

である. したがって

$$
\det(PQ)
= \sum_{|S| = k} \det P[\ast, S] \cdot \sum_{\sigma} \mathrm{sgn}(\sigma) \prod_{i=1}^{k} Q_{s_{\sigma(i)}, i}
$$

となる. 内側の和は、行列式の定義（置換による展開）より $k \times k$ 行列 $Q[S, \ast]$ の行列式である（$\det$ は転置で不変なので、行と列のどちらで展開してもよい）. $\square$

</details>

### 3.3. 最大サイズの公式

各要素 $j$ に不定元 $x_j$ を用意し、$X = \mathrm{diag}(x_1, \dots, x_n)$ とする.

<a id="thm-3-2"></a>

:::note[定理 3.2]
有理関数体 $\mathbb{F}(x_1, \dots, x_n)$ 上で

$$
\mathrm{rank}(A X B^\top) = \max \lbrace |S| : S \in \mathcal{I}_1 \cap \mathcal{I}_2 \rbrace
$$
:::

$A X B^\top$ は $m_1 \times m_2$ 行列で、$(i, i')$ 成分は $\sum_j A_{ij} B_{i'j} x_j$ である.

<details>
<summary>証明</summary>

$\mathrm{rank}(A X B^\top) \geq k$ $\iff$ ある $k \times k$ 小行列式が $0$ でない、である.

行 $I$、列 $J$（$|I| = |J| = k$）の小行列は $A[I, \ast] \, X \, B[J, \ast]^\top$ である.
[定理 3.1](#thm-3-1)（Cauchy–Binet の公式）を $P = A[I, \ast]$、$Q = X B[J, \ast]^\top$ に使うと、$Q[S, \ast] = X[S, S] \, B[J, S]^\top$ なので

$$
\det\bigl(A[I, \ast] \, X \, B[J, \ast]^\top\bigr)
= \sum_{|S| = k} \det A[I, S] \cdot \det B[J, S] \cdot \prod_{j \in S} x_j
$$

となる.
$S$ が異なれば単項式 $\prod_{j \in S} x_j$ も異なるので、項どうしが打ち消し合うことはない.
よってこの小行列式が $0$ でない $\iff$ ある $|S| = k$ で $\det A[I, S] \neq 0$ かつ $\det B[J, S] \neq 0$ である.

$I, J$ も動かすと、3.1 節より

$$
\mathrm{rank}(A X B^\top) \geq k
\iff
\text{要素数 } k \text{ の共通独立集合 } S \text{ が存在する}
$$

が成り立つ. $\square$

</details>

二部マッチングの場合、$A$ は「辺 $j$ の左端点の行だけが $1$」、$B$ は「辺 $j$ の右端点の行だけが $1$」の行列であり、$A X B^\top$ の $(u, v)$ 成分は辺 $(u, v)$ の変数 $x_{uv}$ になる.
これは **Edmonds 行列**と呼ばれ、「最大マッチングのサイズ = Edmonds 行列の rank」という有名な事実が得られる.

### 3.4. 乱択による計算

不定元のままでは rank を計算できないので、$x_j$ に $\mathbb{F}_p$ の**ランダムな値**を代入して rank を計算する.
[Schwartz–Zippel の補題](https://info.atcoder.jp/entry/algorithm_lectures/polynomial_over_Fp)より、$p$ が十分大きければ高確率で正しい rank が得られる.

## 4. 参考資料

- [行列式とrankの関係](https://manabitimes.jp/math/1188)
- [Matroid intersection - Wikipedia](https://en.wikipedia.org/wiki/Matroid_intersection)（問題の定義と二部マッチングとの関係）
- [Cauchy–Binet formula - Wikipedia](https://en.wikipedia.org/wiki/Cauchy%E2%80%93Binet_formula)（定理 3.1）
- [Edmonds matrix - Wikipedia](https://en.wikipedia.org/wiki/Edmonds_matrix)（最大マッチングと Edmonds 行列の rank）
- [Cheung–Lau–Leung, *Algebraic Algorithms for Linear Matroid Parity Problems*](https://cs.uwaterloo.ca/~lapchi/papers/parity.pdf)（線形マトロイド交差の行列公式）
