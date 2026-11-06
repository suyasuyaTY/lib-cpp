---
title: "整数論"
tags: [number-theory]
sidebar:
  order: 2
---
## 拡張Euclidの互除法

```cpp
// 返り値: a と b の最大公約数
// ax + by = gcd(a, b) を満たす (x, y) が格納される
long long extGCD(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    // a = qb + r (0 <= r < b) とする。
    // gcd(a,b) = gcd(b,r) が成り立つので, bX + rY = d を満たす (X,Y) が存在
    // bX + rY = d => bX + (a - qb) Y = d => aY + b(X - qY) = d
    // x = Y, y = X - qY となる。
    long long d = extGCD(b, a%b, y, x);
    y -= a/b * x;
    return d;
}
```

## 一般解

$ax + by = k \cdot d$の一般解は、`extGCD(a,b,x,y)` で求めた解を$(x_0, y_0)$とすると次のように書ける

$$
x = k x_0 + \frac{b}{d} t, y = k y_0 - \frac{a}{d} t
$$

## Bezoutの等式

> 
> 
> 
> 任意の整数$a_1,a_2,\dots,a_n$に対して、$d = \text{gcd}(a_1,a_2,\dots,a_n)$とすると、
> 
> $$
> a_1 x_1 + a_2 x_2 + \cdots a_n x_n = d
> $$
> 
> を満たす整数$x_1,x_2,\cdots,x_n$が存在する。
> 

証明：$2$変数の時に成り立つことを利用して、帰納法を使うことで求めることができる

## **Schwartz–Zippel の補題**

- $n=1$
    - $f(x_1)$ の解の個数は最大でも$d$個
    - $\mathbb{F}_p$の元は$p$個なので、最大でも$\frac{d}{p}$となる
- 帰納法
    - $f(a_1,a_2,\dots,a_n,a_{n+1}) = 0$となる確率は次の確率の和で抑えられる
        - $g_k(a_1,\dots,a_n)=0$になる確率
        - $g_k(a_1,\dots,a_n) \neq 0$ かつ$f(a_1,a_2,\dots,a_n,a_{n+1}) = 0$になる確率

[素数を法とする多項式 - AtCoderInfo](https://info.atcoder.jp/entry/algorithm_lectures/polynomial_over_Fp)
