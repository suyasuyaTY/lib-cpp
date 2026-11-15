---
title: ABC426 G - Range Knapsack Query
problem: https://atcoder.jp/contests/abc426/tasks/abc426_g
uses: [data-structure/disjoint-sparse-table]
tags: [offline]
---
[問題](https://atcoder.jp/contests/abc426/tasks/abc426_g)

## 問題

$N$ 個の品物があり、品物 $i$ の重さは $W_i$、価値は $V_i$ である.
$Q$ 個のクエリ $(L, R, C)$ に答えよ: 品物 $L, L+1, \dots, R$ からいくつか（0 個でもよい）を重さの合計が $C$ 以下になるように選ぶとき、価値の合計の最大値.
制約は $N \le 2 \times 10^4$、$Q \le 2 \times 10^5$、$W_i \le 500$、$V_i \le 10^9$、$C \le 500$.

## 1. 条件の言いかえ

$\overline{C} = 500$ を容量の上限とする. 区間 $I$ の品物について、重さの合計が $c$ 以下のときの価値の最大値を $\mathrm{dp}_I[c]$（$0 \le c \le \overline{C}$）とする.
$I$ を隣り合う 2 区間 $I_1, I_2$ に分けると、容量 $C$ を $I_1$ に $c$、$I_2$ に $C - c$ と振り分けることで

$$
\mathrm{dp}_{I}[C] = \max_{0 \le c \le C} \left( \mathrm{dp}_{I_1}[c] + \mathrm{dp}_{I_2}[C - c] \right)
$$

となる. 2 つの表を丸ごと合成すると $O(\overline{C}^2)$ かかるが、1 つの $C$ についての値だけなら $O(\overline{C})$ で求まる.
また、表に品物を 1 つ追加するのは通常のナップサック DP の 1 ステップで $O(\overline{C})$ である.

## 2. Disjoint Sparse Table の形への帰着

区間の情報を $\mathrm{dp}$ 表とすると、

- 品物を左・右に 1 つ追加する: $O(\overline{C})$
- 左右の表から 1 つのクエリに答える: $O(\overline{C})$

ができるので、[Disjoint Sparse Table 5.2 節](../../data-structure/disjoint-sparse-table/) のひな形にそのまま当てはまる.
区間 $[L, R]$ を中央 $m$ で左右に分け、左の表は $m$ から左へ、右の表は $m$ から右へ品物を追加して作る.

## 3. 分割統治による実装

オンライン版の DST で全段の表を持つと、$N \lceil \log_2 N \rceil \times (\overline{C} + 1)$ 個の 64 bit 整数、つまり $2 \times 10^4 \times 15 \times 501 \times 8$ バイト $\approx 1.2$ GB となり、**MLE する**.

クエリはすべて先に読めるので、[Disjoint Sparse Table 3.4 節](../../data-structure/disjoint-sparse-table/) の分割統治（5.3 節のひな形）で実装する.
作業配列は $N \times (\overline{C} + 1)$ 個（約 80 MB）で済む.
計算量は表の構築が $O(\overline{C} N \log N)$、クエリへの回答が $O(\overline{C} Q)$ である.
