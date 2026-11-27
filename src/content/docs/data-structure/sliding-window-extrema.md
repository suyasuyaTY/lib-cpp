---
title: "スライド最小値"
tags: [sliding-window]
sidebar:
  order: 11
---
## 1. 概要

長さ $N$ の列 $a_0, \dots, a_{N-1}$ について、幅 $W$ のすべての窓 $[i, i + W)$ $(0 \le i \le N - W)$ の最小値を、まとめて $O(N)$ で求めるアルゴリズム.
比較を逆にすれば最大値も同じように求まる.

| 処理 | 計算量 |
| --- | --- |
| すべての窓の最小値（`sliding_window_min`） | $O(N)$ |

窓が左右に 1 つずつずれていくことを使い、**最小値になる可能性がある要素だけ**を両端キュー（deque）に残しておく.
区間の左端・右端がともに単調に動く場合なら、窓の幅が一定でなくても同じ方法が使える.
最小値以外の演算（非可換なものを含む）を窓ごとに集約したいときは [SWAG](../../data-structure/swag/) を使う.

## 2. 前提知識

- **両端キュー（deque）**: 先頭・末尾への追加と削除がそれぞれ $O(1)$ でできる列. C++ では `std::deque`.

## 3. スライド最小値

### 3.1. 捨ててよい要素

窓の右端を $i$ とし、$j < k \le i$ かつ $a_j \ge a_k$ とする.
窓は右にしか動かないので、$j$ を含む窓は今後すべて $k$ も含む（$j$ が窓から出るより前に $k$ が出ることはない）.
したがって $a_j$ が窓の最小値として答えになることはもうなく、$j$ は捨ててよい.

### 3.2. 不変条件

deque に添字 $d_1 < d_2 < \dots < d_m$ を持ち、次を保つ.

- $d_1, \dots, d_m$ はすべて今の窓 $[i - W + 1, i]$ に入っている.
- 値が狭義単調増加: $a_{d_1} < a_{d_2} < \dots < a_{d_m}$.
- $d_m = i$ であり、窓の中で捨てていない要素（右にそれより小さい値がない要素）はすべて deque に入っている.

このとき窓の最小値は $a_{d_1}$ である.
実際、窓の最小値のうち最も右にあるものは、右にそれ以下の値がないので捨てられておらず deque に入っていて、単調性から先頭にある.

右端を $i$ に進めるときは次のようにする.

1. 末尾から $a_{d_m} \ge a_i$ である要素を取り除き続け、最後に $i$ を末尾に追加する（3.1 で捨ててよい要素を捨てる）.
2. 先頭が $d_1 \le i - W$ なら窓から外れたので取り除く. 窓は 1 つずつしか動かないので、外れる要素は高々 1 個である.
3. $i \ge W - 1$ なら $a_{d_1}$ が窓 $[i - W + 1, i]$ の最小値である.

### 3.3. 計算量

各添字は deque に 1 回だけ追加され、取り除かれるのも高々 1 回である.
1 回の右端の移動で取り除く個数は多いことがあるが、取り除く回数の合計は追加の回数 $N$ 以下なので、全体で $O(N)$ である.

:::tip
窓の最小値の位置が欲しいときは、`a[dq.front()]` の代わりに `dq.front()` を記録すればよい.
:::

## 4. 参考資料

- [Minimum stack / Minimum queue - cp-algorithms](https://cp-algorithms.com/data_structures/stack_queue_modification.html)（単調な deque で最小値付きキューを作る方法と、固定長の窓の最小値への応用）
- [Sliding Window Aggregation - data-structures (Scrapbox)](https://scrapbox.io/data-structures/Sliding_Window_Aggregation)（最小値については SWAG とは別のアルゴリズム（スライド最小値）があること）

## 5. コード

- `sliding_window_min(a, w, comp = less<T>())`: 各 $0 \le i \le n - w$ について $\min(a_i, \dots, a_{i + w - 1})$ を並べた長さ $\max(0, n - w + 1)$ の列を返す. $w \ge 1$. `comp` に `greater<T>()` を渡すと最大値になる. $O(n)$.

```cpp title="sliding_window_min.cpp"
// 長さ w の各窓 [i, i + w) について、comp の意味での最小値を返す（長さ max(0, n - w + 1)）. O(n)
// comp = greater<T>() とすると最大値になる.
template <class T, class Compare = less<T>>
vector<T> sliding_window_min(const vector<T>& a, int w, Compare comp = Compare()) {
  assert(w >= 1);
  int n = a.size();
  vector<T> res;
  res.reserve(max(0, n - w + 1));
  deque<int> dq;  // 添字. 値は comp について狭義単調増加
  for (int i = 0; i < n; i++) {
    // a[i] 以上の値は、この先ずっと最小値にならないので捨てる
    while (!dq.empty() && !comp(a[dq.back()], a[i])) dq.pop_back();
    dq.push_back(i);
    // 窓 [i - w + 1, i] から外れた添字を捨てる
    if (dq.front() <= i - w) dq.pop_front();
    if (i >= w - 1) res.push_back(a[dq.front()]);
  }
  return res;
}
```

使用例:

```cpp
vector<long long> a = {3, 1, 4, 1, 5, 9, 2, 6};
auto mn = sliding_window_min(a, 3);                         // {1, 1, 1, 1, 2, 2}
auto mx = sliding_window_min(a, 3, greater<long long>());   // {4, 4, 5, 9, 9, 9}
```
