---
title: "2 進数の下位桁から考える桁dp"
sidebar:
  order: 5
---
## 概要

非負整数の変数を $x_i = 2q_i + r_i$, $r_i \in \{0,1\}$ と分解し, 最下位 bit を確定させてから残りの桁を考える DP.

例えば, $A_i$ が正整数のとき,

$$
\sum_i A_i x_i \leq M
\iff
\sum_i A_i q_i \leq \left\lfloor\frac{M-\sum_i A_i r_i}{2}\right\rfloor
$$

となり, 同じ形の問題に帰着できる.

- 下位 bit の寄与を引いて $2$ で割ることで, 上限を毎回ほぼ半分にする
- 各 bit の選び方を, その寄与や次の桁への繰り上がりが同じものごとにまとめる
- 桁数は $O(\log M)$. 状態数も小さく抑えられると, $M$ が巨大でも扱える
- 等式の場合は, 引いた値が非負かつ偶数のときだけ遷移する. 不等式の場合は切り捨てでよい

## 問題例

### [ABC436-G Linear Inequation](https://atcoder.jp/contests/abc436/tasks/abc436_g)

- $f(m)$: $\sum_i A_i x_i \leq m$ を満たす非負整数列 $X$ の個数
- $K=\sum_i A_i$ とし, 最下位 bit の寄与が $s$ となる選び方の数 $g[s]$ を部分和 DP で求める

$$
f(m)=\sum_{s=0}^{K}g[s]f\left(\left\lfloor\frac{m-s}{2}\right\rfloor\right)
$$

ただし $f(m)=0\ (m<0)$, $f(0)=1$ とする.

上限 $m$ からの差分 $d$ ごとに係数を持ち, 答えを次の形で表す. 初期状態は $m=M$, $\mathrm{coef}[0]=1$, それ以外は $0$.

$$
\text{答え}=\sum_{d=0}^{K}\mathrm{coef}[d]f(m-d)
$$

$b=m\bmod 2$, $m'=\lfloor m/2\rfloor$ とすると,

$$
\left\lfloor\frac{m-d-s}{2}\right\rfloor
=m'-\left\lfloor\frac{d+s+1-b}{2}\right\rfloor
$$

$0\leq d,s\leq K$ なら次の差分も $K$ 以下なので, 状態数は $O(K)$ に収まる.

$d+s$ が同じ項は遷移先も同じになるため, 畳み込みでまとめて計算する.

$$
\begin{aligned}
    \sum_{d} \mathrm{coef}[d] f(M - i) &= \sum_{d} coef[d] \sum_{s} S[s] f((M - d - s) / 2) \\
    &= \sum_{d} \sum_{s} \mathrm{coef}[d] * S[s] * f((M - d - s) / 2)
\end{aligned}
$$


### [NDPC-J 個数と総和](https://atcoder.jp/contests/ndpc/tasks/ndpc2026_j)

- $\sum_i c_i=S$, $\sum_i A_i c_i=T$ を同時に満たす非負整数列 $C$ の個数を求める
- 最下位 bit が $1$ の添字集合を $B$ とし, $x=|B|$, $y=\sum_{i\in B}A_i$ とすると, 残りの桁の条件は次のようになる

$$
\sum_i q_i=\frac{S-x}{2},\qquad
\sum_i A_i q_i=\frac{T-y}{2}
$$

この関係を, 下位桁からの繰り上がりを持つ DP として計算する.

- $dp[s][t]$: 処理済みの下位桁が $S,T$ と一致し, 現在の桁へそれぞれ $s,t$ が繰り上がっている場合の数
- 初期状態は $dp[0][0]=1$, それ以外は $0$
- $g[x][y]$: $|B|=x$, $\sum_{i\in B}A_i=y$ となる集合 $B$ の個数

現在の桁を $k$ とし, $b_S=(S\mathbin{\gg}k)\mathbin{\&}1$, $b_T=(T\mathbin{\gg}k)\mathbin{\&}1$ とする.

$$
s+x\equiv b_S\pmod 2,\qquad t+y\equiv b_T\pmod 2
$$

を満たす場合だけ, 次のように遷移する.

$$
\mathrm{next}\left[\frac{s+x-b_S}{2}\right]
\left[\frac{t+y-b_T}{2}\right]
\mathrel{+}=dp[s][t]g[x][y]
$$

$g$ の全要素との積を直接計算する代わりに, $D\leftarrow dp$ として各 $A_i$ の寄与を 0/1 ナップサックで加える. 
