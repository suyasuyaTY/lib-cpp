---
title: "マトロイドパリティ"
tags: [matroid]
sidebar:
  order: 11
---
## 1. 概要

マトロイド $M = (E, \mathcal{I})$ の台集合 $E$ が、互いに素な 2 要素の組（**ペア**）$P_1, \dots, P_m$ に分けられているとき、**ペア単位で**要素を選んで独立集合を作る問題.

$$
\max \Bigl\lbrace |S| : S \subseteq \lbrace 1, \dots, m \rbrace, \ \bigcup_{i \in S} P_i \in \mathcal{I} \Bigr\rbrace
$$

を求める. ペアの片方だけを選ぶことはできない.
この最大値を $\nu$ と書く.

一般のマトロイドでは難しいが、$M$ が線形マトロイドのとき（**線形マトロイドパリティ**）は、マトロイド交差と同様に行列の rank 1 回で $\nu$ が求まる.
以下では線形マトロイドの場合だけを扱う.

例: 一般グラフのマッチング

$n$ 頂点のグラフ $G = (V, E)$ を考える.
頂点 $v$ に $n$ 次元の単位ベクトル $\mathbf{e}_v$ を割り当て、辺 $\lbrace u, v \rbrace$ をベクトルのペア $(\mathbf{e}_u, \mathbf{e}_v)$ に対応させる.

辺集合 $S$ を選んだとき、出てくるベクトルは $S$ の辺の端点の単位ベクトルである.
2 本の辺が端点を共有すると同じ単位ベクトルが 2 回現れて従属になり、共有しなければすべて異なる単位ベクトルなので独立になる.

$$
\boxed{
S \text{ がマッチング}
\iff
\lbrace \mathbf{e}_u, \mathbf{e}_v \mid \lbrace u, v \rbrace \in S \rbrace \text{ が線形独立}
}
$$

よって最大マッチングは線形マトロイドパリティの特殊ケースである.

## 2. 前提知識

- [マトロイド（基礎）](../../graph/matroid/)
- [マトロイド交差](../../graph/matroid-intersection/)（Cauchy–Binet の公式、不定元を使う rank の公式）
- 行列の rank、行列式
- [Schwartz–Zippel の補題](https://info.atcoder.jp/entry/algorithm_lectures/polynomial_over_Fp)（乱択の正当性）

## 3. 最大サイズの求め方

### 3.1. ペア $(\mathbf{a}_i, \mathbf{b}_i)$ の表し方

線形マトロイドの要素は $\mathbb{F}^r$ の列ベクトルである（基礎 7 章）.
台集合 $E$ は $2m$ 本の列ベクトルからなり、ペア $P_i$ はその中の 2 本である.
この 2 本を $\mathbf{a}_i, \mathbf{b}_i \in \mathbb{F}^r$ と書く.

$$
C = (\mathbf{a}_1 \ \mathbf{b}_1 \ \mathbf{a}_2 \ \mathbf{b}_2 \ \cdots \ \mathbf{a}_m \ \mathbf{b}_m) \in \mathbb{F}^{r \times 2m}
$$

と並べ、$S \subseteq \lbrace 1, \dots, m \rbrace$ に対して $C_S$ を「$i \in S$ の列 $\mathbf{a}_i, \mathbf{b}_i$ だけを $i$ の昇順に（$\mathbf{a}_i$ を先に）並べた $r \times 2|S|$ 行列」とする.

| 問題 | $\mathbf{a}_i$ | $\mathbf{b}_i$ |
| --- | --- | --- |
| 一般グラフのマッチング（1 章） | 辺 $i$ の一方の端点の単位ベクトル $\mathbf{e}_u$ | もう一方の端点の単位ベクトル $\mathbf{e}_v$ |
| 線形マトロイド交差（4.1 節） | $\binom{A \text{ の } i \text{ 列目}}{0}$ | $\binom{0}{B \text{ の } i \text{ 列目}}$ |

### 3.2. ペアの集合が選べる条件

$|S| = k$ のペアを選べる条件は、$C_S$ の $2k$ 本の列が線形独立であることである.
列が線形独立 $\iff$ ある $2k$ 行を取り出した正方行列が正則、なので

$$
S \text{ が選べる}
\iff
\exists I \subseteq \lbrace 1, \dots, r \rbrace, \ |I| = 2k, \ \det C_S[I, \ast] \neq 0
$$

となる.

マトロイド交差では $\det A[I, S] \cdot \det B[J, S]$ が Cauchy–Binet の公式で現れたが、パリティでは $\det C_S[I, \ast]$ を係数に持つ式が必要になる.
それを与えるのが交代行列の **Pfaffian** である.

### 3.3. 交代行列と Pfaffian

$H^\top = -H$ を満たす正方行列 $H$ を**交代行列**という（標数 $2$ でなければ対角成分は $0$）.
各ペアから作る行列

$$
\mathbf{a}_i \mathbf{b}_i^\top - \mathbf{b}_i \mathbf{a}_i^\top
$$

は交代行列である.

$2k \times 2k$ の交代行列 $H$ に対して、**Pfaffian** を

$$
\mathrm{Pf}(H) = \sum_{\mu} \mathrm{sgn}(\mu) \prod_{t=1}^{k} H_{p_t q_t}
$$

で定める. ここで $\mu = \lbrace (p_1, q_1), \dots, (p_k, q_k) \rbrace$（$p_t < q_t$）は $\lbrace 1, \dots, 2k \rbrace$ の完全マッチング全体を動き、$\mathrm{sgn}(\mu)$ は順列 $(p_1, q_1, p_2, q_2, \dots, p_k, q_k)$ の符号である（2 つの組を入れ替えるのは偶置換なので、組の並べ方によらない）.

<a id="thm-3-1"></a>

:::note[定理 3.1]
偶数次の交代行列 $H$ について $\det H = \mathrm{Pf}(H)^2$.
:::

証明は省略する（参考資料を参照）. 以下で使うのは「$\det H \neq 0 \iff \mathrm{Pf}(H) \neq 0$」の部分だけである.

<a id="lem-3-2"></a>

:::note[補題 3.2]
交代行列 $H$ の rank $s$ は偶数であり、$|I| = s$ の主小行列 $H[I, I]$ で正則なものが存在する.
:::

<details>
<summary>証明</summary>

$H$ の行のうち、行空間の基底をなす $s$ 行を $I$ とする.
すべての行は $I$ の行の線形結合なので、ある行列 $P$ を使って $H = P \, H[I, \ast]$ と書ける.
この両辺の列 $I$ を取り出すと

$$
H[\ast, I] = P \, H[I, I]
$$

である. 一方 $H[\ast, I] = -H[I, \ast]^\top$ であり、これは独立な $s$ 行を転置したものなので rank $s$ である.

行列の積の rank は、それぞれの行列の rank を超えないので, $s = \mathrm{rank}\, H[\ast, I] \le  \mathrm{rank}\, H[I, I]$ となり、$s \times s$ 行列 $H[I, I]$ は正則である.

$H[I, I]$ も交代行列なので

$$
\det H[I, I] = \det H[I, I]^\top = \det(-H[I, I]) = (-1)^s \det H[I, I]
$$

である. $\det H[I, I] \neq 0$ かつ標数 $2$ でないので $(-1)^s = 1$、つまり $s$ は偶数である. $\square$

</details>

### 3.4. Pfaffian の展開

マトロイド交差での Cauchy–Binet の公式（[マトロイド交差 定理 3.1](../../graph/matroid-intersection/#thm-3-1)）にあたるのが次の定理である.

<a id="thm-3-3"></a>

:::note[定理 3.3（Pfaffian の展開）]
$\boldsymbol{\alpha}_i, \boldsymbol{\beta}_i \in \mathbb{F}^{2k}$（$1 \leq i \leq m$）とし、$D_S$ を $\boldsymbol{\alpha}_i, \boldsymbol{\beta}_i$（$i \in S$）を $i$ の昇順に並べた $2k \times 2|S|$ 行列とする. このとき

$$
\mathrm{Pf}\Bigl( \sum_{i=1}^{m} x_i (\boldsymbol{\alpha}_i \boldsymbol{\beta}_i^\top - \boldsymbol{\beta}_i \boldsymbol{\alpha}_i^\top) \Bigr)
= \sum_{S \subseteq \lbrace 1, \dots, m \rbrace, \ |S| = k} \det D_S \cdot \prod_{i \in S} x_i
$$
:::

右辺には $x_i^2$ のような項が現れず、$k$ ペアの選び方 $S$ と単項式 $\prod_{i \in S} x_i$ が 1 対 1 に対応する.

<details>
<summary>証明</summary>

外積（ウェッジ積）$\wedge$ を使う. $\mathbb{F}^{2k}$ のベクトルについて次の性質だけを使う.

- 多重線形で、$\mathbf{u} \wedge \mathbf{v} = -\mathbf{v} \wedge \mathbf{u}$. 特に同じベクトルを 2 回含む積は $0$.
- $\mathbf{u} \wedge \mathbf{v}$ の形の 2 本組は他の積と可換（ベクトル 2 本ぶん動かすので符号は $(-1)^2 = 1$）.
- $2k$ 本のベクトルについて $\mathbf{w}_1 \wedge \cdots \wedge \mathbf{w}_{2k} = \det(\mathbf{w}_1, \dots, \mathbf{w}_{2k}) \ \mathbf{e}_1 \wedge \cdots \wedge \mathbf{e}_{2k}$.

交代行列 $H$ に対して $\omega_H = \sum_{p < q} H_{pq} \, \mathbf{e}_p \wedge \mathbf{e}_q$ とおく.

**Step 1**: $\omega_H$ の $k$ 乗は Pfaffian を与える.

$$
\omega_H^{\wedge k} = \sum_{(p_1, q_1), \dots, (p_k, q_k)} H_{p_1 q_1} \cdots H_{p_k q_k} \ \mathbf{e}_{p_1} \wedge \mathbf{e}_{q_1} \wedge \cdots \wedge \mathbf{e}_{p_k} \wedge \mathbf{e}_{q_k}
$$

と展開する. 添字が重なる項は $0$ なので、残るのは $(p_t, q_t)$ が完全マッチング $\mu$ をなす項だけである.
$\mathbf{e}_{p_1} \wedge \mathbf{e}_{q_1} \wedge \cdots = \mathrm{sgn}(\mu) \, \mathbf{e}_1 \wedge \cdots \wedge \mathbf{e}_{2k}$（置換行列の行列式）であり、1 つの $\mu$ は組の並べ方の $k!$ 回現れるので

$$
\omega_H^{\wedge k} = k! \, \mathrm{Pf}(H) \ \mathbf{e}_1 \wedge \cdots \wedge \mathbf{e}_{2k}
$$

である.

**Step 2**: $H = \mathbf{u}\mathbf{v}^\top - \mathbf{v}\mathbf{u}^\top$ なら $\omega_H = \mathbf{u} \wedge \mathbf{v}$ である. 実際

$$
\mathbf{u} \wedge \mathbf{v} = \sum_{p, q} u_p v_q \, \mathbf{e}_p \wedge \mathbf{e}_q = \sum_{p < q} (u_p v_q - v_p u_q) \, \mathbf{e}_p \wedge \mathbf{e}_q = \omega_H
$$

であり、係数は $H_{pq}$ に一致する. $\omega_H$ は $H$ について線形なので、$H_i = x_i (\boldsymbol{\alpha}_i \boldsymbol{\beta}_i^\top - \boldsymbol{\beta}_i \boldsymbol{\alpha}_i^\top\Bigr)$ とすると,  $\omega_{\sum_i H_i} = \sum_i x_i \, \boldsymbol{\alpha}_i \wedge \boldsymbol{\beta}_i$ となる.

**Step 3**: これを $k$ 乗すると

$$
\omega_H^{\wedge k} = \sum_{i_1, \dots, i_k} x_{i_1} \cdots x_{i_k} \ (\boldsymbol{\alpha}_{i_1} \wedge \boldsymbol{\beta}_{i_1}) \wedge \cdots \wedge (\boldsymbol{\alpha}_{i_k} \wedge \boldsymbol{\beta}_{i_k})
$$

である. 同じ $i$ が 2 回現れると $\boldsymbol{\alpha}_i$ を 2 回含むので $0$ になり、$x_i^2$ を含む項は消える.
残る項は相異なる $i$ の集合 $S$ ごとにまとめられ、2 本組は可換なので $k!$ 通りの並べ方はすべて同じ値

$$
\bigwedge_{i \in S \text{ (昇順)}} (\boldsymbol{\alpha}_i \wedge \boldsymbol{\beta}_i) = \det D_S \ \mathbf{e}_1 \wedge \cdots \wedge \mathbf{e}_{2k}
$$

になる. よって

$$
\omega_H^{\wedge k} = k! \sum_{|S| = k} \det D_S \prod_{i \in S} x_i \ \mathbf{e}_1 \wedge \cdots \wedge \mathbf{e}_{2k}
$$

であり、Step 1 と比べて $k!$ で割れば定理を得る. $\square$

</details>

### 3.5. 最大サイズの公式

各ペア $i$ に不定元 $x_i$ を用意し、$r \times r$ の交代行列を定義する.

$$
T(x) = \sum_{i=1}^{m} x_i (\mathbf{a}_i \mathbf{b}_i^\top - \mathbf{b}_i \mathbf{a}_i^\top)
$$

<a id="thm-3-4"></a>

:::note[定理 3.4（Lovász）]
選べるペア集合の最大サイズを $\nu$ とすると、有理関数体 $\mathbb{F}(x_1, \dots, x_m)$ 上で

$$
\mathrm{rank}\, T(x) = 2\nu
$$

である.
:::

<details>
<summary>証明</summary>

行 $I$（$|I| = 2k$）の主小行列は

$$
T[I, I] = \sum_{i} x_i \bigl( \mathbf{a}_i[I] \, \mathbf{b}_i[I]^\top - \mathbf{b}_i[I] \, \mathbf{a}_i[I]^\top \bigr)
$$

である. [定理 3.3](#thm-3-3)（Pfaffian の展開）を $\boldsymbol{\alpha}_i = \mathbf{a}_i[I]$、$\boldsymbol{\beta}_i = \mathbf{b}_i[I]$ に使うと $D_S = C_S[I, \ast]$ なので

$$
\mathrm{Pf}(T[I, I]) = \sum_{|S| = k} \det C_S[I, \ast] \cdot \prod_{i \in S} x_i
$$

となる. $S$ が異なれば単項式も異なるので、項どうしが打ち消し合うことはない.
よって 3.2 節と合わせて

$$
\begin{aligned}
& \exists I, \ \mathrm{Pf}(T[I, I]) \neq 0 \\
\iff & \exists I, S, \ \det C_S[I, \ast] \neq 0 \\
\iff & \text{要素数 } k \text{ の選べるペア集合 } S \text{ が存在する}
\end{aligned}
\tag{$\ast$}
$$

が成り立つ.

[補題 3.2](#lem-3-2) より $\mathrm{rank}\, T = 2s$ と書ける.

- **$s \leq \nu$**: [補題 3.2](#lem-3-2) より $|I| = 2s$ の正則な主小行列がある. [定理 3.1](#thm-3-1)（$\det = \mathrm{Pf}^2$）よりその Pfaffian は $0$ でないので、$(\ast)$ より $s$ ペアを選べる. よって $s \leq \nu$.
- **$s \geq \nu$**: $\nu$ ペアを選べるので、$(\ast)$ より $\mathrm{Pf}(T[I, I]) \neq 0$ となる $|I| = 2\nu$ がある. その主小行列は正則なので $\mathrm{rank}\, T \geq 2\nu$、つまり $s \geq \nu$. $\square$

</details>

## 4. マトロイドパリティの表現方法

### 4.1. 線形マトロイド交差

[マトロイド交差](../../graph/matroid-intersection/) 3 章と同じく、$M_1$ を $m_1 \times n$ 行列 $A$ の列、$M_2$ を $m_2 \times n$ 行列 $B$ の列で表す.
要素 $j$ を、次の $(m_1 + m_2)$ 次元ベクトルのペアに対応させる.

$$
\mathbf{u}_j = \begin{pmatrix} A[\ast, j] \\ 0 \end{pmatrix},
\qquad
\mathbf{v}_j = \begin{pmatrix} 0 \\ B[\ast, j] \end{pmatrix}
$$

$\mathbf{u}_j$ は上側 $m_1$ 成分、$\mathbf{v}_j$ は下側 $m_2$ 成分だけを使うので、線形結合が $0$ になる条件は上下で分離する.

$$
\sum_{j \in S} (\lambda_j \mathbf{u}_j + \lambda'_j \mathbf{v}_j) = 0
\iff
\sum_{j \in S} \lambda_j A[\ast, j] = 0 \ \text{かつ} \ \sum_{j \in S} \lambda'_j B[\ast, j] = 0
$$

よって

$$
\lbrace \mathbf{u}_j, \mathbf{v}_j \mid j \in S \rbrace \text{ が線形独立}
\iff
S \in \mathcal{I}_1 \cap \mathcal{I}_2
$$

であり、最大共通独立集合はこのパリティ問題の $\nu$ に等しい.

$\mathbf{u}_j \mathbf{v}_j^\top - \mathbf{v}_j \mathbf{u}_j^\top = \begin{pmatrix} 0 & A[\ast, j] B[\ast, j]^\top \\ -B[\ast, j] A[\ast, j]^\top & 0 \end{pmatrix}$ なので、$X = \mathrm{diag}(x_1, \dots, x_n)$ として

$$
T(x) = \begin{pmatrix} 0 & A X B^\top \\ -(A X B^\top)^\top & 0 \end{pmatrix}
$$

となる. 上下のブロックは使う行も列も重ならないので

$$
\mathrm{rank}\, T(x) = 2 \, \mathrm{rank}(A X B^\top)
$$

であり、[定理 3.4](#thm-3-4) から $\mathrm{rank}(A X B^\top) = \max \lbrace |S| : S \in \mathcal{I}_1 \cap \mathcal{I}_2 \rbrace$ が得られる.
これは[マトロイド交差 定理 3.2](../../graph/matroid-intersection/#thm-3-2) そのものである. 同じ乱数 $x_j$ を代入すれば、この関係は代入後も成り立つ.

### 4.2. 一般グラフの最大マッチング

1 章の構成（辺 $\lbrace u, v \rbrace$ ↔ $(\mathbf{e}_u, \mathbf{e}_v)$）で $T(x)$ を計算する.
辺 $\lbrace u, v \rbrace$（$u < v$）の変数を $x_{uv}$ とすると、$\mathbf{e}_u \mathbf{e}_v^\top$ は $(u, v)$ 成分だけが $1$ の行列なので

$$
T_{uv} =
\begin{cases}
x_{uv} & u < v, \ \lbrace u, v \rbrace \in E \\
-x_{vu} & u > v, \ \lbrace u, v \rbrace \in E \\
0 & \text{それ以外}
\end{cases}
$$

となる. これは **Tutte 行列**であり、二部グラフでの Edmonds 行列（マトロイド交差 3.3 節）の一般グラフ版である.
[定理 3.4](#thm-3-4) から、最大マッチングのサイズは $\mathrm{rank}\, T / 2$ である.

特に $n$ が偶数のとき

$$
\text{完全マッチングが存在}
\iff
\mathrm{rank}\, T = n
\iff
\det T \neq 0
$$

である. このとき Pfaffian の定義の和は完全マッチング全体を走るので、$\mathrm{Pf}(T)$ は完全マッチングごとに 1 つの単項式を持つ多項式になる.

### 4.3. 重み付き完全マッチング

頂点数 $n$ が偶数のグラフ $G = (V, E)$ の各辺 $e$ に非負整数の重み $w_e$ があるとき、**重み最小の完全マッチング**を求めたい.
完全マッチング $\mu$ の重みを $w(\mu) = \sum_{e \in \mu} w_e$ と書く.

4.2 節の Pfaffian が「完全マッチングごとに 1 つの単項式」を持つことを使い、重みをもう 1 つの変数 $y$ の指数に載せる.
Tutte 行列の成分を

$$
T_{uv}(x, y) =
\begin{cases}
x_{uv} \, y^{w_{uv}} & u < v, \ \lbrace u, v \rbrace \in E \\
-x_{vu} \, y^{w_{vu}} & u > v, \ \lbrace u, v \rbrace \in E \\
0 & \text{それ以外}
\end{cases}
$$

に置き換える. $T$ は交代行列のままである.

**Pfaffian の形**: Pfaffian の定義の各項は完全マッチング $\mu$ に対応し、その項は $\mathrm{sgn}(\mu) \prod_{e \in \mu} x_e \cdot y^{w(\mu)}$ になる. $y$ の次数でまとめると

$$
\mathrm{Pf}(T) = \sum_{W \geq 0} P_W(x) \, y^W,
\qquad
P_W(x) = \sum_{\mu : \, w(\mu) = W} \mathrm{sgn}(\mu) \prod_{e \in \mu} x_e
$$

である. 単項式 $\prod_{e \in \mu} x_e$ から $\mu$ が復元できるので $P_W$ の中で項は打ち消し合わず、

$$
P_W(x) \neq 0 \iff \text{重み } W \text{ の完全マッチングが存在する}
$$

が成り立つ.

<a id="thm-4-1"></a>

:::note[定理 4.1]
完全マッチングが存在するとき、$\det T(x, y)$ を $y$ の多項式とみたときの最低次数を $d$ とすると、最小重み $W^\ast$ は $d / 2$ に等しい.
:::

<details>
<summary>証明</summary>

$P_{W^\ast} \neq 0$ で、$W < W^\ast$ の $P_W$ はすべて $0$ なので $\mathrm{Pf}(T) = P_{W^\ast} y^{W^\ast} + (y \text{について高次の項})$ である.
[定理 3.1](#thm-3-1)（$\det T = \mathrm{Pf}(T)^2$）より

$$
\det T = P_{W^\ast}(x)^2 \, y^{2 W^\ast} + (\text{$y$ について高次の項})
$$

であり、$P_{W^\ast}^2 \neq 0$（多項式環は整域）なので最低次数は $2 W^\ast$ である. $\square$

</details>

同様に、最高次数の半分が最大重みになる.

**乱択による計算**: 

$x_e$ には $\mathbb{F}_p$ のランダムな値を代入する. 代入後の $\det T(y)$ は $y$ の 1 変数多項式で、次数は $D = n \cdot \max_e w_e$ 以下である.
$y = 0, 1, \dots, D$ の $D + 1$ 点で行列式を計算し、[ラグランジュ補間](../../polynomial/lagrange-interpolation/)で係数を復元すれば最低次数がわかる.
計算量は $O(D \, n^3)$ で、重みが小さいとき（擬多項式時間）に使える方法である.

### 4.4. まとめ

| 問題 | ペア | $T(x)$ | 求まる値 |
| --- | --- | --- | --- |
| 線形マトロイド交差 | $\left( \binom{A[\ast, j]}{0}, \binom{0}{B[\ast, j]} \right)$ | $\begin{pmatrix} 0 & AXB^\top \\ -(AXB^\top)^\top & 0 \end{pmatrix}$ | 最大サイズ $= \mathrm{rank}(AXB^\top)$ |
| 一般グラフの最大マッチング | 辺 $\lbrace u, v \rbrace$ に $(\mathbf{e}_u, \mathbf{e}_v)$ | Tutte 行列 | 最大サイズ $= \mathrm{rank}\, T / 2$ |
| 重み付き完全マッチング | 同上 | 成分に $y^{w_e}$ を掛けた Tutte 行列 | 最小重み $= (\det T \text{ の } y \text{ の最低次数}) / 2$ |

## 5. 参考資料

- [Cheung–Lau–Leung, *Algebraic Algorithms for Linear Matroid Parity Problems*](https://cs.uwaterloo.ca/~lapchi/papers/parity.pdf)（行列公式と Pfaffian の性質）
