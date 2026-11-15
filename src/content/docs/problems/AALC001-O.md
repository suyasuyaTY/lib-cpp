---
title: AALC001 O - 最小値
problem: https://atcoder.jp/contests/aalc001/tasks/aalc001_o
uses: [data-structure/segment-tree]
tags: [offline, monotonic-stack]
---
[問題](https://atcoder.jp/contests/aalc001/tasks/aalc001_o)

## 問題

非負整数列 $A = (A_1, \dots, A_N)$ が与えられる. $Q$ 個のクエリ $(l, r)$ それぞれについて

$$
\sum_{l \le s \le t \le r} \min(A_s, \dots, A_t)
$$

を求めよ.
制約は $1 \le N, Q \le 2 \times 10^5$、$0 \le A_i \le 10^6$.

## 1. 条件の言いかえ

[セグメント木](../../data-structure/segment-tree/) の 4.1 節の tip の考え方を使う.
右端 $t$ を固定し、左端 $s$ ごとの値 $X_s^{(t)} = \min(A_s, \dots, A_t)$（$s > t$ なら $0$）を考える.
$H_s^{(r)} = \sum_{t = 1}^{r} X_s^{(t)}$ とおくと、$s \ge l$ では $X_s^{(t)} = 0$ $(t < s)$ なので

$$
\sum_{l \le s \le t \le r} \min(A_s, \dots, A_t) = \sum_{s = l}^{r} \sum_{t = s}^{r} X_s^{(t)} = \sum_{s = l}^{r} H_s^{(r)}
$$

> $t = 1, 2, \dots, N$ の順に $X^{(t)}$ を作り、そのたびに $H_s \leftarrow H_s + X_s$ と記録する. 右端が $r$ のクエリには、$t = r$ の記録の直後に $H$ の区間和 $\sum_{s=l}^{r} H_s$ で答える.

## 2. 履歴和への帰着

$t - 1$ から $t$ に進めるとき、$X_s \leftarrow \min(X_s, A_t)$ $(s < t)$、$X_t \leftarrow A_t$ となる.
$p$ を「$p < t$ かつ $A_p < A_t$ となる最大の $p$」（なければ $0$）とすると、$\min(A_s, \dots, A_t)$ は $s \le p$ では変わらず、$p < s \le t$ では $A_t$ になる. よって更新は

$$
X_s \leftarrow A_t \quad (p < s \le t)
$$

という**区間代入**である. $p$ は単調スタック（$A$ の値が狭義単調増加になるように添え字を積む）で求められる.

これは [セグメント木](../../data-structure/segment-tree/) の 4.1 節「履歴和」そのもので、各 $t$ で

1. $[p + 1, t]$ に `assign(A_t)`
2. 全体（$[1, t]$ で十分）に `record()`
3. 右端が $t$ のクエリ $(l, t)$ に、$H$ の区間和 $H_l + \dots + H_t$（`prod` の第 0 成分）を答える

とすればよい.

## 3. 計算量

クエリを右端ごとにまとめておけば、区間代入・記録がそれぞれ $N$ 回、区間和が $Q$ 回なので、全体で $O((N + Q) \log N)$ である.
答えは最大で $\frac{N(N+1)}{2} \cdot 10^6 \approx 2 \times 10^{16}$ なので `long long` に収まる.
