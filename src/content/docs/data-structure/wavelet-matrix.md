---
title: "Wavelet Matrix"
tags: [range-query, static]
sidebar:
  order: 9
---
## 概要

- 静的な非負整数列$A=(A_0,A_1,\dots,A_{N-1})$に対して、クエリ$(L,R)$が与えられるたびに、多重集合$\{A_{L}, A_{L+1},\dots,A_{R-1}\}$に対応する`Binary Trie`に対する探索を行うことができるデータ構造
    - $A_{L},A_{L+1},\dots,A_{R-1}$のうちで昇順$k$番目の要素を求める
    - $A_{L},A_{L+1},\dots,A_{R-1}$にうちで$a$以上$b$未満の要素の個数を求める
    - 他にも応用範囲は広い

## 前提知識

## Binary Trie

### 概要

- $0$以上$2^{H-1}$以下の整数を$2$進法表記で分類していく過程を表す二分木
- 各ノードがどの値を保持するかは、直接持たなくても経路でわかるので集約値をノードに入れる

### 昇順$k$番目の要素`0-based index`

葉ではないノードにおいて、そのノードに対応する多重集合の昇順$k$番目の値を求める問題を考える

1. 左部分木内の要素数$x$を求める
2. $k<x$ならば、左部分木に進み$k$番目の要素を求める
3. $x \le k$ならば、右部分木に進み$(k-x)$番目の要素を求める

### $a$以上$b$未満の要素の個数

「$b$未満の要素の個数」から「$a$未満の要素の個数」を引いたものなので、「$a$未満の要素の個数」を求める方法がわかればいい

葉ではないノードにおいて、現在調べているノードに対応する非負整数区間$[l,r)$を保持しながら木を探索する

1. 左右の部分木の境界$m=(l+r)/2$を求める
2. $a \le m$ならば、左部分木に進む
3. $m < a$ならば、左部分木の要素数を答えに加えて右部分木に進む

## Wavelet Tree

- 区間$[L,R)$が与えられた時、多重集合$\{A_{L}, A_{L+1},\dots,A_{R-1}\}$に対応する`Binary Trie` を扱うことができる
- 各ノードは、そのノード内の要素をインデックス順に並べた列をもつ
- あるノードの区間が与えられた時に、左右の子の区間を求めるための補助データが欲しい
    - 「そのノードの$[l,r)$が、左部分木、右部分木においてどの区間に対応するか」
    - 各要素が左に行くなら$0$、右に行くなら$1$とした列の累積和を持てばいい

## Wavelet Matrix

- Wavelet Treeのノードの並び順を入れ替えて、各高さごとに直前の高さの左部分木全体を左側、右部分木全体を右側に並べる（左側同士、右側同士では直前の高さの順序を保つ）
- 同じ高さのノードを結合して一つの列として表す

## 実際に実装するデータ

- 各$h(0 \le h < H)$について、高さ$h+1$の層から高さ$h$の層に向かって、それぞれの要素が左部分木、右部分木のどちらに移動したのかを表す$0,1$列を用意する
- どのようにクエリが処理できるのかは資料

[Wavelet Matrix（基礎） - AtCoderInfo](https://info.atcoder.jp/entry/algorithm_lectures/wavelet_matrix_basic)

```cpp
// 長さ N の 0,1 列を 64bit 整数として扱う
struct BitVector {
  int n;
  vector<u64> A;
  vector<u64> rank64;
  BitVector() {}
  BitVector(int N) {
    n = (N + 63) / 64;
    A.resize(n + 1), rank64.resize(n + 1);
  }
  int popcnt(u64 x) { return __builtin_popcountll(x); }
  void set(int i) { A[i / 64] |= 1ull << (i & 63); }
  void build() {
    for (int i = 0; i < n; ++i) rank64[i + 1] = rank64[i] + popcnt(A[i]);
  }
  // i = 64 q + r
  // 64 * q までの 1 の個数: rank64[q]
  // r までに含まれる 1 の個数 A[q] & (1...1: 1 が r 個)
  int rank(int i) {
    return rank64[i / 64] + popcnt(A[i / 64] & ((u64(1) << (i & 63)) - 1));
  }
};
```

## 実装

```cpp title="Wavelet_Matrix.cpp"
#include <bits/stdc++.h>

using namespace std;

struct BitVector {
  int n;
  vector<uint64_t> A;
  vector<uint64_t> rank64;
  BitVector() {}
  BitVector(int N) {
    n = (N + 63) / 64;
    A.resize(n + 1), rank64.resize(n + 1);
  }
  int popcnt(uint64_t x) { return __builtin_popcountll(x); }
  void set(int i) { A[i / 64] |= 1ull << (i & 63); }
  void build() {
    for (int i = 0; i < n; ++i) rank64[i + 1] = rank64[i] + popcnt(A[i]);
  }
  int rank(int i) {
    return rank64[i / 64] + popcnt(A[i / 64] & ((uint64_t(1) << (i & 63)) - 1));
  }
};

template <typename T>
struct Wavelet_Matrix {
  int H, N;
  vector<BitVector> dat;
  Wavelet_Matrix(int H, vector<T> A) : H(H), N(A.size()), dat(H) {
    for (int h = H - 1; h >= 0; --h) {
      // height h+1 to h.
      BitVector bv(N);
      vector<T> left, right;
      for (int i = 0; i < N; ++i) {
        int dir = A[i] >> h & 1;
        (dir == 0 ? left : right).emplace_back(A[i]);
        if (dir) bv.set(i);
      }
      int a = left.size(), b = right.size();
      for (int i = 0; i < a; ++i) A[i] = left[i];
      for (int i = 0; i < b; ++i) A[a + i] = right[i];
      bv.build();
      dat[h] = bv;
    }
  }

  // k-th (0-indexed) smallest number in a[L, R)
  T kth_smallest(int L, int R, int k) {
    assert(0 <= L && L < R && R <= N && 0 <= k && k < R - L);
    return kth_smallest_rec(H, L, R, k);
  }

  // k-th (0-indexed) largest number in a[L, R)
  T kth_largest(int L, int R, int k) {
    assert(0 <= L && L < R && R <= N && 0 <= k && k < R - L);
    return kth_smallest(L, R, R - L - k - 1);
  }

  // count i if (L <= i < R && lower <= A[i] < upper)
  int range_freq(int L, int R, T lower, T upper) {
    assert(0 <= L && L < R && R <= N && 0 <= lower && lower < upper);
    return range_freq(L, R, upper) - range_freq(L, R, lower);
  }

  // count i if (L <= i < R && A[i] < upper)
  int range_freq(int L, int R, T upper) {
    assert(0 <= L && L < R && R <= N && 0 <= upper);
    return range_freq_rec(H, L, R, 0, (T)1 << H, upper);
  }

  // max v[i] s.t. (l <= i < r) && (v[i] < upper)
  T prev_value(int l, int r, T upper) {
    int cnt = range_freq(l, r, upper);
    return cnt == 0 ? T(-1) : kth_smallest(l, r, cnt - 1);
  }

  // min v[i] s.t. (l <= i < r) && (lower <= v[i])
  T next_value(int l, int r, T lower) {
    int cnt = range_freq(l, r, lower);
    return cnt == r - l ? T(-1) : kth_smallest(l, r, cnt);
  }

 private:
  tuple<int, int, int, int> get_subtree_range(int h, int L, int R) {
    int a0 = L - dat[h].rank(L), a1 = dat[h].rank(L);
    int b0 = R - dat[h].rank(R), b1 = dat[h].rank(R);
    int c0 = N - dat[h].rank(N);
    return {a0, b0, c0 + a1, c0 + b1};
  }

  T kth_smallest_rec(int h, int l, int r, int k) {
    if (h == 0) return 0;
    auto [l0, r0, l1, r1] = get_subtree_range(h - 1, l, r);
    int left_size = r0 - l0;
    if (k < left_size) {
      return kth_smallest_rec(h - 1, l0, r0, k);
    } else {
      return ((T)1 << (h - 1)) + kth_smallest_rec(h - 1, l1, r1, k - left_size);
    }
  }

  int range_freq_rec(int h, int l, int r, T lower, T upper, T x) {
    // この部分木の値がすべて x 以上
    if (x <= lower) return 0;

    // この部分木の値がすべて x 未満
    if (upper <= x) return r - l;

    if (h == 0) return 0;

    auto [l0, r0, l1, r1] = get_subtree_range(h - 1, l, r);
    T mid = lower + (upper - lower) / 2;

    return range_freq_rec(h - 1, l0, r0, lower, mid, x) +
           range_freq_rec(h - 1, l1, r1, mid, upper, x);
  }
};
```
