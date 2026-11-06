---
title: "ダブリング"
tags: [doubling]
sidebar:
  order: 2
---
遷移を最大 `K` 回先まで高速にたどる。`Doubling(next_nodes, max_steps)`, `query(start, steps)`

## 実装

```cpp title="doubling.cpp"
#include <cassert>
#include <vector>

class Doubling {
 private:
  int n;
  int log_k;
  std::vector<std::vector<int>> dp;

 public:
  Doubling(const std::vector<int> &next_nodes, long long max_steps) {
    n = ssize(next_nodes);

    log_k = 1;
    while ((1LL << log_k) <= max_steps) log_k++;

    dp.assign(log_k, std::vector<int>(n, -1));

    for (int i = 0; i < n; i++) {
      dp[0][i] = next_nodes[i];
    }

    for (int k = 0; k < log_k - 1; k++) {
      for (int i = 0; i < n; i++) {
        if (dp[k][i] != -1)
          dp[k + 1][i] = dp[k][dp[k][i]];
      }
    }
  }

  int query(int start, long long steps) {
    int now = start;
    for (int k = 0; steps > 0 && now >= 0; k++) {
      if (steps & 1) {
        now = dp[k][now];
      }
      steps >>= 1;
    }
    return now;
  }
};
```
