---
title: "アダマール変換（XOR畳み込み）"
tags: [xor, convolution]
sidebar:
  order: 3
---
## 1. 概要

長さ $2^n$ の列 $a, b$ の **XOR 畳み込み**

$$
c_k = \sum_{i \oplus j = k} a_i b_j \qquad (0 \le k < 2^n)
$$

を、**アダマール変換**（Walsh–Hadamard 変換）を使って高速に計算する.
アダマール変換は XOR 畳み込みを各点ごとの積に変えるので、「変換 → 各点で掛ける → 逆変換」で求まる.

| 操作 | 計算量 |
| --- | --- |
| アダマール変換（`hadamard_transform`） | $O(n 2^n)$ |
| 逆変換（`inverse_hadamard_transform`） | $O(n 2^n)$ |
| XOR 畳み込み（`xor_convolution`） | $O(n 2^n)$ |

定義どおりに計算すると $O(4^n)$ かかる. 列の長さを $N = 2^n$ と書けば、$O(N^2)$ が $O(N \log N)$ になる.

## 2. 前提知識

- **添え字を bit 列とみなす**: $0 \le x < 2^n$ を $n$ bit の列 $x = (x_1, \dots, x_n) \in \lbrace 0, 1 \rbrace^n$ と同一視する. $x \oplus y$ は bit ごとの $\bmod 2$ の和である.
- **$\bmod 2$ の内積**: $s, x \in \lbrace 0, 1 \rbrace^n$ に対して

  $$
  s \cdot x = s_1 x_1 + \cdots + s_n x_n \bmod 2
  $$

  とする. これは `popcount(s & x)` の偶奇である.
- 行列とベクトルの積、ブロック行列の積.

## 3. アダマール変換

### 3.1. 定義

$2^n \times 2^n$ 行列 $H_n$ を

$$
H_0 = \begin{bmatrix} 1 \end{bmatrix}, \qquad
H_n =
\begin{bmatrix}
H_{n - 1} & H_{n - 1} \\
H_{n - 1} & -H_{n - 1}
\end{bmatrix}
$$

で定め、**アダマール行列**という. 長さ $2^n$ のベクトル $f$ に対して $\hat{f} = H_n f$ を $f$ の**アダマール変換**という.
行列の積なので線形である（$H_n(\alpha f + \beta g) = \alpha H_n f + \beta H_n g$）.

各 $s \in \lbrace 0, 1 \rbrace^n$ に対して、関数 $\chi_s$ を

$$
\chi_s(x) = (-1)^{s \cdot x}
$$

で定める. アダマール行列の成分はこの $\chi_s$ で書ける.

<a id="claim-3-1"></a>

:::note[主張 3.1]
$H_n$ の行・列の添え字を $\lbrace 0, 1 \rbrace^n$ とみなす（先頭の bit を最上位 bit とする）と、

$$
(H_n)_{s, x} = \chi_s(x)
$$

である. したがって、アダマール変換は

$$
\hat{f}(s) = \sum_{x \in \lbrace 0, 1 \rbrace^n} \chi_s(x) f(x) = \sum_{x} (-1)^{s \cdot x} f(x)
$$

と書ける.
:::

**証明**: $n$ についての帰納法で示す.
$n = 0$ のときは $(H_0)_{0, 0} = 1 = \chi_0(0)$ である.

$n \ge 1$ とし、$H_{n - 1}$ について主張が成り立つとする.
$s = (\sigma, s')$, $x = (\xi, x')$ と最上位の 1 bit とそれ以外に分ける.
$H_n$ の定義では、$\sigma, \xi$ がブロックの位置を表し、$\sigma = \xi = 1$ の右下のブロックだけ符号が反転するので、

$$
(H_n)_{s, x} = (-1)^{\sigma \xi} (H_{n - 1})_{s', x'}
$$

である. 帰納法の仮定を使うと

$$
(H_n)_{s, x} = (-1)^{\sigma \xi} (-1)^{s' \cdot x'} = (-1)^{\sigma \xi + s' \cdot x'} = (-1)^{s \cdot x} = \chi_s(x)
$$

となる. $\square$

### 3.2. $\chi_s$ は XOR を積に変える

<a id="claim-3-2"></a>

:::note[主張 3.2]
任意の $s, x, y \in \lbrace 0, 1 \rbrace^n$ について

$$
\chi_s(x \oplus y) = \chi_s(x) \chi_s(y)
$$

が成り立つ.
:::

**証明**: XOR は bit ごとの $\bmod 2$ の和なので、$\bmod 2$ の内積は XOR について線形であり、

$$
s \cdot (x \oplus y) \equiv s \cdot x + s \cdot y \pmod 2
$$

である. $(-1)^m$ は $m$ の偶奇だけで決まるので、

$$
\chi_s(x \oplus y) = (-1)^{s \cdot (x \oplus y)} = (-1)^{s \cdot x + s \cdot y} = (-1)^{s \cdot x} (-1)^{s \cdot y} = \chi_s(x) \chi_s(y)
$$

となる. $\square$

### 3.3. 畳み込み定理

<a id="claim-3-3"></a>

:::note[主張 3.3（畳み込み定理）]
$a, b$ を長さ $2^n$ のベクトルとし、$c$ をその XOR 畳み込み $c_k = \sum_{i \oplus j = k} a_i b_j$ とする. このとき、すべての $s$ について

$$
\hat{c}(s) = \hat{a}(s) \, \hat{b}(s)
$$

が成り立つ.
:::

**証明**: [主張 3.1](#claim-3-1) の表示と [主張 3.2](#claim-3-2) を使う.

$$
\begin{aligned}
\hat{c}(s)
&= \sum_{k} \chi_s(k) c_k
= \sum_{k} \chi_s(k) \sum_{i \oplus j = k} a_i b_j \\
&= \sum_{i, j} \chi_s(i \oplus j) \, a_i b_j
= \sum_{i, j} \chi_s(i) \chi_s(j) \, a_i b_j \\
&= \left( \sum_{i} \chi_s(i) a_i \right) \left( \sum_{j} \chi_s(j) b_j \right)
= \hat{a}(s) \, \hat{b}(s)
\end{aligned}
$$

2 行目では、$k$ ごとの和をまとめて、すべての組 $(i, j)$ についての和に書き直した. $\square$

### 3.4. 逆変換

<a id="claim-3-4"></a>

:::note[主張 3.4]
$$
H_n H_n = 2^n I
$$

が成り立つ. したがって $H_n^{-1} = \dfrac{1}{2^n} H_n$ であり、逆変換は「もう一度アダマール変換して $2^n$ で割る」ことで計算できる.
:::

**証明**: $n$ についての帰納法で示す. $n = 0$ のときは $1 \cdot 1 = 1$ である.
$H_{n - 1} H_{n - 1} = 2^{n - 1} I$ と仮定すると、ブロック行列の積より

$$
\begin{aligned}
H_n H_n
&=
\begin{bmatrix}
H_{n - 1} & H_{n - 1} \\
H_{n - 1} & -H_{n - 1}
\end{bmatrix}
\begin{bmatrix}
H_{n - 1} & H_{n - 1} \\
H_{n - 1} & -H_{n - 1}
\end{bmatrix} \\
&=
\begin{bmatrix}
2 H_{n - 1} H_{n - 1} & O \\
O & 2 H_{n - 1} H_{n - 1}
\end{bmatrix}
= 2^n I
\end{aligned}
$$

となる. $\square$

以上から、XOR 畳み込みは

$$
c = H_n^{-1} \left( \hat{a} \odot \hat{b} \right) = \frac{1}{2^n} H_n \left( (H_n a) \odot (H_n b) \right)
$$

で求まる（$\odot$ は各点ごとの積）. アダマール変換 3 回と各点の積 $2^n$ 回である.

### 3.5. $O(n 2^n)$ で計算する

<a id="claim-3-5"></a>

:::note[主張 3.5]
長さ $2^n$ のベクトル $f$ に対して、$H_n f$ は加減算 $O(n 2^n)$ 回で計算できる.
:::

**証明**: $f$ を前半 $f_0$（最上位 bit が $0$ の添え字）と後半 $f_1$（最上位 bit が $1$ の添え字）に分けると、$H_n$ の定義より

$$
H_n f =
\begin{bmatrix}
H_{n - 1} f_0 + H_{n - 1} f_1 \\
H_{n - 1} f_0 - H_{n - 1} f_1
\end{bmatrix}
$$

である. よって、前半と後半をそれぞれ再帰的に変換した後、$x = (H_{n - 1} f_0)_j$, $y = (H_{n - 1} f_1)_j$ の組を $(x + y, x - y)$ に置き換えればよい（バタフライ演算）.
計算量を $T(n)$ とすると $T(n) = 2 T(n - 1) + O(2^n)$ なので、$T(n) = O(n 2^n)$ である. $\square$

この再帰を下から展開すると、`len` $= 1, 2, 4, \dots, 2^{n - 1}$ の順に、長さ `2 * len` のブロックごとに「前半と後半の対応する要素をバタフライ演算する」ループになる.
これが[コード](#5-コード)の `hadamard_transform` であり、追加のメモリを使わずにその場で変換できる.

:::tip[整数・mod 素数で使う]
変換・各点の積は加減算と乗算だけなので、どの環でも計算できる. 割り算が必要なのは逆変換の $2^n$ だけである.

- 整数（`long long` など）: 正しい答え $c$ は整数で、逆変換の直前の値はちょうど $2^n c$ になるので、整数の割り算で割り切れる. ただし途中の値は答えの $2^n$ 倍になるので、オーバーフローに注意する.
- $\bmod p$（$p$ は奇素数、例えば ACL の `modint998244353`）: $2^n$ は逆元をもつので、`T` を modint にすればそのまま使える.
:::

:::caution[$2^n$ で割れない場合]
$\bmod 2^{64}$ や偶数の $\bmod m$、標数 $2$ の体では $2^n$ の逆元がないので、逆変換で割れない.
このときは次のどちらかを使う（[AtCoder Algorithm Lectures「XOR 畳み込み（除算なし）」](https://info.atcoder.jp/entry/algorithm_lectures/division_free_xor_convolution)）.

- **整数で計算してから余りをとる**: $\mathbb{Z}$ では $2^n c$ から $c$ が一意に定まる. 値が大きくなるなら、いくつかの奇素数 $\bmod$ で計算して中国剰余定理で復元する.
- **除算を使わない $O(n^2 2^n)$ の方法**: 集合 $S$ に単項式 $x^S = \prod_{i \in S} x_i$ を対応させると、XOR 畳み込みは多項式の積を $\bmod (x_0^2 - 1, \dots, x_{n-1}^2 - 1)$ で簡約したものになる.
  $y_i = x_i + 1$ と変数変換すると法が $y_i^2 - 2 y_i$ になり、$y$ での積は

  $$
  C_U = \sum_{S \cup T = U} A_S B_T \cdot 2^{|S| + |T| - |U|}
  $$

  と書ける. $x \to y$ の変換とその逆は[上位集合のメビウス・ゼータ変換](../../bitwise/subset-transform/)であり、$C$ は $|S|, |T|$ を変数 $t$ の次数として持つ OR 畳み込み（部分集合畳み込みと同じ形）で求まる. $|S| + |T| \ge |U|$ なので、$2$ の指数は非負で割り算は現れない.
:::

## 4. 参考資料

- [AtCoder Algorithm Lectures「XOR 畳み込み（除算なし）」](https://info.atcoder.jp/entry/algorithm_lectures/division_free_xor_convolution)（逆変換で $2^n$ の除算が必要になること、整数で計算する方法、除算を使わない $O(n^2 2^n)$ の方法）
- [Hadamard transform - Wikipedia](https://en.wikipedia.org/wiki/Hadamard_transform)（アダマール行列の再帰的な定義、$(-1)^{s \cdot x}$ による成分の表示、$H_n H_n = 2^n I$）
- [Bitwise Xor Convolution - Library Checker](https://judge.yosupo.jp/problem/bitwise_xor_convolution)（XOR 畳み込みの検証用問題）

## 5. コード

- `hadamard_transform(a)`: `a` をアダマール変換する. つまり $a_s \leftarrow \sum_x (-1)^{\mathrm{popcount}(s \,\&\, x)} a_x$. `a.size()` は $2$ べきであること. $O(n 2^n)$.
- `inverse_hadamard_transform(a)`: `hadamard_transform` の逆変換. もう一度変換して `T(a.size())` で割る. $O(n 2^n)$.
- `xor_convolution(a, b)`: $c_k = \sum_{i \oplus j = k} a_i b_j$ を返す. `a`, `b` は同じ長さ $2^n$ であること. $O(n 2^n)$.

`T` は加減乗算と、$2^n$ による割り算 `/=` ができる型（`long long`、`double`、ACL の `modint998244353` など）.

```cpp title="hadamard_transform.cpp"
// a[s] <- sum_x (-1)^{popcount(s & x)} a[x]. a.size() は 2 べき. O(n 2^n)
template <class T>
void hadamard_transform(vector<T>& a) {
  int n = (int)a.size();
  assert((n & (n - 1)) == 0);
  for (int len = 1; len < n; len <<= 1) {
    for (int i = 0; i < n; i += len << 1) {
      for (int j = i; j < i + len; j++) {
        T x = a[j], y = a[j + len];
        a[j] = x + y;
        a[j + len] = x - y;
      }
    }
  }
}

// hadamard_transform の逆変換. 変換してから 2^n で割る. O(n 2^n)
template <class T>
void inverse_hadamard_transform(vector<T>& a) {
  hadamard_transform(a);
  T n = T((int)a.size());
  for (auto& x : a) x /= n;
}

// c[k] = sum_{i xor j = k} a[i] b[j]. a, b は同じ長さ 2^n. O(n 2^n)
template <class T>
vector<T> xor_convolution(vector<T> a, vector<T> b) {
  assert(a.size() == b.size());
  hadamard_transform(a);
  hadamard_transform(b);
  for (int i = 0; i < (int)a.size(); i++) a[i] *= b[i];
  inverse_hadamard_transform(a);
  return a;
}
```

使用例（$\bmod 998244353$ での XOR 畳み込み）:

```cpp
using mint = atcoder::modint998244353;

int main() {
  int n;
  cin >> n;
  vector<mint> a(1 << n), b(1 << n);
  for (auto& x : a) { int v; cin >> v; x = v; }
  for (auto& x : b) { int v; cin >> v; x = v; }
  auto c = xor_convolution(a, b);
  for (int i = 0; i < (1 << n); i++) cout << c[i].val() << " \n"[i + 1 == (1 << n)];
}
```
