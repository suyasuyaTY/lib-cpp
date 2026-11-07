---
title: "和の高速化"
tags: [sqrt]
sidebar:
  order: 12
---
## 1. 概要

愚直に計算すると項数ぶんの時間がかかる和を、速く求めるための変形を集める.
手法ごとに 3 章の節として追加していく.

| 節 | 対象の和 | 計算量 |
| --- | --- | --- |
| [3.1](#31-対称性を使う双曲線法) | $\sum_{k=1}^{N} \lfloor N/k \rfloor$ | $O(\sqrt{N})$ |

## 2. 前提知識

- [切り上げ、切り捨て](../../math/floor-ceil-division/)

## 3. 和の高速化の手法

### 3.1. 対称性を使う（双曲線法）

$M = \lfloor \sqrt{N} \rfloor$ とすると、

$$
\sum_{k=1}^{N} \left\lfloor \frac{N}{k} \right\rfloor = 2 \sum_{k=1}^{M} \left\lfloor \frac{N}{k} \right\rfloor - M^{2}
$$

が成り立ち、$O(\sqrt{N})$ で計算できる.

```cpp
auto floor_quotient_sum = [](long long N) -> long long {
  long long M = sqrtl(N);
  while (M * M > N) M--;
  while ((M + 1) * (M + 1) <= N) M++;  // M = floor(√N)

  long long res = 0;
  for (long long k = 1; k <= M; k++) {
    res += N / k;
  }
  return 2 * res - M * M;
};
```

<details>
<summary>証明</summary>

$i$ を固定すると $ij \leq N$ を満たす正整数 $j$ は $\lfloor N/i \rfloor$ 個なので、左辺は $ij \leq N$ を満たす正整数の組 $(i, j)$ の個数である.

$i, j > M$ なら $ij \geq (M+1)^2 > N$ なので、どの組も $i \leq M$ または $j \leq M$ を満たす.

- $i \leq M$ を満たす組: $\sum_{i=1}^{M} \lfloor N/i \rfloor$ 個
- $j \leq M$ を満たす組: 対称性より同じく $\sum_{j=1}^{M} \lfloor N/j \rfloor$ 個
- 両方を満たす組: $M^2 \leq N$ なので $M^2$ 個すべて

包除原理より結論を得る. $\square$

</details>

切り上げの和は、$N \geq 1$ のとき $\lceil N/k \rceil = \lfloor (N-1)/k \rfloor + 1$ を使って

$$
\sum_{k=1}^{N} \left\lceil \frac{N}{k} \right\rceil = N + \sum_{k=1}^{N-1} \left\lfloor \frac{N-1}{k} \right\rfloor
$$

と床関数の和に帰着できる（$k = N$ の項は $\lfloor (N-1)/N \rfloor = 0$）.

## 4. 参考資料

- [Dirichlet hyperbola method - Wikipedia](https://en.wikipedia.org/wiki/Dirichlet_hyperbola_method)（双曲線 $ij = N$ の下の格子点を対称性で数える方法）
