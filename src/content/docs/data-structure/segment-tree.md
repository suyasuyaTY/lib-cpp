---
title: "セグメント木"
tags: [range-query, point-update, range-update, monoid]
sidebar:
  order: 1
---
## 1. 概要

AtCoder Library（ACL）の `segtree` / `lazy_segtree` に渡す**モノイド**と**作用**の設計の仕方をまとめる.
セグメント木・遅延セグメント木の仕組みと実装は知っているものとし、前提知識の資料に任せる.

| 道具 | できること | 設計するもの |
| --- | --- | --- |
| `segtree<S, op, e>` | 一点更新・区間積 $O(\log N)$ | モノイド $(S, \mathrm{op}, e)$ |
| `lazy_segtree<S, op, e, F, mapping, composition, id>` | 区間作用・区間積 $O(\log N)$ | モノイド $S$ と、$S$ への作用 $F$ |

欲しい値がそのままモノイドにならないときは、**区間の情報を増やして準同型にする**（3 章）.
区間更新がそのまま作用にならないときは、**値と更新を行列などで表して合成を閉じさせる**（4 章）.

## 2. 前提知識

- **モノイド**: 集合 $S$ と二項演算 $\cdot$ の組で、結合法則 $(x \cdot y) \cdot z = x \cdot (y \cdot z)$ と単位元 $e$（$x \cdot e = e \cdot x = x$）をもつもの. 交換法則は要らない.
  例: 整数の加算（$e = 0$）、$\min$（$e = +\infty$）、$\max$（$e = -\infty$）、行列の積（$e = I$）、文字列の連結（$e$ は空文字列）.
- **遅延セグメント木が使える条件**: 写像の集合 $F$ が恒等写像 $\mathrm{id}$ を含み、合成について閉じていて、各 $f \in F$ が**準同型** $f(x \cdot y) = f(x) \cdot f(y)$ であること.
  ACL では $f(x)$ を `mapping(f, x)`、$f \circ g$（$g$ を先に、$f$ を後に作用させる）を `composition(f, g)`、$\mathrm{id}$ を `id()` で与える.
  例えば区間加算・区間和では、$f(x) = x + c$ は準同型にならないが、区間の長さ $n$ も $S$ に入れて $(s, n) \mapsto (s + cn, n)$ とすると準同型になる.
- セグメント木・遅延セグメント木の仕組みと実装
  - [セグメント木を徹底解説！0から遅延評価やモノイドまで - アルゴリズムロジック](https://algo-logic.info/segment-tree/)（ノードと区間の対応、遅延評価、自分で書くときの実装）
  - [Segment Tree のお勉強(1) - maspyのHP](https://maspypy.com/segment-tree-%E3%81%AE%E3%81%8A%E5%8B%89%E5%BC%B71)、[Segment Tree のお勉強(2) - maspyのHP](https://maspypy.com/segment-tree-%E3%81%AE%E3%81%8A%E5%8B%89%E5%BC%B72)（非再帰の実装と、遅延セグメント木に載る作用の条件）
  - [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)、[Lazy Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/lazysegtree.html)（ACL の使い方と計算量）

## 3. モノイドの設計

### 3.1. 区間の情報を準同型にする

区間クエリで欲しい値が列 $X$ の関数 $g(X)$ のとき、それを含む情報 $f(X)$ で、

$$
f(XY) = \mathrm{op}(f(X), f(Y))
$$

を満たすもの（連結に対する準同型）を探す. 単位元は空列の情報 $e = f(\varnothing)$ とすればよく、この等式が成り立てば結合法則・単位元の性質は自動的に成り立つ.
$g$ そのものでは足りないときは、**結合するのに必要な情報を足していく**.

| 欲しいもの | $S$ | $\mathrm{op}$ | $e$ |
| --- | --- | --- | --- |
| 区間和 | 和 $s$ | $x + y$ | $0$ |
| 区間最小値 | 最小値 $m$ | $\min(x, y)$ | $+\infty$ |
| 区間最大値 | 最大値 $M$ | $\max(x, y)$ | $-\infty$ |
| 最小値とその個数 | $(m, c)$ | $m$ が等しければ個数を足し、違えば小さい方 | $(+\infty, 0)$ |
| 区間平均 | $(s, n)$（和と個数） | 成分ごとに足す | $(0, 0)$ |

:::caution[平均だけでは結合できない]
平均だけを持つと、$(0)$ と $(4)$ の平均 $2$ と、$(0, 0, 0)$ と $(4)$ の平均 $1$ のように、同じ平均の組から違う平均が出るので $\mathrm{op}$ が定まらない. 和と個数を持ち、最後に割る.
:::

:::caution[単位元の取り違え]
$\min$ の単位元は $+\infty$、$\max$ の単位元は $-\infty$ である. 値が非負だからといって $\min$ の単位元を $0$ にすると、空でない区間でも答えが $0$ になってしまう.
:::

もう少し情報を足す例:

- **数字列が表す整数**: $f(X) = (\mathrm{val}(X), 10^{\lvert X \rvert})$ とすると $\mathrm{val}(XY) = \mathrm{val}(X) \cdot 10^{\lvert Y \rvert} + \mathrm{val}(Y)$. $e = (0, 1)$. ローリングハッシュも同じ形である.
- **最大部分配列和**: $f(X) = (\mathrm{ans}, \mathrm{pre}, \mathrm{suf}, \mathrm{all})$（答え・最大の接頭辞和・最大の接尾辞和・総和）とすると

  $$
  \begin{aligned}
  \mathrm{ans}(XY) &= \max(\mathrm{ans}(X), \mathrm{ans}(Y), \mathrm{suf}(X) + \mathrm{pre}(Y)) \\
  \mathrm{pre}(XY) &= \max(\mathrm{pre}(X), \mathrm{all}(X) + \mathrm{pre}(Y)) \\
  \mathrm{suf}(XY) &= \max(\mathrm{suf}(X) + \mathrm{all}(Y), \mathrm{suf}(Y)) \\
  \mathrm{all}(XY) &= \mathrm{all}(X) + \mathrm{all}(Y)
  \end{aligned}
  $$

  単位元は $(-\infty, -\infty, -\infty, 0)$（空の部分配列を認めない場合）.
- **関数の合成**: 各要素を関数 $F_i$ とみなし、$f(X) = F_{X}$（$X$ の関数を左から順に合成したもの）とすると $F_{XY} = F_Y \circ F_X$. 関数が $O(1)$ 個のパラメータで表せて、合成しても同じ形のままなら使える. 例えばアフィン関数 $x \mapsto ax + b$ や $x \mapsto \min(x + a, b)$. 2 次関数は合成すると次数が上がるので使えない.
- **行列**: 列を左から読む DP の遷移を行列で書けば、区間の遷移は行列の積になる. $\min$ / $\max$ を使う DP なら min-plus / max-plus 行列にする. 上の 2 例も行列で書け、積で変化しない成分を省けば同じモノイドになる.

### 3.2. 最小値を取る要素の重みの総和

> 配列 $A$ と、各要素に付いた固定の重み $W$ がある.
> 区間加算を行いながら、指定した区間の最小値と、その最小値を取る要素の重みの総和を求めたい.

例えば $A = (2, 0, 3, 0)$、$W = (1, 2, 3, 4)$ なら、最小値は $0$、求める重みの総和は $2 + 4 = 6$ となる.
ここで求めるのは最小値そのものの和ではなく、**最小値を取る位置に付いた重みの和**である.
「最小値とその個数」の個数を重みに置き換えたもので、各ノードに次の組を持たせる.

$$
f(J) = (m_J, w_J) = \left( \min_{i \in J} A_i,\ \sum_{i \in J,\ A_i = m_J} W_i \right)
$$

$$
\mathrm{op}((m_1, w_1), (m_2, w_2)) =
\begin{cases}
(m_1, w_1 + w_2) & (m_1 = m_2) \\
(m_1, w_1) & (m_1 < m_2) \\
(m_2, w_2) & (m_1 > m_2)
\end{cases}
\qquad
e = (+\infty, 0)
$$

区間に $c$ を加えても、最小値を取る位置は変わらず最小値が $c$ だけずれるので、作用は $(m, w) \mapsto (m + c, w)$ である.
これは $\mathrm{op}$ の場合分けを変えないので準同型であり、合成は $c$ の和になる.

$A_i \ge 0$ の列に区間加算・区間減算をしながら「$A_i = 0$ となる位置の重みの和」を数えるのによく使う（最小値が $0$ のときの $w$ が答えになる）.

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

:::tip
「区間の全部分列についての和」を求める問題は、右端 $r$ を 1 つずつ動かしながら「左端 $s$ ごとの現在値 $X_s$」を管理し、毎回 $X$ を履歴 $H$ に記録すると、$H_s$ が「左端 $s$、右端 $r$ 以下の部分列の値の和」になる. クエリを右端でソートすれば、履歴和の区間和で答えられる.
:::

## 5. 参考資料

- [区間クエリのためのモノイド設計 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/range_query_monoid_design)（$f(XY) = \mathrm{op}(f(X), f(Y))$ によるモノイドの設計、平均の失敗例、最大部分配列和、関数の合成・行列による設計）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（`segtree` のインターフェースと計算量）
- [Lazy Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/lazysegtree.html)（`lazy_segtree` のインターフェース、$F$ が満たすべき条件）

## 6. コード

ACL の `atcoder::segtree<S, op, e>` / `atcoder::lazy_segtree<S, op, e, F, mapping, composition, id>` に渡すモノイドと作用を、節ごとに namespace にまとめておく.

### 6.1. 基本のモノイド（2 章）

- `max_monoid` / `min_monoid` / `sum_monoid`: 区間最大値・最小値・和.

```cpp title="basic_monoid.cpp"
// 区間最大値
namespace max_monoid {
using S = long long;
S op(S a, S b) { return max(a, b); }
S e() { return LLONG_MIN; }  // -∞
}  // namespace max_monoid

// 区間最小値
namespace min_monoid {
using S = long long;
S op(S a, S b) { return min(a, b); }
S e() { return LLONG_MAX; }  // +∞
}  // namespace min_monoid

// 区間和
namespace sum_monoid {
using S = long long;
S op(S a, S b) { return a + b; }
S e() { return 0; }
}  // namespace sum_monoid
```

使用例:

```cpp
// 区間最小値
atcoder::segtree<long long, min_monoid::op, min_monoid::e> seg(a);
long long m = seg.prod(l, r);
```

### 6.2. 最小値を取る要素の重みの総和（3.2 節）

- `weighted_min`: $S = (m, w)$、$F$ は区間に足す値. `weighted_min::lazy_segtree` で初期値 `{A[i], W[i]}` の列から作る.

```cpp title="weighted_min.cpp"
// 区間加算・区間の (最小値, 最小値を取る位置の重みの和)
namespace weighted_min {
using S = pair<long long, long long>;  // (最小値 m, A_i = m となる i の W_i の和)
using F = long long;                   // 区間に足す値
const long long INF = LLONG_MAX / 4;

S op(S x, S y) {
  if (x.first == y.first) return {x.first, x.second + y.second};
  return x.first < y.first ? x : y;
}
S e() { return {INF, 0}; }
S mapping(F f, S x) {
  if (x.first == INF) return x;  // e() は e() のまま
  return {x.first + f, x.second};
}
F composition(F f, F g) { return f + g; }
F id() { return 0; }

using lazy_segtree = atcoder::lazy_segtree<S, op, e, F, mapping, composition, id>;
}  // namespace weighted_min
```

使用例:

```cpp
// 区間加算しながら、A_i = 0 となる位置の重みの和を求める（A_i >= 0 のとき）
vector<weighted_min::S> init(n);
for (int i = 0; i < n; i++) init[i] = {A[i], W[i]};
weighted_min::lazy_segtree wm(init);
wm.apply(l, r, +1);
auto [mn, w] = wm.all_prod();
long long zero_weight = (mn == 0 ? w : 0);
```

### 6.3. 履歴和（4.1 節）

- `history_sum`: $S = (h, s, n)$、$F = (a, b, c, d)$. 葉の初期値は `leaf()`（$H_i = X_i = 0$）. 作用は `assign(x)`（代入）、`add(x)`（加算）、`record()`（履歴への記録）.

```cpp title="history_sum.cpp"
// 区間代入・区間加算・区間の履歴への記録 H_i += X_i と、X, H の区間和
namespace history_sum {
using S = array<long long, 3>;       // {H の和 h, X の和 s, 区間長 n}
struct F { long long a, b, c, d; };  // 行列 [[1, a, b], [0, c, d], [0, 0, 1]]

S op(S x, S y) { return {x[0] + y[0], x[1] + y[1], x[2] + y[2]}; }
S e() { return {0, 0, 0}; }
S mapping(F f, S x) {
  return {x[0] + f.a * x[1] + f.b * x[2], f.c * x[1] + f.d * x[2], x[2]};
}
// f ∘ g（g を先に、f を後に作用させる）= 行列の積 F G
F composition(F f, F g) {
  return {g.a + f.a * g.c, g.b + f.a * g.d + f.b, f.c * g.c, f.c * g.d + f.d};
}
F id() { return {0, 0, 1, 0}; }

F assign(long long x) { return {0, 0, 0, x}; }  // X_i <- x
F add(long long x) { return {0, 0, 1, x}; }     // X_i <- X_i + x
F record() { return {1, 0, 1, 0}; }             // H_i <- H_i + X_i

S leaf() { return {0, 0, 1}; }  // 葉の初期値 H_i = X_i = 0（区間長 1）

using lazy_segtree = atcoder::lazy_segtree<S, op, e, F, mapping, composition, id>;
}  // namespace history_sum
```

使用例:

```cpp
history_sum::lazy_segtree hs(vector<history_sum::S>(n, history_sum::leaf()));
hs.apply(l, r, history_sum::assign(x));
hs.apply(0, n, history_sum::record());
long long h = hs.prod(l, r)[0];  // H の区間和
long long s = hs.prod(l, r)[1];  // X の区間和
```
