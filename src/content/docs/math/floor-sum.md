---
title: "床関数の和（商の種類による分割）"
tags: [sqrt]
sidebar:
  order: 12
---
$k_0 = \lfloor \sqrt{N} \rfloor$

$$
\begin{aligned}
x \le \lfloor \frac{N}{k} \rfloor < x + 1 \\
x \le  \frac{N}{k}  < x + 1 \\
\frac{N}{x+1} < k \le \frac{N}{x} \\
\lfloor \frac{N}{x+1} \rfloor < k \le \lfloor \frac{N}{x} \rfloor \\
\end{aligned}
$$

$$
\sum_{k=1}^{N} \left \lfloor \frac{N}{k} \right \rfloor = \sum_{k=1}^{\frac{N}{k_0+1}} \left \lfloor \frac{N}{k} \right \rfloor + \sum_{k=1}^{k_0} k \left( \left \lfloor \frac{N}{k} \right \rfloor - \left \lfloor \frac{N}{k+1} \right \rfloor \right)
$$

```cpp
ll gauss_sum(ll N) {
  ll res = 0, k0 = sqrt(N);
  while (k0 * k0 < N) {
    k0 += 1;
  }
  while (k0 * k0 > N) {
    k0 -= 1;
  }

  for (ll k = 1; k <= k0; k++) res += k * (N / k - N / (k + 1));
  for (ll k = 1; k <= N / (k0 + 1); k++) res += N / k;
  return res;
}
```
