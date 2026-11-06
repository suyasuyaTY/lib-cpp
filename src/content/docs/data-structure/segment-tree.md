---
title: "セグメント木"
tags: [range-query, point-update, range-update, monoid]
sidebar:
  order: 1
---
## 1. 概要

セグメント木を使うとどのような処理ができるのかについて、具体的な問題を確認する.

## 2. 前提知識

- セグメント木
- 遅延セグメント木
- 双対セグメント木
- 永続セグメント木

## 3. モノイドの工夫

### 3.1 最小値を取る要素の重みの総和

> 問題
>
> 配列 $A$ と、各要素に付いた固定の重み $W$ がある.
> 区間加算を行いながら、指定した区間の最小値と、その最小値を取る要素の重みの総和を求めたい.

例えば $A=(2,0,3,0)$, $W=(1,2,3,4)$ なら、最小値は $0$、求める重みの総和は $2+4=6$ となる.
ここで求めるのは最小値そのものの和ではなく、**最小値を取る位置に付いた重みの和**である.

各ノードに次の組を持たせる.

$$
S=(m,w)
=\left(\min_i A_i,\ \sum_{i:A_i=m}W_i\right)
$$

```cpp
namespace Seg {
using S = pll;  // (最小値, 最小値となる要素の和)
S op(S x, S y) {
  if (x.first == y.first)
    return make_pair(x.first, x.second + y.second);
  else
    return min(x, y);
}
S e() {
  return {LINF, 0};
}

using F = int;
S mapping(F f, S x) {
  return make_pair(x.first + f, x.second);
}
F composition(F f, F g) {
  return f + g;
}
F id() {
  return 0;
}

using Seg = lazy_segtree<S, op, e, F, mapping, composition, id>;
};  // namespace Seg
```

#### 関連問題

- [AALC001-N 九九](https://atcoder.jp/contests/aalc001/tasks/aalc001_n)

## 4. 作用の工夫

### 4.1 履歴和

> 問題
>
> 配列 $X$ と履歴を記録する配列 $H$ を用意し、最初はどちらも $0$ とする.
> $X$ への区間代入・区間加算と、全要素への $H_i\leftarrow H_i+X_i$ を行いながら、$X,H$ の区間和を求めたい.

履歴への加算を1回の記録と考えると、$H_i$ は各記録時点における $X_i$ の総和になる.
記録のたびに全要素を更新すると $O(N)$ かかるため、記録操作も遅延セグメント木の作用として扱う.

#### 各要素を行列とベクトルの式にする

履歴 $H_i$、現在値 $X_i$、定数 $1$ をまとめて、次の列ベクトルで表す.

$$
v_i=\begin{pmatrix}H_i\\X_i\\1\end{pmatrix}
$$

定数 $1$ を付けることで、値の代入や定数の加算も行列の掛け算で表せる.
各操作は $3\times3$ 行列を**左から掛ける**作用になる.

**代入 $X_i\leftarrow x$**

$$
D(x)v_i=
\begin{pmatrix}
1&0&0\\
0&0&x\\
0&0&1
\end{pmatrix}
\begin{pmatrix}H_i\\X_i\\1\end{pmatrix}
=\begin{pmatrix}H_i\\x\\1\end{pmatrix}
$$

2行目で現在値を $x$ に置き換える. 1行目は履歴をそのまま残す.

**加算 $X_i\leftarrow X_i+x$**

$$
A(x)v_i=
\begin{pmatrix}
1&0&0\\
0&1&x\\
0&0&1
\end{pmatrix}
\begin{pmatrix}H_i\\X_i\\1\end{pmatrix}
=\begin{pmatrix}H_i\\X_i+x\\1\end{pmatrix}
$$

**履歴への記録 $H_i\leftarrow H_i+X_i$**

$$
Rv_i=
\begin{pmatrix}
1&1&0\\
0&1&0\\
0&0&1
\end{pmatrix}
\begin{pmatrix}H_i\\X_i\\1\end{pmatrix}
=\begin{pmatrix}H_i+X_i\\X_i\\1\end{pmatrix}
$$

#### ノード: ベクトルの和

区間 $J$ を表すノードには、その区間の列ベクトルの和を持たせる.

$$
S_J=\sum_{i\in J}v_i
=\begin{pmatrix}
\sum_{i\in J}H_i\\
\sum_{i\in J}X_i\\
\lvert J\rvert
\end{pmatrix}
=\begin{pmatrix}h\\s\\n\end{pmatrix}
$$

#### 作用の合成: 右上の4成分だけを持つ

代入・加算・履歴への記録の行列は、いずれも次の形をしている.

$$
M(a,b,c,d)=
\begin{pmatrix}
1&a&b\\
0&c&d\\
0&0&1
\end{pmatrix}
$$

第1列と第3行は固定されており、変化するのは右上の $2\times2$ 部分にある $a,b,c,d$ だけである.
さらに、この形の行列同士を掛けても同じ形になるため $a,b,c,d$ 4成分の組 $F=(a,b,c,d)$ だけを持てばよい.

$$
\begin{aligned}
FG
&=
\begin{pmatrix}
1&a_f&b_f\\
0&c_f&d_f\\
0&0&1
\end{pmatrix}
\begin{pmatrix}
1&a_g&b_g\\
0&c_g&d_g\\
0&0&1
\end{pmatrix}\\
&=
\begin{pmatrix}
1&a_g+a_fc_g&b_g+a_fd_g+b_f\\
0&c_fc_g&c_fd_g+d_f\\
0&0&1
\end{pmatrix}
\end{aligned}
$$

ノードへの作用も、同じ行列から直接求められる.

$$
\begin{pmatrix}
1&a&b\\
0&c&d\\
0&0&1
\end{pmatrix}
\begin{pmatrix}h\\s\\n\end{pmatrix}
=\begin{pmatrix}h+as+bn\\cs+dn\\n\end{pmatrix}
$$

#### 実装

```cpp
namespace Seg {
using ll = long long;
using S = array<ll, 3>;  // {履歴和, 現在値の和, 区間長}
struct F { ll a, b, c, d; };  // 行列の右上: {{a, b}, {c, d}}

S op(S l, S r) {
    return {l[0] + r[0], l[1] + r[1], l[2] + r[2]};
}
S e() { return {0, 0, 0}; }

S mapping(F f, S x) {
    return {x[0] + f.a * x[1] + f.b * x[2],
            f.c * x[1] + f.d * x[2],
            x[2]};
}

F composition(F f, F g) {
    return {g.a + f.a * g.c,
            g.b + f.a * g.d + f.b,
            f.c * g.c,
            f.c * g.d + f.d};
}

F id() { return {0, 0, 1, 0}; }
F assign_value(ll x) { return {0, 0, 0, x}; }
F add_value(ll x) { return {0, 0, 1, x}; }
F record() { return {1, 0, 1, 0}; }

using Seg = atcoder::lazy_segtree<S, op, e, F, mapping, composition, id>;
}  // namespace Seg
```

#### 関連問題

- [AALC001-O 最小値](https://atcoder.jp/contests/aalc001/tasks/aalc001_o)

## 実装

```cpp title="segment_tree.cpp"
#include <atcoder/segtree>

using namespace std;

// Max monoid
namespace MaxMonoid {
using S = int;
S op(const S a, const S b) { return max(a, b); }
S e() { return 0; }  // 単位元
};  // namespace MaxMonoid

// Min monoid
namespace MinMonoid {
using S = int;
S op(const S a, const S b) { return min(a, b); }
S e() { return 0; }  // 単位元
};  // namespace MinMonoid

// sum monoid
namespace SumMonoid {
using S = int;
S op(const S a, const S b) { return a + b; }
S e() { return 0; }  // 単位元
};  // namespace SumMonoid
```
