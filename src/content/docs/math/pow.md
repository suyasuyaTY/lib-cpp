---
title: "べき乗"
tags: [modular]
sidebar:
  order: 3
---
整数のべき乗と、上限を超えたら打ち切るべき乗を計算する。`powll`, `safe_pow`

## 実装

```cpp title="pow.cpp"
long long powll(long long x, long long n) {
  long long ret = 1;
  while (n > 0) {
    if (n & 1) ret *= x;
    x *= x;
    n >>= 1;
  }
  return ret;
}

long long safe_pow(long long a, long long b) {
  long long res = 1;
  for (long long i = 0; i < b; i++) {
    double dres = res;
    dres *= a;
    if (dres > 2e18) {
      return 2e18;
    }
    res *= a;
  }
  return res;
}
```
