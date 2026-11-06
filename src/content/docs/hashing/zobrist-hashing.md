---
title: "Zobrist hashing"
tags: [hashing, randomized]
sidebar:
  order: 1
---
## ハッシュ関数の条件

- 多重集合$S$のハッシュ値$H(S)$が高速に計算できる
- 2つの多重集合$S,T$が一致している→$H(S)=H(T)$
- 2つの多重集合$S,T$が一致していない→高確率で$H(S) \neq H(T)$

## ハッシュ関数の例

- 整数にランダムにハッシュ値を設定し累積和→多重集合対応
- 整数にランダムにハッシュ値を設定し累積xor→多重集合非対応

[集合をハッシュする (Zobrist hashing)](https://trap.jp/post/1594/)
