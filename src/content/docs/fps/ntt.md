---
title: "NTT, Inverse NTT"
tags: [convolution]
sidebar:
  order: 2
---
## NTTの概要

## どのような変換を行うのか

- 多項式$A(x) = a_0 + a_1 x + a_2 x^2 + \cdots + a_{n-1} x^{n-1}$を、$n$点で評価する処理
    - $A(\omega^{0}),A(\omega^{1}),\dots, A(\omega^{n-1})$
    - $\omega$：$\omega^{n} = 1$を満たし、周期がちょうど$n$になる$\omega$をとる
        - 998244353 だと$n = 2^{0},\dots, 2^{23}$まで$\omega$をとることができる

## なぜ畳み込みが速くなるのか

- 多項式：$C(x) = A(x) B(x)$
    - $n$点で評価できればいい
    - $C(\omega^{0}),C(\omega^{1}),\dots, C(\omega^{n-1}) = A(\omega^{0}) B(\omega^{0}),A(\omega^{1}) B(\omega^{1}),\dots, A(\omega^{n-1}) B(\omega^{n-1})$
- 係数同士の畳み込みは大変だが、値に変換してしまえば各点で掛け算するだけになる

## アルゴリズム

1. 多項式を偶数次と奇数次に分ける
    
    $$
    \begin{aligned}
    A(x) &= E(x^2) + x O(x^2) \\
    E(x) &= a_0 + a_2 x + a_4 x^2 + \cdots \\
    O(x) &= a_1 + a_3 x + a_5 x^2 + \cdots \\
    \end{aligned}
    $$
    
2. ある$\omega$に対して次のようになるので、2個の値を作れる
    
    $$
    \begin{aligned}
    A(\omega^{j}) &= E(\omega^{2j}) + \omega^{j} O(\omega^{2j}) \\
    A(\omega^{j + n/2}) &= E(\omega^{2j}) - \omega^{j} O(\omega^{2j}) \\
    \end{aligned}
    $$
    
3. 分割統治をすることで、$O(n\log n)$ですべての値を評価することができる

## INTTの概要

## どのような変換を行うのか

- NTTは$A(\omega^{0}),A(\omega^{1}),\dots, A(\omega^{n-1})$を求める処理
- NTT後の配列$B$
    
    $$
    b_{j} = \sum_{i=0}^{n-1} a_{i} w^{ij}
    $$
    
- INTTでは$B$から元の配列$A$を復元したい
    
    $$
    a_{i} = \frac{1}{n}\sum_{j=0}^{n-1} b_{j} w^{-ij}
    $$
    
- つまり、NTTで使った$\omega$の代わりに$\omega^{-1}$を使用すればいい

## NTT → INTT

長さ$n$のNTTを使って同じ長さ$n$のまま戻すと、巡回畳み込みが求まる

$$
c_k = \sum_{i+j \equiv k \pmod{n}} a_i b_j
$$

## ACLでの使い方

```cpp
// NTT: 係数表現 -> 値表現
internal::butterfly(f);

// NTT 後の世界で操作する
for (auto &x : f) {
    x = x.pow(10);
}

// INTT: 値表現 -> 係数表現っぽいもの
internal::butterfly_inv(f);

// ここが大事：最後に長さ M で割る
mint invM = mint(M).inv();
for (auto &x : f) {
    x *= invM;
}
```
