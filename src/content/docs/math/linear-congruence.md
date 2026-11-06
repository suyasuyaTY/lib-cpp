---
title: "合同方程式"
tags: [number-theory, modular]
sidebar:
  order: 5
---
$an \equiv b \pmod {M}$ を満たす $n$ が存在するかを判定する方法

## $b = 0$ の場合

> $$ax \equiv 0 \pmod{M} \Leftrightarrow x \equiv 0 \pmod{\frac{M}{\gcd(M,a)}}$$
> **証明**
> 合同式を整数の等式に変換すると、 
> $$ax = kM$$
> と書ける。 $a, M$ を $gcd(a,M)$ で割ったものを $a', M'$ とすると、
> $$a'x = M'k$$
> この式は、 $a'x$ は $M'$ の倍数であることを表しているが、 $a'$ と $M'$ は互いに素であるため $x$ が $M'$ の倍数でなければならない。

> $$\frac{x}{b} \in \mathbb{Z} \land \frac{x}{b} \equiv 0 \pmod{M} \Leftrightarrow x \equiv 0 \pmod{bM}$$
> **証明**
> $\frac{x}{b} \equiv 0 \pmod{M}$ より $\frac{x}{b}$ は $M$ の倍数であり、 $\frac{x}{b} \in \mathbb{Z}$ より $x$ は $b$ の倍数である。 すなわち、 $x$ は $bM$ の倍数である必要がある。
