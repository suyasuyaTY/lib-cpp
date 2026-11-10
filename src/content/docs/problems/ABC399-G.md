---
title: ABC399 G - Colorful Spanning Tree
problem: https://atcoder.jp/contests/abc399/tasks/abc399_g
submission: https://atcoder.jp/contests/abc399/submissions/80573066
uses: [graph/matroid-intersection, graph/matroid, linear-algebra/gaussian-elimination]
tags: [randomized]
---
[問題](https://atcoder.jp/contests/abc399/tasks/abc399_g) / [提出コード](https://atcoder.jp/contests/abc399/submissions/80573066)

## 問題

$N$ 頂点 $M$ 辺の連結無向グラフ（多重辺あり）があり、各辺には色 $c_i \in \lbrace 1, \dots, C \rbrace$ がついている. 数列 $A = (A_1, \dots, A_C)$ が与えられる.
各色 $c$ の辺が $A_c$ 本以下である全域木を**カラフル全域木**と呼ぶ.
$1 \le L \le R \le C$ の組のうち、色がすべて $[L, R]$ に入るカラフル全域木が存在するものの個数を求めよ.
制約は $N \le 150$、$C \le 300$、$\sum_c A_c \le 300$、$M \le 5 \times 10^5$.

## 1. 条件の言いかえ

カラフル全域木は、次の 2 つの条件を両方満たす $N - 1$ 本の辺集合である.

- 各色 $c$ の辺が $A_c$ 本以下（**分割マトロイド**の独立集合）.
- 閉路を作らない（**グラフィックマトロイド**の独立集合）.

よって、色 $[L, R]$ の辺に制限した 2 つのマトロイドの[マトロイド交差](../../graph/matroid-intersection/)の最大サイズが $N - 1$ になるかを判定すればよい.
2〜4 章で、これを行列の rank の問題に言いかえる.

$K = \sum_c A_c$ とし、辺は色の昇順に並べておく.

## 2. 色の個数制限の表現

[マトロイド（基礎）7.4 節](../../graph/matroid/) の Vandermonde 行列による構成を使う.
色 $c$ に $A_c$ 次元の座標領域（$K$ 行のうち $A_c$ 行）を割り当て、その領域内で**どの $A_c$ 本以下も線形独立**になるようにベクトルを置く.

具体的には、辺 $e$ の色を $c$ とし、$e$ ごとにランダムな $a_e \in \mathbb{F}_p$ をとって

$$
p_e = (\underbrace{0, \dots, 0}_{\text{色 } 1, \dots, c-1}, \ \underbrace{1, a_e, a_e^2, \dots, a_e^{A_c - 1}}_{\text{色 } c \text{ の領域}}, \ \underbrace{0, \dots, 0}_{\text{色 } c+1, \dots, C})^\top \in \mathbb{F}_p^{K}
$$

とする. これを並べた $P = (p_1, \dots, p_M) \in \mathbb{F}_p^{K \times M}$ が分割マトロイドを表す.

<details>
<summary>構成例（$A = (2, 1, 2)$ の場合）</summary>

$$
\begin{pmatrix}
1 & 1 & 0 & 0 & 0 \\
t_{0} & t_{1} & 0 & 0 & 0\\
0 & 0 & 1 & 0 & 0 \\
0 & 0 & 0 & 1 & 1 \\
0 & 0 & 0 & t_{0} & t_{1} \\
\end{pmatrix}
$$
</details>

## 3. 閉路を作らない制約の表現

グラフィックマトロイドは**接続行列**で表す.
辺 $e = (u, v)$ に、$u$ 成分が $1$、$v$ 成分が $-1$、他が $0$ のベクトル $q_e \in \mathbb{F}_p^{N}$ を対応させる.
辺の並び順は 2 章の $P$ と同じ（色の昇順）にしておく.

## 4. 区間への制限と行列の作成

ここまでで、$P \in \mathbb{F}_p^{K \times M}$、$Q \in \mathbb{F}_p^{(N-1) \times M}$ を構築した.

次に各辺にランダムな係数 $x_e$ を割り当て、$X = \mathrm{diag}(x_1, \dots, x_M)$ とする.
求める行列は

$$
H = P X Q^\top \in \mathbb{F}_p^{K \times (N-1)}
$$

である. [マトロイド交差 定理 3.2](../../graph/matroid-intersection/#thm-3-2) より、

$$
\mathrm{rank}\, H = N - 1 \iff \text{カラフル全域木が存在する}
$$

となる. 正確には乱択なので次のようになる.

- $\mathrm{rank}\, H = N - 1$ なら、カラフル全域木は**確実に存在**する.
- カラフル全域木が存在するとき、$\mathrm{rank}\, H = N - 1$ となるのは**高確率**である.

ただし $M$ が大きいため、実際に $P$、$Q$ を構築して行列積を計算していては間に合わない.
そこで $H$ を辺ごとの和に分解する.

$$
H = \sum_{e} x_e \, p_e \, q_e^\top
$$

$q_e$ は非零成分が 2 つ（$u$ と $v$）だけ、$p_e$ は色 $c$ の領域の $A_c$ 成分だけなので、辺 $e$ は $H$ の $A_c \times 2$ 個の成分にしか寄与しない.

$$
H[\text{色 } c \text{ の } t \text{ 行目}][u] \mathrel{+}= x_e a_e^{t}, \qquad
H[\text{色 } c \text{ の } t \text{ 行目}][v] \mathrel{-}= x_e a_e^{t}
\qquad (t = 0, \dots, A_c - 1)
$$

と直接足し込めば、$O\bigl(\sum_e A_{c_e}\bigr) = O(MN)$ で $H$ が作れる.

**区間への制限**: ここが重要な観察である.
色 $c$ の辺は $H$ の「色 $c$ の領域の行」にしか寄与しない.
よって、色 $[L, R]$ の辺だけに制限したときの行列 $H_{[L, R]}$ は、$H$ のうち**色 $L, \dots, R$ の行だけを残し、他の行を $0$ にした行列**である.

$$
H =
\begin{pmatrix}
H_1 \ H_2 \ \vdots \ H_C
\end{pmatrix}
\quad (H_c \in \mathbb{F}_p^{A_c \times (N-1)})
\qquad \Longrightarrow \qquad
\mathrm{rank}\, H_{[L, R]} = \mathrm{rank}
\begin{pmatrix}
H_L \ \vdots \ H_R
\end{pmatrix}
$$

したがって問題は次のように言い換えられる.

> $K$ 本の行ベクトル（長さ $N - 1$）が色の順に並んでいる. 色が $[L, R]$ の行ベクトルの rank が $N - 1$ となる $(L, R)$ の個数を求めよ.

$H$ は 1 回だけ作ればよく、区間ごとに作り直す必要はない.

## 5. ランクの判定

区間ごとにガウス消去すると、区間 $O(C^2)$ 個 × 1 回 $O(K N^2)$ で遅い.

そこで、$R$ を $1, 2, \dots, C$ と増やしながら行を追加していき、各ピボットにはできるだけ**新しい（色の大きい）行**を保持する.
こうすると、任意の $L$ に対する「色 $[L, R]$ の行の rank」が、保持している基底のうち色が $L$ 以上のものの個数として求まる.
この手法の一般的な形と実装は [掃き出し法](../../linear-algebra/gaussian-elimination/) の 3 章にまとめている.
