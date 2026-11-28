---
title: "セグメント木"
tags: [range-query, point-update, range-update, monoid]
status: verified
sidebar:
  order: 1
---
## 1. 概要

AtCoder Library（ACL）の `segtree` / `lazy_segtree` に渡す**モノイド**と**作用**の設計の仕方をまとめる.

| 道具 | できること | 設計するもの |
| --- | --- | --- |
| `segtree<S, op, e>` | 一点更新・区間積 $O(\log N)$ | モノイド $(S, \mathrm{op}, e)$ |
| `lazy_segtree<S, op, e, F, mapping, composition, id>` | 区間作用・区間積 $O(\log N)$ | モノイド $S$ と、$S$ への作用 $F$ |

欲しい値がそのままモノイドにならないときは、**区間の情報を増やして準同型にする**（3 章）.
区間更新がそのまま作用にならないときは、**値と更新を行列などで表して合成を閉じさせる**（4 章）.

## 2. 前提知識

- **モノイド** $(S, \cdot, e)$: 集合 $S$ と二項演算 $\cdot$ の組で、次を満たすもの.
  - 結合法則: $(x \cdot y) \cdot z = x \cdot (y \cdot z)$
  - 単位元 $e$ をもつ: $x \cdot e = e \cdot x = x$
  - 交換法則は要らない.
- **遅延セグメント木が使える条件**: 写像の集合 $F$ が次を満たすこと.
  - 恒等写像 $\mathrm{id}$ を含む.
  - 合成について閉じている（$f, g \in F$ なら $f \circ g \in F$）.
  - 各 $f \in F$ が**準同型**: $f(x \cdot y) = f(x) \cdot f(y)$
- **ACL の関数との対応**:
  - $f(x)$ → `mapping(f, x)`
  - $f \circ g$（$g$ を先に、$f$ を後に作用させる）→ `composition(f, g)`
  - $\mathrm{id}$ → `id()`

## 3. モノイドの設計

区間クエリで欲しい値が列 $X$ の関数 $g(X)$ のとき、それを含む情報 $f(X)$ で、

$$
f(XY) = \mathrm{op}(f(X), f(Y))
$$

を満たすもの（連結に対する準同型）を探す. 単位元は空列の情報 $e = f(\varnothing)$ とすればよく、この等式が成り立てば結合法則・単位元の性質は自動的に成り立つ.

| 欲しいもの | $S$ | $\mathrm{op}$ | $e$ |
| --- | --- | --- | --- |
| 区間和 | 和 $s$ | $x + y$ | $0$ |
| 区間最小値 | 最小値 $m$ | $\min(x, y)$ | $+\infty$ |
| 区間最大値 | 最大値 $M$ | $\max(x, y)$ | $-\infty$ |
| 最小値とその個数 | $(m, c)$ | $m$ が等しければ個数を足し、違えば小さい方 | $(+\infty, 0)$ |
| 区間平均 | $(s, n)$（和と個数） | 成分ごとに足す | $(0, 0)$ |

もう少し情報を足す例:

- **数字列が表す整数**
  - 情報: $f(X) = (\mathrm{val}(X), 10^{\lvert X \rvert})$
  - 結合: $\mathrm{val}(XY) = \mathrm{val}(X) \cdot 10^{\lvert Y \rvert} + \mathrm{val}(Y)$、$10^{\lvert XY \rvert} = 10^{\lvert X \rvert} \cdot 10^{\lvert Y \rvert}$
  - 単位元: $e = (0, 1)$
  - ローリングハッシュも、$10$ を基数 $B$ に替えた同じ形である.
- **最大部分配列和**
  - 情報: $f(X) = (\mathrm{ans}, \mathrm{pre}, \mathrm{suf}, \mathrm{all})$（答え・最大の接頭辞和・最大の接尾辞和・総和）
  - 結合:

    $$
    \begin{aligned}
    \mathrm{ans}(XY) &= \max(\mathrm{ans}(X), \mathrm{ans}(Y), \mathrm{suf}(X) + \mathrm{pre}(Y)) \\
    \mathrm{pre}(XY) &= \max(\mathrm{pre}(X), \mathrm{all}(X) + \mathrm{pre}(Y)) \\
    \mathrm{suf}(XY) &= \max(\mathrm{suf}(X) + \mathrm{all}(Y), \mathrm{suf}(Y)) \\
    \mathrm{all}(XY) &= \mathrm{all}(X) + \mathrm{all}(Y)
    \end{aligned}
    $$

  - 単位元: $e = (-\infty, -\infty, -\infty, 0)$（空の部分配列を認めない場合）
- **関数の合成**
  - 情報: 各要素を関数 $F_i$ とみなし、$f(X) = F_X$（$X$ の関数を左から順に合成したもの）
  - 結合: $F_{XY} = F_Y \circ F_X$
  - 単位元: 恒等関数
  - 使える条件: 関数が $O(1)$ 個のパラメータで表せて、合成しても同じ形のままであること.
  - 使える例: アフィン関数 $x \mapsto ax + b$、$x \mapsto \min(x + a, b)$
  - 使えない例: 2 次関数（合成すると次数が上がる）
- **行列**
  - 情報: 列を左から読む DP の遷移を行列で書き、区間 $X$ の遷移行列 $T_X$ を持つ.
  - 結合: 行列の積（DP ベクトルを列ベクトルとして左から掛けるなら $T_{XY} = T_Y T_X$）
  - 単位元: 単位行列
  - $\min$ / $\max$ を使う DP なら min-plus / max-plus 行列にする.
  - 数字列が表す整数・最大部分配列和も行列で書け、積で変化しない成分を省けば同じモノイドになる.

## 4. 作用の設計

### 4.1. 履歴和

> 配列 $X$ と履歴を記録する配列 $H$ を用意し、最初はどちらも $0$ とする.
> $X$ への区間代入・区間加算と、区間の $H_i \leftarrow H_i + X_i$ を行いながら、$X, H$ の区間和を求めたい.

履歴への加算を 1 回の記録と考えると、$H_i$ は各記録時点における $X_i$ の総和になる.
記録のたびに全要素を更新すると $O(N)$ かかるため、記録操作も遅延セグメント木の作用として扱う.

#### 各要素を行列とベクトルの式にする

履歴 $H_i$、現在値 $X_i$、定数 $1$ をまとめて、次の列ベクトルで表す.

$$
v_i = \begin{pmatrix} H_i \\ X_i \\ 1 \end{pmatrix}
$$

定数 $1$ を付けることで、値の代入や定数の加算も行列の掛け算で表せる.
各操作は $3 \times 3$ 行列を**左から掛ける**作用になる.

**代入 $X_i \leftarrow x$**

$$
D(x) v_i =
\begin{pmatrix}
1 & 0 & 0 \\
0 & 0 & x \\
0 & 0 & 1
\end{pmatrix}
\begin{pmatrix} H_i \\ X_i \\ 1 \end{pmatrix}
= \begin{pmatrix} H_i \\ x \\ 1 \end{pmatrix}
$$

2 行目で現在値を $x$ に置き換える. 1 行目は履歴をそのまま残す.

**加算 $X_i \leftarrow X_i + x$**

$$
A(x) v_i =
\begin{pmatrix}
1 & 0 & 0 \\
0 & 1 & x \\
0 & 0 & 1
\end{pmatrix}
\begin{pmatrix} H_i \\ X_i \\ 1 \end{pmatrix}
= \begin{pmatrix} H_i \\ X_i + x \\ 1 \end{pmatrix}
$$

**履歴への記録 $H_i \leftarrow H_i + X_i$**

$$
R v_i =
\begin{pmatrix}
1 & 1 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{pmatrix}
\begin{pmatrix} H_i \\ X_i \\ 1 \end{pmatrix}
= \begin{pmatrix} H_i + X_i \\ X_i \\ 1 \end{pmatrix}
$$

#### ノード: ベクトルの和

区間 $J$ を表すノードには、その区間の列ベクトルの和を持たせる.

$$
S_J = \sum_{i \in J} v_i
= \begin{pmatrix}
\sum_{i \in J} H_i \\
\sum_{i \in J} X_i \\
\lvert J \rvert
\end{pmatrix}
= \begin{pmatrix} h \\ s \\ n \end{pmatrix}
$$

$\mathrm{op}$ はベクトルの和、$e$ は零ベクトルである.
行列を掛ける作用は線形なので $M(v + w) = Mv + Mw$ が成り立ち、前提知識の準同型の条件を満たす.
葉の初期値は $(0, 0, 1)^\top$ にしておく（区間長の成分を $1$ にするのを忘れない）.

#### 作用の合成: 右上の 4 成分だけを持つ

代入・加算・履歴への記録の行列は、いずれも次の形をしている.

$$
M(a, b, c, d) =
\begin{pmatrix}
1 & a & b \\
0 & c & d \\
0 & 0 & 1
\end{pmatrix}
$$

第 1 列と第 3 行は固定されており、変化するのは右上の $2 \times 2$ 部分にある $a, b, c, d$ だけである.
さらに、この形の行列同士を掛けても同じ形になるため、4 成分の組 $F = (a, b, c, d)$ だけを持てばよい.
$f \circ g$（$g$ を先に作用させる）は行列の積 $FG$ である.

$$
\begin{aligned}
FG
&=
\begin{pmatrix}
1 & a_f & b_f \\
0 & c_f & d_f \\
0 & 0 & 1
\end{pmatrix}
\begin{pmatrix}
1 & a_g & b_g \\
0 & c_g & d_g \\
0 & 0 & 1
\end{pmatrix} \\
&=
\begin{pmatrix}
1 & a_g + a_f c_g & b_g + a_f d_g + b_f \\
0 & c_f c_g & c_f d_g + d_f \\
0 & 0 & 1
\end{pmatrix}
\end{aligned}
$$

ノードへの作用も、同じ行列から直接求められる.

$$
\begin{pmatrix}
1 & a & b \\
0 & c & d \\
0 & 0 & 1
\end{pmatrix}
\begin{pmatrix} h \\ s \\ n \end{pmatrix}
= \begin{pmatrix} h + as + bn \\ cs + dn \\ n \end{pmatrix}
$$

恒等写像は $(a, b, c, d) = (0, 0, 1, 0)$、代入は $(0, 0, 0, x)$、加算は $(0, 0, 1, x)$、記録は $(1, 0, 1, 0)$ である.

:::tip[使いどころ: 全部分区間についての和]
列 $A$ と区間の関数 $g$（区間の最大値など）があり、クエリ $(l, r)$ ごとに

$$
\sum_{l \le s \le t \le r} g(A[s..t])
$$

（$[l, r]$ に含まれるすべての部分区間 $[s, t]$ についての $g$ の和）を求めたいとき、履歴和で解けることが多い.

1. クエリを右端 $r$ でソートし、右端 $t$ を $0, 1, 2, \dots$ と 1 つずつ増やす.
2. 各 $t$ で、左端 $s \le t$ ごとに $X_s = g(A[s..t])$ となるように $X$ を更新する. $g$ が最大値なら、単調スタックで $X$ を区間代入すればよい.
3. 区間 $[0, t]$ に記録 $H_s \leftarrow H_s + X_s$ を行う. 記録後の $H_s$ は $\sum_{t' = s}^{t} g(A[s..t'])$、つまり左端が $s$ で右端が $t$ 以下の部分区間についての $g$ の和になる.
4. 右端が $r = t$ のクエリ $(l, r)$ には、$H$ の区間和 $\sum_{s = l}^{r} H_s$ を答える.
:::

## 5. 参考資料

- [区間クエリのためのモノイド設計 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/range_query_monoid_design)（$f(XY) = \mathrm{op}(f(X), f(Y))$ によるモノイドの設計、平均の失敗例、最大部分配列和、関数の合成・行列による設計）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（`segtree` のインターフェースと計算量）
- [Lazy Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/lazysegtree.html)（`lazy_segtree` のインターフェース、$F$ が満たすべき条件）