---
title: "区分線形関数を imos で加算する方法"
tags: [dp-optimization]
sidebar:
  order: 9
---
## 概要

`dp`の遷移において、ある状態から複数の遷移先へ

$$
\begin{aligned}
f(x) &= \min(k, x - l) \\
f(x) &= \min(k, l - x) \\
f(x) &= \max(k, x - l) \\
f(x) &= \max(k, l - x) \\
\end{aligned}
$$

のような関数を加算したい場合に、imos法を使って高速に処理する方法。

- 区間ごとに見ると、一次関数になっているので、一次の項の係数と定数項を別々のimos配列で管理することで、1つの関数を$O(1)$の区間更新として処理できる。

## 方針

区間$[L,R)$に$ax+b$を加える場合、次の二つの差分配列を用意する

- `diffA`：`x`の係数を管理
- `diffB`：定数項を管理

そして最後に累積和を使って、$a,b$を求めながら、$ax+b$の値を出す

```cpp
vector<long long> diffA(N + 2);
vector<long long> diffB(N + 2);
auto add_linear = [&](int L, int R, long long a, long long b) { 
	L = max(L, 0);
	R = min(R, N + 1);
	if (L >= R) return; 
	diffA[L] += a; 
	diffA[R] -= a; 
	diffB[L] += b; 
	diffB[R] -= b; 
};

long long A = 0;
long long B = 0;

for (int x = 0; x <= N; x++) {
    A += diffA[x];
    B += diffB[x];

    dp[x] += A * x + B;
}
汎用関数
```
