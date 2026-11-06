---
title: "商の余り"
tags: [modular]
sidebar:
  order: 11
---
$\lfloor \frac{N}{M} \rfloor \pmod{L}$ を求めたい

$$
N = (M \cdot L) p + r
$$

ここで全体を$M$で割ると

$$
\left\lfloor \frac{N}{M} \right\rfloor = L p + \left\lfloor \frac{r}{M} \right\rfloor
$$

以上より

$$
\left\lfloor \frac{N}{M} \right\rfloor \pmod L = \left\lfloor \frac{r}{M} \right\rfloor \pmod L
$$
