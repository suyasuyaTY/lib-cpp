---
title: "典型変形"
tags: [counting]
sidebar:
  order: 15
---
## ヴァンデルモンドの畳み込み

$$
\begin{align*}  \sum_{k \ge 0} \binom{p}{k} \cdot \binom{q}{k} &= \sum_{k \ge 0} \binom{p}{k} \cdot \binom{q}{q - k} \\  &= \sum_{k_1 + k_2 = q} \binom{p}{k_1} \cdot \binom{q}{k_2} \\  &= [x^q] \left( \sum_{k_1 = 0}^{p} \binom{p}{k_1} x^{k_1} \right) \left( \sum_{k_2 = 0}^{q} \binom{q}{k_2} x^{k_2} \right) \\  &= [x^q] (x + 1)^{p+q} \\  &= \binom{p+q}{q}\end{align*}
$$

## 二項係数の展開

$$
\begin{aligned}    \sum_{k = 0}^{X} \binom{X}{k} A_{k} B_{X - k} &= X! \sum_{k = 0}^{X} \frac{A_k}{k!} \frac{B_{X-k}}{(X-k)!} \\    &= X! [x^{X}] A(x) B(x) \\    A(x) &= \sum_{k = 0}^{\infty} \frac{A_k}{k!} \\    B(x) &= \sum_{k = 0}^{\infty} \frac{B_k}{k!} \\\end{aligned}
$$

## 累乗和

$$
\begin{aligned}    P(x) &= \prod_{i=1}^{N} (1 - A_ix) \\    \log P(x) &= \sum_{i=1}^{N} \log (1 - A_ix) \\    \frac{P'(x)}{P(x)} &= -\sum_{i=1}^{N} \frac{A_i}{1 - A_i x} \\    - \frac{P'(x) x}{P(x)} &= \sum_{i=1}^{N} \frac{A_i x}{1 - A_i x} \\    &= \sum_{i=1}^{N} \sum_{k=1}^{\infty} A_i^k x^k \\    &= \sum_{k=1}^{\infty} \sum_{i=1}^{N} A_i^k x^k \\     &= \sum_{k=1}^{\infty} S_k x^k\end{aligned}
$$
