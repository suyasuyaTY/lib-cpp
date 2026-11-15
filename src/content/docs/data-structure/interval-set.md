---
title: "区間を管理する set（Interval Set）"
tags: [interval]
sidebar:
  order: 15
---
## 1. 概要

整数の半開区間 $[l, r)$ の追加・削除を、区間の組 $(l, r)$ の `set` で管理するデータ構造.
重なる区間や隣接する区間は併合し、常に**互いに離れた区間だけ**を左端の昇順に保持する.

| 操作 | 計算量 |
| --- | --- |
| 区間の追加（`insert(l, r)`） | 償却 $O(\log Q)$ |
| 区間の削除（`erase(l, r)`） | 償却 $O(\log Q)$ |
| 点 $x$ を含む区間の取得（`get(x)`, `covered(x)`） | $O(\log Q)$ |
| $x$ 以上で覆われていない最小の値（`mex(x)`） | $O(\log Q)$ |

$Q$ はそれまでの追加・削除の回数である. 座標は大きくてもよく、座標圧縮もいらない.

## 2. 前提知識

- **`std::set`**: 平衡二分探索木. 挿入・削除・`lower_bound` / `upper_bound` による検索が $O(\log n)$ でできる.

## 3. 区間の管理

### 3.1. 持ち方

保持する区間を $[l_1, r_1), [l_2, r_2), \dots, [l_k, r_k)$ とし、常に

$$
l_1 < r_1 < l_2 < r_2 < \dots < l_k < r_k
$$

を保つ（$r_j = l_{j+1}$ なら併合するので、隣の区間との間には必ず隙間がある）.
`set<pair<T, T>>` に $(l_j, r_j)$ を入れると、左端の昇順に並ぶ.
両端に番兵 $(-\infty, -\infty)$, $(\infty, \infty)$ を入れておくと、`prev` や `next` で集合の外に出ることを気にしなくてよい.

点 $x$ を含みうる区間は「左端が $x$ 以下で最大のもの」だけである. これは `prev(s.upper_bound({x, ∞}))` で求まり、その右端が $x$ より大きければ $x$ を含む.

### 3.2. 追加

$[l, r)$ を追加するときは、$[l, r)$ と重なる・隣接する区間（$l_j \le r$ かつ $r_j \ge l$ となるもの）をすべて取り除き、それらと $[l, r)$ を合わせた 1 個の区間を挿入する.

1. 左端が $l$ より小さい区間のうち、$[l, r)$ にかかりうるのは左端が $l$ 以下で最大のもの 1 個だけである. その右端が $l$ 以上なら併合して取り除く.
2. 左端が $l$ 以上で $r$ 以下の区間を、左から順にすべて併合して取り除く.

### 3.3. 削除

$[l, r)$ を削除するときは、$[l, r)$ と重なる区間（$l_j < r$ かつ $r_j > l$ となるもの）を取り除き、はみ出した部分を残す.

1. 左端が $l$ より小さい区間のうち、$l$ をまたぐもの（高々 1 個）を取り除き、$[l_j, l)$ と、$r_j > r$ なら $[r, r_j)$ を挿入し直す.
2. 左端が $l$ 以上で $r$ より小さい区間を左から順に取り除く. $r$ をまたぐもの（最後の 1 個）は $[r, r_j)$ を挿入し直す.

区間の途中を削除した場合は、左右の 2 個の区間に分かれる.

### 3.4. 計算量

空の区間集合から始め、追加を $A$ 回、削除を $D$ 回、合計 $Q = A + D$ 回行うとする. 番兵は以下の個数に含めない.

- 追加 1 回で `set` に挿入する区間は高々 1 個.
- 削除 1 回で `set` に挿入する区間は、削除範囲の左右に残る高々 2 個.
- よって、全クエリで挿入する区間は累計で高々 $A + 2D$ 個. 挿入した各要素は高々 1 回しか消去されないので、消去も累計で高々 $A + 2D$ 回.

したがって、区間の更新を `set` への挿入・消去として数えると、合計は高々 $2A + 4D \le 4Q$ 回になる. 同じ端点の区間を作り直した場合も、別の挿入として数える.
各ループの反復では必ず要素を消去するため、ループの総反復回数も $O(Q)$ に収まる.

1 回のクエリで区間数が増えるのは高々 1 個なので、保持する区間数は高々 $Q$ 個.
検索・挿入・消去をそれぞれ $O(\log(Q + 2))$ と見積もると、全体の時間計算量は $O(Q \log Q)$ となる.
1 回の追加・削除だけを見ると多くの区間を消すことがあるので、計算量は償却である.

## 4. 参考資料

- [RangeSet - mugen1337's procon library](https://mugen1337.github.io/procon/DataStructure/RangeSet.hpp)（区間を set で管理するデータ構造の操作（`covered`, `covered_by`, `insert`, `erase`, `mex`）と計算量）
- [std::set - cppreference.com](https://en.cppreference.com/w/cpp/container/set)（`lower_bound` / `upper_bound` / `erase` の戻り値と計算量）

## 5. コード

- `interval_set<T>`: 整数型 `T` の半開区間の集合を管理する. 座標は `numeric_limits<T>::min()` より大きく `numeric_limits<T>::max()` より小さいこと（番兵に使う）.
- `insert(l, r)`: $[l, r)$ を追加する. 重なる・隣接する区間は併合する. $l \ge r$ なら何もしない. 償却 $O(\log n)$.
- `erase(l, r)`: $[l, r)$ を削除する. $l \ge r$ なら何もしない. 償却 $O(\log n)$.
- `get(x)`: $x$ を含む区間 $[l, r)$ を返す. なければ $\lbrace x, x \rbrace$（空の区間）. $O(\log n)$.
- `covered(x)`: $x$ がどれかの区間に含まれるかを返す. $O(\log n)$.
- `mex(x)`: $x$ 以上で、どの区間にも含まれない最小の値を返す. $O(\log n)$.
- `size()`: 区間の個数を返す. $O(1)$.
- `intervals()`: 区間を左端の昇順に並べて返す. $O(n)$.

```cpp title="interval_set.cpp"
// 互いに離れた半開区間 [l, r) の集合. 座標は (INF_L, INF_R) の範囲（番兵の値は含まない）
template <class T>
struct interval_set {
  interval_set() {
    s.emplace(INF_L, INF_L);
    s.emplace(INF_R, INF_R);
  }

  // [l, r) を追加する. 重なる・隣接する区間は併合する. 償却 O(log n)
  void insert(T l, T r) {
    assert(INF_L < l && r < INF_R);
    if (l >= r) return;

    // l より左から始まり、l に重なる・隣接する区間があれば併合する
    auto it = prev(s.upper_bound({l, INF_R}));
    if (it->first != INF_L && it->second >= l) {
      l = it->first;
      r = max(r, it->second);
      it = s.erase(it);
    } else {
      it = next(it);
    }

    // l 以降から始まり、[l, r] に重なる・隣接する区間を全部併合する
    while (it->first <= r) {
      r = max(r, it->second);
      it = s.erase(it);
    }

    s.emplace(l, r);
  }

  // [l, r) を削除する. 区間の途中を削除したときは左右に分かれる. 償却 O(log n)
  void erase(T l, T r) {
    assert(INF_L < l && r < INF_R);
    if (l >= r) return;

    // l より左から始まり、l にかかっている区間を切る
    auto it = prev(s.upper_bound({l, INF_R}));
    if (it->first != INF_L && it->second > l) {
      auto [a, b] = *it;
      s.erase(it);
      if (a < l) s.emplace(a, l);  // 左側を残す
      if (b > r) s.emplace(r, b);  // 右側を残す
    }

    // l 以降から始まり、r より左から始まる区間を消す
    it = s.lower_bound({l, INF_L});
    while (it->first < r) {
      auto [a, b] = *it;
      it = s.erase(it);
      if (b > r) {  // r をまたいでいるなら右側だけ残す
        s.emplace(r, b);
        break;
      }
    }
  }

  // x を含む区間 [l, r) を返す. なければ {x, x}. O(log n)
  pair<T, T> get(T x) const {
    auto it = prev(s.upper_bound({x, INF_R}));
    if (it->first != INF_L && x < it->second) return *it;
    return {x, x};
  }

  // x がどれかの区間に含まれるか. O(log n)
  bool covered(T x) const {
    auto [l, r] = get(x);
    return l < r;
  }

  // x 以上で、どの区間にも含まれない最小の値を返す. O(log n)
  T mex(T x) const {
    auto [l, r] = get(x);
    return l < r ? r : x;
  }

  // 区間の個数. O(1)
  int size() const { return (int)s.size() - 2; }

  // 区間を左から順に返す. O(n)
  vector<pair<T, T>> intervals() const {
    return vector<pair<T, T>>(next(s.begin()), prev(s.end()));
  }

 private:
  static constexpr T INF_L = numeric_limits<T>::min();
  static constexpr T INF_R = numeric_limits<T>::max();
  set<pair<T, T>> s;  // (左端, 右端). 番兵 (INF_L, INF_L), (INF_R, INF_R) を含む
};
```

使用例:

```cpp
interval_set<long long> st;
st.insert(1, 3);
st.insert(3, 5);           // [1, 5) に併合される
st.erase(2, 4);            // [1, 2), [4, 5) に分かれる
st.covered(4);             // true
auto [l, r] = st.get(4);   // [4, 5)
st.mex(1);                 // 2
```
