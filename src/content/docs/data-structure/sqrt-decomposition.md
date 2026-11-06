---
title: "平方分割"
tags: [range-query, sqrt]
sidebar:
  order: 8
---
## 概要

配列の各要素が頻繁に更新され、区間全体に対する集約値を求める場合に平方分割を利用する。

- 操作が可換群の場合
  - 更新: $O(1)$
  - 区間集約: $O(\sqrt{N})$
- 操作が可換モノイドの場合（更新に時間がかかるので使うことはない）
  - 更新: $O(\sqrt{N})$
  - 区間集約: $O(\sqrt{N})$

## 実装

### コード

```cpp
int N;
int B = sqrt(N) + 1;

vector<T> data(N, e()), block((N + B - 1) / B, e());

auto update = [&](int p, T x) {
    int b = p / B;

    // ここの計算量を速くする
    // block[b] と data[p] の逆元を演算
    // block[b] と x の逆元を演算

    data[p] = x;
};

auto prefix = [&](int r) {
    T res = e();

    int b = r / B;
    for (int i = 0; i < b; i++) {
        res = op(res, block[i]);
    }
    for (int i = b * B; i < r; i++) {
        res = op(res, data[i]);
    }
    
    return res;
};
```
