---
title: "組合せの全列挙"
tags: [brute-force]
sidebar:
  order: 17
---
`N` 個から `K` 個を選ぶ全組合せを列挙する。`next_permutation` を使う実装例

## 実装

```cpp title="next_combination.cpp"
#include <bits/stdc++.h>
using namespace std;

int main() {
  int N, K;

  vector<int> S(N, 0);
  ranges::fill(S | views::take(K), true);
  ranges::reverse(S);

  // next_permutationは辞書順でユニークな並びを順にたどるのですべて列挙できる
  do {
  } while (ranges::next_permutation(S).found);
};
```
