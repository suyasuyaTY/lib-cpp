---
title: "最長部分増加列"
tags: [binary-search, range-query]
sidebar:
  order: 1
---
## 概要

長さ $N$ の数列 $(A[0], \dots, A[N-1])$ の狭義増加部分列のうち、最大のものを求める。

## 最長部分増加列の長さ

$A$ を座標圧縮して、$0 \leq A[i] < N$ を仮定する
- $dp[i][j]$: $A$ の $i$ 番目までの要素を考えて、最後に用いた値が $j$ である LIS の長さ
  - $j = A[i]$: $dp[i][j] = \max_{0 \leq k < j} dp[i-1][k] + 1$
  - $j \neq A[i]$: $dp[i][j] = dp[i-1][j]$

```cpp
RangeMaxSegTree dp(N + 1);
dp.set(0, 0);
for (int i = 0; i < N; i++) {
    dp.set(A[i], dp.prod(0, A[i]) + 1);
}
```

## 最長部分増加列を求める

- $dp[i][j]$: $A$ の $i$ 番目までの要素を考えて、最後に用いた値が $j$ であるときの `(LIS の長さ, 最後の index)`

```cpp
vector<int> pre(N, -1);
vector<int> len(N);

RangeMaxSegTree dp(N + 1);

for (int i = 0; i < N; i++) {
    auto [l, idx] = dp.prod(0, A[i]);

    len[i] = l + 1;
    pre[i] = idx;

    auto old = dp.get(A[i]);

    if (old.first < len[i]) {
        dp.set(A[i], {len[i], i});
    }
}

vector<int> lis;

while (last != -1) {
    lis.push_back(last);
    last = pre[last];
}

reverse(lis.begin(), lis.end());
```

## どのindexがLISの何番目になれるか

- $L[i]$: $i$ を最後にする LIS の長さ
- $R[i]$: $i$ を最初にする LIS の長さ
- $L[i] + R[i] - 1 = LIS$ が $i$ が どれか 1 つの最長 LIS に含まれることができる index

```cpp
vector<int> L(N), R(N);

RangeMaxSegTree dp1(N + 1), dp2(N + 1);

for (int i = 0; i < N; i++) {
    L[i] = dp1.prod(0, A[i]) + 1;

    dp1.set(A[i], max(dp1.get(A[i]), L[i]));
}
for (int i = N - 1; i >= 0; i--) {
    R[i] = dp2.prod(A[i] + 1, M) + 1;

    dp2.set(A[i], max(dp2.get(A[i]), R[i]));
}

vector<vector<int>> candidate(LIS + 1);

for (int i = 0; i < N; i++) {
    if (L[i] + R[i] - 1 == LIS) {
        candidate[L[i]].push_back(i);
    }
}
```

`candidate[k]`をindex昇順に並べたとする。

$i < j$ なのに, $A[i] < A[j]$ だったとすると、$i$ の長さ $k$ の増加部分列の後ろに $j$ を付けられてしまい、$L[j] \geq k+1$ になる。

したがって、
$$
i < j \Rightarrow A[i] \geq A[j]
$$
が成り立つ。

つまり、前の候補 $i$ を index 昇順に動かしていけば次に使う範囲というのは尺取り可能になる。

## 実装

```cpp title="LIS.cpp"
#include <atcoder/segtree>
#include <cmath>
#include <vector>

const int INF = 0x3fffffff;

std::vector<int> LIS(const std::vector<int> &A) {
  std::vector<int> dp(A.size(), INF);

  for (const int x : A) {
    auto it = lower_bound(dp.begin(), dp.end(), x);
    *it = x;
  }

  return dp;
}

// A: 座標圧縮済み
// dp[i][j]: A の i 番目までを考慮したときの最後の要素が j となる LIS
std::vector<int> LIS(const std::vector<int> &A) {
  atcoder::segtree<int, [](int x, int y) { return std::max(x, y); }, []() { return 0; }> dp(std::vector<int>(A.size() + 1, -INF));
  dp.set(0, 0);

  for (const int x : A) {
    dp.set(x, dp.prod(0, x) + 1);
  }

  std::vector<int> res(A.size() + 1);
  for (int i = 0; i < ssize(res); i++) {
    res[i] = dp.get(i);
  }

  return res;
}
```
