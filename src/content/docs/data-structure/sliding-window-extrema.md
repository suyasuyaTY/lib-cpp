---
title: "スライド最小値"
tags: [sliding-window]
sidebar:
  order: 11
---
## 概要

長さ$N$の配列$A$に対し、幅$W$の区間最小値を$O(N)$で求めるアルゴリズム

## コード

```cpp
deque<pii> deq; // (value,index)

for (int i = 0; i < N; i++) {
  int value = A[i];

  // スライド最小値の追加(後から入ってきたものの方が小さかったらそれ以前のものは必要ない)
  while (!deq.empty() && deq.back().first >= value) {
    deq.pop_back();
  }

  deq.emplace_back(value, q);

  // i - W より小さいものは範囲外
  while (!deq.empty() && deq.front().second < i + W) {
    deq.pop_front();
  }
  
  // 最小値が deq.front().first で取得できる
}
```
