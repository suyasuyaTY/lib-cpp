---
title: "形式的冪級数"
tags: [convolution, counting]
sidebar:
  order: 1
---
## 概要
数え上げ問題を、形式的冪級数に対する計算と結びつけることで式変形で解を得ることができる

## よく使う代数

### 二項定理
$$
(1+x)^n = \sum_{k=0}^{n} \binom{n}{k} x^k
$$

$$
(1-x)^{-n} = \sum_{k=0}^{\infty} \binom{k+n-1}{n-1} x^k
$$

### 等比級数
$$
\sum_{k=0}^{n-1} r^k = \frac{1-r^{n}}{1-r}
$$

### 形式的冪級数の計算
$ F = \sum_{n=0}^{\infty} f_n x^k, G = \sum_{n=0}^{\infty} g_n x^k$ とする。

### 和・差
$$[x^n](F \pm G) = f_n \pm g_n$$

### 積
$$[x^n](FG) = \sum_{i+j=n} f_i g_j$$

### 逆元
$F$ が定数項を持たない形式的冪級数であるとき、
$$
\frac{1}{1-F} = \sum_{n=0}^{\infty} F^{n}
$$
が成り立つ。
実際、部分和が$\frac{1 - F^N}{1-F}$となり、左辺との差は$\frac{F^N}{1-F}$ となるので、$F$に定数項がなければこの式に$N$次未満の項は存在しない。

## 形式的冪級数の性質
### 係数
$A(x) = \sum_{n = 0}^{\infty} a_n x^n$について、
$$
\begin{align*}
\sum_{n\ge 0, n: 偶数} a_n x^n &= \frac{A(x) + A(-x)}{2} \\
\sum_{n\ge 0, n: 奇数} a_n x^n &= \frac{A(x) - A(-x)}{2} \\
\end{align*}
$$

## 解法の導出

### 無限和の式変形による簡略化
等比級数の無限和などの形を利用して、$n$次の係数を導く
$$
\begin{align*}
  F &= \frac{1-x}{1-2x} \\
  &= (1-x) \cdot \frac{1}{1-2x} \\
  &= (1-x) \cdot (1 + 2x + 4x^2 + 8x^3 + \cdots) \\
\end{align*}
$$

### 因数分解の利用
> $F = (x + x^{-1} + y + y^{-1})$とするとき、$[x^a y^b] F^T$ を求めよ

$$
\begin{align*}
  F &= (xy)^{-1} (x^2 y + xy^2 + x + y) \\
  &= (xy)^{-1} (xy + 1) (x + y) \\
  F^T &= (xy)^{-T} (xy + 1)^T (x + y)^T \\
  &= (xy)^{-T} \sum_{i,j} \binom{T}{i} \binom{T}{j} (xy)^i x^{j} y^{T-j} \\
  &= \sum_{i,j} \binom{T}{i} \binom{T}{j} x^{i + j - T} y ^{i - j}
\end{align*}
$$

$i + j - T = a, i - j = b$

### 累積和によるdp遷移の導出
> $F_i = 1 + x + x^2 + \cdots + x^{a_i}$とする。$[x^K] F_1 F_2 \cdots F_N$ を計算せよ。

$F_i = \frac{1 - x^{a_i + 1}}{1 - x}$ だが、疎な多項式2つで表せている。

$$
F_i = \frac{1}{1 - x} \cdot (1 - x^{a_i + 1})
$$

ある多項式$P$に$F_i$をかける操作は、次の2つに分解できる。

1. $\frac{1}{1 - x}$ をかける
2. $(1 - x^{a_i + 1})$ をかける

**1の処理**
$P = \sum_{n = 0}^{\infty} p_n x^n, \frac{P}{1 - x} = Q = \sum_{n = 0}^{\infty} q_n x^n$ を考える。$(1 - x) Q = P$とし、$[x^n]$の部分を考えると、$n \ge 1$に対して、$q_n - q_{n-1} = p_n$ が成り立つ。そのため、次のような形で計算できる。
$$
\begin{align*}
  q_n = 
  \begin{cases}
    p_0 & \text{if $n = 0$} \\
    p_n + q_{n-1} & \text{if $n \ge 1$} \\
  \end{cases}
\end{align*}
$$

**2の処理**
$P = \sum_{n = 0}^{\infty} p_n x^n, Q = (1 - x^{a_i + 1}) P =\sum_{n = 0}^{\infty} q_n x^n$ を考える。

$$
\begin{align*}
  q_n = 
  \begin{cases}
    p_n & \text{if $n \le a_i$} \\
    p_n - p_{n - a_i - 1} & \text{if $n > a_i$} \\
  \end{cases}
\end{align*}
$$

### 戻すdpの導出
> $F_i = 1 + x + x^2 + \cdots + x^{a_i}$とする。$\Pi_{j \neq i} F_j$ の$M$次以下の係数を計算せよ。

1. $F = \Pi_{j} F_j $ を計算する
2. $\Pi_{j \neq i} F_j = \frac{F}{F_i} $ として計算する

$F$から$\frac{F}{F_i}$を得る操作は次の通り
- $(1-x)$をかける：階差数列を取る
- $(1-x^{a_i+1})$で割る：$d = a_i+1$項ごとの累積和を取る

### 分割統治FFT

FFTの形には見えるが、dpテーブルを埋めるのにdpテーブルが必要になるdpで使用

+ 分割統治なので、　$[l,m)$ を再帰的に呼び出すことで、 $[0, l)$ のテーブルを確定させることができる。
+ 計算量を削減するために、畳み込みを行う際は必要なところだけを渡す必要がある。
  + `dp`: $[l, m)$
  + `g`: $l \rightarrow r$ の遷移を確保するため $[0, min(r - l, \text{size}(g)))$. 

[分割統治FFT](https://atcoder.jp/contests/abc213/editorial/2396)

## 逆元

### 逆元の存在

$f(x)$の逆元は、定数項が可逆なら存在する。

そして、次数の昇順に求められるので、必要な次数まで計算できていればいい。

[[多項式・形式的べき級数] （補足）定義や式変形の正当性の確認 | maspyのHP](https://maspypy.com/%e5%a4%9a%e9%a0%85%e5%bc%8f%e3%83%bb%e5%bd%a2%e5%bc%8f%e7%9a%84%e3%81%b9%e3%81%8d%e7%b4%9a%e6%95%b0-%ef%bc%88%e8%a3%9c%e8%b6%b3%ef%bc%89%e5%ae%9a%e7%be%a9%e3%82%84%e5%bc%8f%e5%a4%89%e5%bd%a2)

### 逆元の計算（愚直）

$$
t(x) = t_0 + t_1 x + t_2 x^2 + \cdots
$$

に対して、

$$
u(x) = u_0 + u_1 x + u_2 x^2 + \cdots
$$

が$t(x) u(x) = 1$を満たすとき、$u(x)$を$t(x)$の逆元という。

1. 定数項
    
    定数項は$t_0 u_0 = 1$となる必要があるので、$u_0 = t_0^{-1}$
    
2. それ以降
    
    $\sum_{i=0}^{n} t_i u_{n-i} = 0$となる必要があるため、
    
    $$
    u_n = t_0^{-1} \sum_{i=1}^{n} t_i u_{n-i}
    $$
    
    と計算することで順番に求めることができる。

### 逆元の計算（分割統治FFT）

$$
\begin{aligned}
f(x) &= a_0 + a_1 x + a_2 x^2 + \cdots \\
g(x) &= b_0 + b_1 x + b_2 x^2 + \cdots \\
\end{aligned}
$$

とすると、係数の比較情報から次のようになる。

$$
b_n = 
\begin{cases}
a_0^{-1} & (n = 0) \\
-a_0^{-1} \sum_{i=1}^{n} a_i b_{n-i} & (n \ge 1)
\end{cases}
$$

$c_n$を次のように定義すると

$$
c_n = 
\begin{cases}
0 & (n = 0) \\
-a_0^{-1} a_i & (n \ge 1)
\end{cases}
$$

$$
\begin{aligned}
b_n &= \sum_{i=1}^{n} c_i b_{n-1} \\
&= \sum_{i=0}^{n-1} b_i c_{n-i}
\end{aligned}
$$

```cpp
vector<mint> fps_inv(const vector<mint>& a, int N) {
  assert(!a.empty() && a[0] != 0);

  vector<mint> b(N, 0), c(N, 0);
  mint a0_inv = a[0].inv();

  b[0] = a0_inv;
  for (int i = 1; i < N; i++) {
    c[i] = -a[i] * a0_inv;
  }

  auto solve = [&](auto&& self, int l, int r) -> void {
    if (r - l == 1) return;
    int m = (l + r) / 2;

    self(self, l, m);

    vector<mint> A(b.begin() + l, b.begin() + m);
    vector<mint> B(c.begin(), c.begin() + (r - l));
    vector<mint> C = convolution(A, B);

    for (int t = m; t < r; t++) {
      if (t - l < (int)C.size()) b[t] += C[t - l];
    }

    self(self, m, r);
  };

  solve(solve, 0, N);
  return b;
}
```

### 逆元の計算（Newton法）

多項式$g_k \coloneqq g(x) \pmod{x^k}$とする（$k$次以下の係数は全て求まっているという意味）。

$$
\begin{aligned}
u_k - u_{2k} \equiv 0 \pmod{x^k}
\end{aligned}
$$

なので、

$$
\begin{aligned}
(u_k - u_{2k})^2 \equiv u_k^{2} - 2u_k u_{2k} + u_{2k}^{2} \equiv 0 \pmod{x^{2k}}
\end{aligned}
$$

となる。

ここで両辺に$t$を掛けると、$tu_{2k} \equiv 1 \pmod{x^{2k}}$となるので、

$$
\begin{aligned}
tu_k^{2} - 2u_k + u_{2k} &\equiv 0 \pmod{x^{2k}} \\
u_{2k} &\equiv 2 u_k - t u_k^2 \pmod{x^{2k}} \\
\end{aligned}
$$

となる。

```cpp
vector<mint> fps_inv(const vector<mint>& f, int deg) {
  assert(!f.empty());
  assert(f[0] != 0);

  // u_1 = 1 / f[0]
  vector<mint> g(1, f[0].inv());

  int m = 1;
  while (m < deg) {
    int need = min(2 * m, deg);

    // f の先頭 need 項だけ使えば十分
    vector<mint> f_cut(min((int)f.size(), need));
    for (int i = 0; i < (int)f_cut.size(); i++) {
      f_cut[i] = f[i];
    }

    // fg = f * g mod x^need
    vector<mint> fg = convolution(f_cut, g);
    fg.resize(need);

    // h = 2 - f*g
    vector<mint> h(need);
    h[0] = 2;
    for (int i = 0; i < need; i++) {
      h[i] -= fg[i];
    }

    // g_new = g * (2 - f*g) mod x^need
    g = convolution(g, h);
    g.resize(need);

    m = need;
  }

  return g;
}
```

<aside>

**両辺を二乗してもいい理由**

$u_k - u_{2k} \equiv 0 \pmod{x^k}$というのは、ある多項式$q(x)$があって$u_k - u_{2k} = x^{k}q(x)$と書けるという意味。

この式の両辺を二乗すると、$(u_k - u_{2k})^{2} = x^{2k}q(x)^2$となるので、$(u_k - u_{2k})^2 \equiv 0 \pmod{x^{2k}}$ となる。

</aside>

[Editorial - AtCoder Beginner Contest 260](https://atcoder.jp/contests/abc260/editorial/4434)

## log

### 概要

$$
\log F(x) = \int \frac{F^{\prime}(x)}{F(x)} dx
$$

で求められる。$F^{-1}(x)$が存在するために$F(0)=1$である必要がある。

### logの導出

### 微分操作

$$
F(x) = \sum_{n \ge 0} a_n x^n \Rightarrow F^\prime(x) = \sum_{n \ge 1} n a_n x^{n-1} 
$$

なので、係数をかけてからずらせばいい

### 積分操作

$$
G(x) = \sum_{n \ge 0} b_n x^n \Rightarrow \int G(x) = \sum_{n \ge 0} \frac{b_n}{n+1} x^{n+1} 
$$

$\log F(0) = \log 1 = 0$となることより、$G(0) = 0$

## exp

### 概要

$$
\exp{F(x)} = \sum_{k=0}^{\infty} \frac{F(x)^k}{k!}
$$

$F(0) = 0$とする。

$F(x)^k$の次数が少なくとも$k$になるので、固定した次数$x^n$の係数を見ると$k \le n$の有限個しか寄与しなくしたいからである。

$F(0) \neq 0$だとしたら次のように書き換えればいい。$F(x) = a_0 + \tilde{F}(x)$とすることで$\tilde{F}(0) = 0$ となる。

$$
\exp{F(x)} = \exp{(a_0 + \tilde{F}(x))} = \exp{a_0} \cdot \exp{\tilde{F}(x)}
$$

### expの求め方

$$
G(x) = \exp{F(x)}
$$

を求めたい。

ここで、すでにある段階で

$$
G_m(x) \equiv \exp{F(x)} \pmod{x^m}
$$

がわかっているとする。

$F(x)$と$\log G_m(x)$はまだずれているので、

$$
E(x) \coloneqq F(x) - \log G_m(x)
$$

と定義する。

今$G_m$は$\mod{x^m}$では正しいので、

$$
\log G_m(x) \equiv F(x) \pmod{x^m}
$$

となる。したがって、

$$
E(x) \equiv 0 \pmod{x^m}
$$

となる。ここで、

$$
\begin{aligned}
\log G(x) - \log G_m(x) &= F - \log G_m(x) = E \\
\log \frac{G(x)}{G_m(x)} &= E \\
\frac{G(x)}{G_m(x)} &= \exp{E(x)} \\
G(x) &= G_m(x) \exp{E(x)}
\end{aligned}
$$

ここで、$E(x)^2 \equiv 0 \pmod{x^{2m}}, E(x)^3 \equiv 0 \pmod{x^{3m}}$なので、

$$
\exp{E(x)} = 1 + E(x) + \frac{E(x)^2}{2!} + \cdots \equiv 1 + E \pmod{x^{2m}}
$$

$$
G(x) = G_m(x) \exp{E(x)} \equiv G_m(x) (1 + E(x)) \pmod{x^{2m}}
$$

つまり、

$$
G_{2m}(x) \coloneqq G_m(x) (1 + F - \log G_m(x)) \pmod{x^{2m}}
$$

## 実装

```cpp title="FPS.cpp"
#include <bits/stdc++.h>

#include <atcoder/all>

using namespace std;
using namespace atcoder;

// 形式的べき級数ライブラリ
//
// 想定:
// - mint は static_modint 系
// - 積は ACL の convolution を使うので、基本的には modint998244353 向け
//
// 基本的な使い方:
// FPS f = {1, 2, 3};          // 1 + 2x + 3x^2
// FPS g = {4, 5};             // 4 + 5x
// auto a = f + g;             // 和
// auto b = f - g;             // 差
// auto c = f * g;             // 積
// auto d = f.pre(5);          // 先頭 5 項を取得。足りない分は 0
// auto e = f.diff();          // 微分
// auto h = f.integral();      // 積分。積分定数は 0
//
// 高度な関数の前提:
// - inv(deg): f[0] != 0
// - log(deg): f[0] == 1
// - exp(deg): f[0] == 0
// - pow(k, deg): 一般の FPS に使える
//
// 使用例:
// FPS a = {1, 3, 2};
// auto ia = a.inv(6);         // 1 / a mod x^6
// auto la = a.log(6);         // log(a) mod x^6
//
// FPS b = {0, 1, 2};
// auto eb = b.exp(6);         // exp(b) mod x^6
// auto pb = b.pow(3, 6);      // b^3 mod x^6
//
// シフト:
// - (f >> k): 先頭 k 項を捨てる。x^k で割るイメージ
// - (f << k): 先頭に 0 を k 個足す。x^k を掛けるイメージ
//
template <class mint>
struct FormalPowerSeries : vector<mint> {
  using vector<mint>::vector;
  using FPS = FormalPowerSeries;

  // f += g
  FPS &operator+=(const FPS &r) {
    if (this->size() < r.size()) this->resize(r.size());
    for (int i = 0; i < (int)r.size(); i++) (*this)[i] += r[i];
    return *this;
  }

  // f -= g
  FPS &operator-=(const FPS &r) {
    if (this->size() < r.size()) this->resize(r.size());
    for (int i = 0; i < (int)r.size(); i++) (*this)[i] -= r[i];
    return *this;
  }

  // f *= c
  FPS &operator*=(const mint &v) {
    for (auto &x : *this) x *= v;
    return *this;
  }

  // f /= c
  FPS &operator/=(const mint &v) {
    return *this *= v.inv();
  }

  // f *= g
  // 形式的べき級数の積。多項式の畳み込みと同じ
  FPS &operator*=(const FPS &r) {
    vector<mint> res = convolution(vector<mint>(*this), vector<mint>(r));
    this->assign(res.begin(), res.end());
    return *this;
  }

  FPS operator+(const FPS &r) const { return FPS(*this) += r; }
  FPS operator-(const FPS &r) const { return FPS(*this) -= r; }
  FPS operator*(const FPS &r) const { return FPS(*this) *= r; }
  FPS operator/(const FPS &g) const { return divmod(g).first; }
  FPS operator%(const FPS &g) const { return divmod(g).second; }
  FPS operator*(const mint &v) const { return FPS(*this) *= v; }
  FPS operator/(const mint &v) const { return FPS(*this) /= v; }

  void shrink() {
    while (!this->empty() && this->back() == mint(0)) this->pop_back();
  }

  // 先頭 deg 項だけ取り出す。足りない場合は 0 埋め
  FPS pre(int deg) const {
    FPS res(this->begin(), this->begin() + min<int>(this->size(), deg));
    if ((int)res.size() < deg) res.resize(deg, mint(0));
    return res;
  }

  // 先頭 deg 項だけ取り出す。足りなくても 0 埋めしない
  FPS cut(int deg) const {
    return FPS(this->begin(), this->begin() + min<int>((int)this->size(), deg));
  }

  // 係数を反転する
  // a0 + a1 x + ... + a_{n-1} x^{n-1}
  // -> a_{n-1} + ... + a1 x^{n-2} + a0 x^{n-1}
  FPS rev(int deg = -1) const {
    FPS res(*this);
    if (deg != -1) res.resize(deg, mint(0));
    reverse(res.begin(), res.end());
    return res;
  }

  // x^k で割るイメージで先頭 k 項を落とす
  FPS operator>>(int k) const {
    if ((int)this->size() <= k) return {};
    return FPS(this->begin() + k, this->end());
  }

  // x^k を掛けるイメージで先頭に 0 を k 個足す
  FPS operator<<(int k) const {
    FPS res(k, mint(0));
    res.insert(res.end(), this->begin(), this->end());
    return res;
  }

  // 微分: a0 + a1 x + a2 x^2 + ... -> a1 + 2 a2 x + 3 a3 x^2 + ...
  FPS diff() const {
    if (this->empty()) return {};
    FPS res(max<int>(0, this->size() - 1));
    for (int i = 1; i < (int)this->size(); i++) res[i - 1] = (*this)[i] * i;
    return res;
  }

  // 積分: 積分定数は 0
  FPS integral() const {
    FPS res(this->size() + 1);
    res[0] = mint(0);
    for (int i = 0; i < (int)this->size(); i++) res[i + 1] = (*this)[i] / mint(i + 1);
    return res;
  }

  // 逆数
  // 戻り値は 1 / f mod x^deg
  // 条件: f[0] != 0
  FPS inv(int deg = -1) const {
    assert(!this->empty() && (*this)[0] != mint(0));
    if (deg == -1) deg = (int)this->size();
    FPS res{(*this)[0].inv()};
    int m = 1;
    while (m < deg) {
      m <<= 1;
      FPS f = this->cut(m);
      FPS nr = res * res * f;
      res = (res + res - nr).cut(m);
    }
    return res.pre(deg);
  }

  // 対数
  // 戻り値は log(f) mod x^deg
  // 条件: f[0] == 1
  FPS log(int deg = -1) const {
    assert(!this->empty() && (*this)[0] == mint(1));
    if (deg == -1) deg = (int)this->size();
    return (this->diff() * this->inv(deg)).pre(deg - 1).integral();
  }

  // 指数
  // 戻り値は exp(f) mod x^deg
  // 条件: f[0] == 0
  FPS exp(int deg = -1) const {
    assert(this->empty() || (*this)[0] == mint(0));
    if (deg == -1) deg = (int)this->size();
    FPS res{mint(1)};
    int m = 1;
    while (m < deg) {
      m <<= 1;
      FPS lhs = this->cut(m);
      FPS rhs = res.log(m);
      lhs -= rhs;
      lhs[0] += mint(1);
      res = (res * lhs).cut(m);
    }
    return res.pre(deg);
  }

  // べき乗
  // 戻り値は f^k mod x^deg
  // 先頭に 0 がある場合も自動で処理する
  FPS pow(long long k, int deg = -1) const {
    if (deg == -1) deg = (int)this->size();
    if (deg == 0) return {};
    if (k == 0) {
      FPS res(deg, mint(0));
      res[0] = mint(1);
      return res;
    }
    int lead = 0;
    while (lead < (int)this->size() && (*this)[lead] == mint(0)) lead++;
    if (lead == (int)this->size()) return FPS(deg, mint(0));
    if ((__int128)lead * k >= deg) return FPS(deg, mint(0));

    mint c = (*this)[lead];
    FPS g = ((*this) >> lead) / c;
    FPS res = (g.log(deg - lead * k) * mint(k)).exp(deg - lead * k) * c.pow(k);
    return (res << (lead * k)).pre(deg);
  }

  // 多項式除算
  // this = q * g + r, deg(r) < deg(g)
  // 戻り値: {q, r}
  pair<FPS, FPS> divmod(FPS g) const {
    FPS f(*this);
    f.shrink();
    g.shrink();

    assert(!g.empty());  // 0 で割ってはいけない

    if (f.size() < g.size()) {
      return {FPS{}, f};
    }

    int n = (int)f.size();
    int m = (int)g.size();
    int q_size = n - m + 1;

    // 商 Q を求める
    // f = qg + r
    // (高次を消すために反転する)
    // rev(f) = rev(q) rev(g) mod x^{q_size}
    // rev(q) = rev(f) / rev(g) mod x^{q_size}
    FPS rf = f.rev();
    FPS rg = g.rev();

    FPS q = (rf.pre(q_size) * rg.inv(q_size)).pre(q_size).rev();

    // 余り r = f - qg
    FPS r = f - q * g;

    // deg(r) < deg(g) なので、下 m-1 項だけ残す
    if ((int)r.size() > m - 1) r.resize(m - 1);
    r.shrink();

    q.shrink();
    return {q, r};
  }
};

using mint = modint998244353;
using FPS = FormalPowerSeries<mint>;
```
