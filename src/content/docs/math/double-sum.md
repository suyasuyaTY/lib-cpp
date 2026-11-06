---
title: "二重和"
sidebar:
  order: 13
---
## 内側の和が区間に関する関数

## 累積和

$$
\begin{aligned}    \sum_{1 \le l \le r \le N} f \left( \sum_{l \le k \le r} A_k \right) &= \sum_{1 \le l \le r \le N} f( S_{r} - S_{l-1}) \\    &= \sum_{0 \le l < r \le N} f( S_{r} - S_{l}) \\    &= \sum_{r = 0}^{N} \sum_{l = 0}^{r - 1} f( S_{r} - S_{l}) \\\end{aligned}
$$

## dpに変換

$T_r = \sum_{l = 1}^{r} f\left( \sum_{k = l}^{r} A_k \right)$をdpで求める

$$
\begin{aligned}    \sum_{1 \le l \le r \le N} f \left( \sum_{l \le k \le r} A_k \right) &= \sum_{r = 1}^{N} T_{r} \\\end{aligned}
$$
