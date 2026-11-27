---
title: "ヒストグラムの長方形"
tags: [monotonic-stack]
sidebar:
  order: 13
---
## 1. 概要

幅 $1$ の棒が $N$ 本並んだヒストグラム $h_0, \dots, h_{N-1}$ について、各棒 $i$ を長方形の高さとして採用したときに左右へどこまで広げられるか、すなわち

$$
h_j \ge h_i \quad (l_i \le j < r_i)
$$

を満たす極大な区間 $[l_i, r_i)$ を、すべての $i$ について $O(N)$ で求める.
これを使うと、ヒストグラムに含まれる長方形の面積の最大値が $O(N)$ で求まる.

| 処理 | 計算量 |
| --- | --- |
| 各棒の広がり（`histogram_ranges`） | $O(N)$ |
| 最大長方形（`largest_rectangle`） | $O(N)$ |

## 2. 前提知識

- **スタック**: 末尾への追加と末尾からの削除が $O(1)$ でできる列.

## 3. ヒストグラムの長方形

### 3.1. 最大長方形への帰着

ヒストグラムに含まれる長方形が $[l, r)$ の棒にまたがるとき、高さは $\min_{l \le j < r} h_j$ 以下である.
最小値を取る棒の 1 つを $i$ とすると、$[l, r) \subseteq [l_i, r_i)$ なので、面積は $h_i (r_i - l_i)$ 以下である.
逆に、高さ $h_i$・区間 $[l_i, r_i)$ の長方形はヒストグラムに含まれる. したがって

$$
\text{最大面積} = \max_{0 \le i < N} h_i (r_i - l_i)
$$

である.

### 3.2. 直前の小さい要素を単調スタックで求める

$l_i - 1$ は「$i$ より左で $h_j < h_i$ となる最大の $j$」（なければ $-1$）である. これを左から順に求める.

左から見ていくとき、$j < k$ かつ $h_j \ge h_k$ なら、$k$ より右の $i$ にとって $j$ が答えになることはない（$h_j < h_i$ なら $h_k \le h_j < h_i$ で、$k$ の方が近い）.
そこで、捨てていない添字をスタックに持つ. スタックの中の値は底から上へ狭義単調増加になる.

棒 $i$ を見るときは次のようにする.

1. スタックの一番上 $j$ が $h_j \ge h_i$ である限り取り除く（$i$ が来たので今後不要になる）.
2. 残った一番上が $l_i - 1$ である. 空なら $l_i = 0$.
3. $i$ を積む.

$r_i$ も右から同じように求める.
各添字は 1 回積まれて高々 1 回取り除かれるので、取り除く回数の合計は $N$ 以下であり、全体で $O(N)$ である.

:::tip
左右とも「$h_j \ge h_i$ なら広げる」とすると、高さが等しい棒どうしは同じ区間になる.
区間ごとに 1 回だけ数えたい（例えば各区間の最小値の和を求める）ときは、片側だけ $h_j > h_i$ に変えて、等しい値の間で左の棒を優先する.
これは [Cartesian Tree](../../data-structure/cartesian-tree/) の部分木の区間と同じものである.
:::

## 4. 参考資料

- [All nearest smaller values - Wikipedia](https://en.wikipedia.org/wiki/All_nearest_smaller_values)（スタックで直前の小さい要素を求める方法と、計算量が線形になる理由）
- [Largest Rectangle in a Histogram - AOJ DPL_3_C](https://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=DPL_3_C)（最大長方形の問題. 使用例の入力例）

## 5. コード

### 5.1. 左右に広げられる範囲（3.2 節）

- `histogram_ranges(h)`: 各 $i$ について $[l_i, r_i)$ を返す. $O(n)$.

```cpp title="histogram_ranges.cpp"
// 各 i について、h[j] >= h[i] (l <= j < r) となる極大な区間 [l, r) を返す. O(n)
template <class T>
vector<pair<int, int>> histogram_ranges(const vector<T>& h) {
  int n = h.size();
  vector<pair<int, int>> res(n);
  vector<int> st;  // 添字. h の値は底から上へ狭義単調増加

  // 左端: i より左で h[j] < h[i] となる最大の j の次
  for (int i = 0; i < n; i++) {
    while (!st.empty() && h[st.back()] >= h[i]) st.pop_back();
    res[i].first = st.empty() ? 0 : st.back() + 1;
    st.push_back(i);
  }

  st.clear();

  // 右端: i より右で h[j] < h[i] となる最小の j
  for (int i = n - 1; i >= 0; i--) {
    while (!st.empty() && h[st.back()] >= h[i]) st.pop_back();
    res[i].second = st.empty() ? n : st.back();
    st.push_back(i);
  }

  return res;
}
```

### 5.2. 最大長方形（3.1 節）

- `largest_rectangle(h)`: ヒストグラムに含まれる長方形の面積の最大値を返す. $n = 0$ なら $0$. $O(n)$. 5.1 節の `histogram_ranges` を使う.

```cpp title="largest_rectangle.cpp"
// ヒストグラムに含まれる長方形の面積の最大値を返す. O(n)
long long largest_rectangle(const vector<long long>& h) {
  auto ranges = histogram_ranges(h);
  long long res = 0;
  for (int i = 0; i < (int)h.size(); i++) {
    auto [l, r] = ranges[i];
    res = max(res, h[i] * (r - l));
  }
  return res;
}
```

使用例:

```cpp
vector<long long> h = {2, 1, 3, 5, 3, 4, 2, 1};
cout << largest_rectangle(h) << endl;  // 12（高さ 3、区間 [2, 6)）
```
