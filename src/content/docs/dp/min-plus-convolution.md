---
title: "凸数列の min-plus 畳み込み"
tags: [convolution, convexity]
sidebar:
  order: 10
---
## 概要

2つの整数列 $A=(A_{0}, A_{1}, \dots, A_{N}), B=(B_{0}, B_{1}, \dots, B_{M})$ に対して、　$C_{k} = \min_{k = i + j} (A_{i} + A_{j})$ により定義される列 $C=(C_{0}, \dots, C_{N+M})$ を $A,B$ の min-plus 畳み込みという。

- $A, B$ のうち、少なくとも一方に凸性がある場合には、min-plus畳み込みを高速に行うことができる
- 両方凸性を持っているともっと簡単

## 証明の補足

- $C_{0} = A_{0} + B_{0}$
- $C_{k}$ を求めることは、下に凸という条件から袋 $A,B$ から小さい順に $k$ 個選ぶことに等しい
- 小さい順にとっているので、$C$ も下に凸になる

## 実装

### min-plus畳み込み

```cpp
auto min_plus_convlution = [](const vector<ll> &A, const vector<ll> &B) -> vector<ll> {
    int N = A.size(), M = B.size();

    vector<ll> C(N + M - 1);
    for (int k = 0, i = 0, j = 0; k < N + M - 1; k++) {
        C[k] = A[i] + B[j];
        // A[i+1] を先に追加 => A[i+1] - A[i] <= B[j+1] - B[j] 
        if (j == M - 1 || (i + 1 < N && A[i + 1] + B[j] <= A[i] + B[j + 1])) {
        i++;
        } else {
        j++;
        }
    }
    return C;
};
```

### max-plus畳み込み

```cpp
auto max_plus_convlution = [](const vector<ll> &A, const vector<ll> &B) -> vector<ll> {
    int N = A.size(), M = B.size();

    vector<ll> C(N + M - 1);
    for (int k = 0, i = 0, j = 0; k < N + M - 1; k++) {
        C[k] = A[i] + B[j];
        // A[i+1] を先に追加 => A[i+1] - A[i] >= B[j+1] - B[j] 
        if (j == M - 1 || (i + 1 < N && A[i + 1] + B[j] >= A[i] + B[j + 1])) {
        i++;
        } else {
        j++;
        }
    }
    return C;
};
```

## 参照元

- [凸数列の min-plus 畳み込み](https://info.atcoder.jp/entry/algorithm_lectures/min_plus_convolution)
