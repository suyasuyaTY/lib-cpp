---
title: "ヒストグラムの長方形"
tags: [monotonic-stack]
sidebar:
  order: 14
---
## 概要

ヒストグラム$h$に対して、各棒$i$を長方形の最小高さとして採用したときに左右へどこまで広げられるかを求める。

## アルゴリズム

```cpp
vector<pii> histogram_ranges(const vector<ll>& h) {
    int n = (int)h.size();

    vector<int> left(n,0), right(n,n);
    stack<int> st;

    for (int i = 0; i < n; i++) {
        while (!st.empty() && h[i] <= h[st.top()]) {
            st.pop();
        }

        left[i] = st.top() + 1;
        st.push(i);
    }

    while (!st.empty()) st.pop();

    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && h[i] <= h[st.top()]) {
            st.pop();
        }

        right[i] = t.top();
        st.push(i);
    }

    vector<pii> res(n);
    for (int i = 0; i < n; i++) {
        res[i] = {left[i], right[i]};
    }

    return res;
}
```
