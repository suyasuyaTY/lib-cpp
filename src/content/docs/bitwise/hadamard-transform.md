---
title: "アダマール変換（XOR畳み込み）"
tags: [xor, convolution]
sidebar:
  order: 3
---
## 概要

XOR畳み込みを高速に計算するための変換手法

**XOR畳み込み**

$$
h[k] = \sum_{i \oplus j = k} f[i] \cdot g[j]
$$

畳み込みのままだと、一回の計算に$O(N^2)$かかるが、$O(N)$でよくなるのがうれしい。

## アルゴリズム

```cpp
// a の配列を 2^n の形にしておく
template <class T>
void hadamard_transform(vector<T>& a) {
    int n = (int)a.size();
    for (int len = 1; len < n; len <<= 1) {
        for (int i = 0; i < n; i += len << 1) {
            for (int j = 0; j < len; j++) {
                T x = a[i + j];
                T y = a[i + j + len];
                a[i + j] = x + y;
                a[i + j + len] = x - y;
            }
        }
    }
}
```

## 証明

<aside>

## 定義1

$2^n \times 2^n$行列$H_n$を

$$
\begin{aligned}    
H_0 &= 1 \\
H_n &=
\begin{bmatrix}
H_{n - 1} & H_{n - 1} \\
H_{n - 1} & -H_{n - 1} \\    \end{bmatrix}
\end{aligned}
$$

と定める。$H_n$が定める変換を**アダマール変換**という。

</aside>

<aside>

## 定義2

アダマール行列$H_n$に対し、

$$
H_n H_n = 2^n I_n
$$

が成り立つ。

</aside>

<aside>

## 定義3

$H_n$をアダマール行列、$a,b$を長さ$2^n$のベクトル、$c$を定数とすると、

$$
\begin{aligned}    H_n(ca) &= cH_n(a) \\    H_n(a + b) &= H_n(a) + H_n(b) \\\end{aligned}
$$

が成り立つ。

</aside>

<aside>

## 定義4

$H_n$をアダマール行列、$a,b$を長さ$2^n$のベクトルとすると

$$
(H_n(a * b))_k = (H_n a)_k (H_n b)_k
$$

が成り立つ。

</aside>

<aside>

## 定義5

$a$を長さ$2^n$のベクトルとすると、$H_n a$は$O(n 2^n)$で計算できる。

</aside>

## 1. 添え字を bit 列だと考える

長さ$2^n$のベクトルの添え字を、$n$ bit列とみなす。

さらに、各$s \in \{0, 1\}^n$に対して、

$$
\chi_s(x) \coloneqq (-1)^{s \cdot x}
$$

と定める。ここで、

$$
s \cdot x \coloneqq s_1 x_1 + \cdots + s_n x_n \pmod{2}
$$

この$\chi_s$を使うと、アダマール変換は、

$$
\hat{f}(s) = \sum_{x \in \{0,1\}^n} \chi_s(x) f(x)
$$

と書くことができる。

## 2. 1 と 定義1の対応の証明

1. $n = 0$
    
    $H_0 = \chi_0(0) = 1$となるのでOK
    
2. 帰納法
    
    $H_{n - 1}$の成分が、$(H_{n - 1})_{s', x'} = \chi_{s'}(x')$と表せると仮定する。
    
    $s=(\sigma, s'), x = (\xi, x')$と最初の 1 bitで分けると$H_n$の定義より
    
    $$
    (H_n)_{s,x} = (-1)^{\sigma \xi} (H_{n - 1})_{s', x'}
    $$
    
    となり、帰納法の仮定を使えば、
    
    $$
    (H_n)_{s,x} = (-1)^{s' \cdot x' + \sigma \xi} = (-1)^{s \cdot x}
    $$
    
    となるので示すことができた。

## 3. $\chi_s(x \oplus y) = \chi_s(x) \chi_s(y)$

xor は bit ごとの mod 2 和なので、

$$
s \cdot (x \oplus y) = s \cdot x + s \cdot y \pmod{2}
$$

となる。したがって、

$\chi_s(x \oplus y) = (-1)^{s \cdot(x \oplus y)} = (-1)^{s \cdot x + s \cdot y} = (-1)^{s \cdot x} (-1)^{s \cdot y} = \chi_s(x) \chi_s(y)$

と$\chi_s$は xor を席に変える関数となっている。

## 4. 定義4の証明

$h = f * g$のアダマール変換を計算すると、

$$
\begin{aligned}\hat{h}[s] &= \sum_{k} \chi_s(k) h[k] = \sum_{k} \chi_s(k) \sum_{x \oplus y = k} f[x] g[y] \\&= \sum_{x,y} \chi_s(x \oplus y) f[x] g[y]  = \sum_{x,y} \chi_s(x) \chi_s(y) f[x] g[y] \\&= \left( \sum_{x} \chi_s(x) f[x] \right) \left( \sum_{y} \chi_s(y) g[y] \right) \\&= \hat{f}(s) \hat{g}(s)\end{aligned}
$$
