---
title: "平方分割"
tags: [range-query, point-update, sqrt]
sidebar:
  order: 8
---
## 1. 概要

長さ $N$ の列を、長さ $B \approx \sqrt{N}$ のブロックに分けて、ブロックごとの総積を持つデータ構造.
**可換群**に限ると、一点更新を $O(1)$、区間積を $O(\sqrt{N})$ で行える.

| 操作 | 計算量 |
| --- | --- |
| 一点更新（`add` / `set`） | $O(1)$ |
| 一点取得（`get`） | $O(1)$ |
| 区間積（`prod`） | $O(\sqrt{N})$ |
| 二分探索（`max_right`） | $O(\sqrt{N})$ |

セグメント木（更新・取得とも $O(\log N)$）と比べて**更新が軽く取得が重い**ので、更新回数が取得回数よりずっと多いときに有利になる.
代表例は [Mo's algorithm](../../offline-algorithm/mo-algorithm/) で、追加・削除が $O(N\sqrt{Q})$ 回、取得が $Q$ 回しか起きない.

## 2. 前提知識

- **可換群**: 集合 $S$ と二項演算 $\cdot$ の組で、次を満たすもの.
  - 結合法則: $(a \cdot b) \cdot c = a \cdot (b \cdot c)$
  - 単位元 $e$ がある: $a \cdot e = e \cdot a = a$
  - 逆元 $a^{-1}$ がある: $a \cdot a^{-1} = a^{-1} \cdot a = e$
  - 交換法則: $a \cdot b = b \cdot a$

  例: 整数の加算（逆元は $-a$）、XOR（逆元は $a$ 自身）、$\bmod p$ での $0$ 以外の乗算.

## 3. 平方分割

### 3.1. ブロックの持ち方

列 $a_0, \dots, a_{N-1}$ を先頭から $B$ 個ずつに区切り、$j$ 番目のブロック $[jB, (j+1)B)$ の総積を

$$
\mathrm{block}_j = a_{jB} \cdot a_{jB+1} \cdots a_{\min((j+1)B, N) - 1}
$$

として持つ. ブロック数は $\lceil N/B \rceil$ である.

### 3.2. 区間積

$[l, r)$ の積は、次の 3 つに分けて左から掛ける.

1. $l$ を含むブロックのうち $[l, r)$ に入る部分: 要素を 1 つずつ（$B$ 個以下）
2. $[l, r)$ に完全に含まれるブロック: $\mathrm{block}_j$ を 1 つずつ（$N/B$ 個以下）
3. $r$ を含むブロックのうち $[l, r)$ に入る部分: 要素を 1 つずつ（$B$ 個以下）

合計 $O(B + N/B)$ 回の演算で、$B = \sqrt{N}$ のとき $O(\sqrt{N})$ になる.
左から順に掛けるので、区間積だけなら交換法則も逆元も使わない.

### 3.3. 一点更新

$a_p$ を含むブロックを $j = \lfloor p/B \rfloor$ とする.

- **`add`**（$a_p \leftarrow a_p \cdot x$）: $\mathrm{block}_j \leftarrow \mathrm{block}_j \cdot x$.
  ブロックの途中にある $a_p$ に $x$ を掛けたものを、ブロック全体の後ろに掛けて済ませるので、**交換法則**が必要.
- **`set`**（$a_p \leftarrow x$）: $\mathrm{block}_j \leftarrow \mathrm{block}_j \cdot x \cdot a_p^{-1}$.
  古い値を取り除くために、さらに**逆元**が必要.

どちらも $O(1)$ である.
可換モノイド（逆元なし）でも `set` はブロックを作り直せば $O(B)$ でできるが、それならセグメント木を使えばよいので、ここでは扱わない.

### 3.4. 二分探索

$f(e) = \text{true}$ で、$f(a_l \cdots a_{r-1})$ が $r$ について単調（ある所から先はずっと false）な述語 $f$ について、$f(a_l \cdots a_{r-1}) = \text{true}$ となる最大の $r$ を求める.

区間積と同じ 3 つの部分を左から見ていく. ブロック単位で進めるところは、ブロックを丸ごと掛けても $f$ が true のままなら進み、false になったらそのブロックの中を 1 要素ずつ見る.
これも $O(B + N/B) = O(\sqrt{N})$ である.

例えば各値の出現回数を持てば、「累積の出現回数が $k$ を超える最小の値」、つまり $k$ 番目に小さい値が求まる.

## 4. 参考資料

- [Sqrt Decomposition - cp-algorithms](https://cp-algorithms.com/data_structures/sqrt_decomposition.html)（ブロックへの分割と区間クエリ・一点更新の計算量）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（テンプレート引数 `op`, `e` と `max_right` のインターフェース）

## 5. コード

- `sqrt_decomposition<S, op, e, inv>`: 可換群 $(S, \mathrm{op})$ の列を管理する. `e()` は単位元、`inv(x)` は $x$ の逆元を返す.
- `sqrt_decomposition(n)`: 長さ $n$ で全要素 `e()` に初期化する. $O(n)$.
- `sqrt_decomposition(v)`: 列 `v` で初期化する. $O(n)$.
- `add(p, x)`: $a_p \leftarrow \mathrm{op}(a_p, x)$. $O(1)$.
- `set(p, x)`: $a_p \leftarrow x$. $O(1)$.
- `get(p)`: $a_p$ を返す. $O(1)$.
- `prod(l, r)`: $\mathrm{op}(a_l, \dots, a_{r-1})$ を返す. $l = r$ なら `e()`. $O(\sqrt{n})$.
- `all_prod()`: 全要素の積を返す. $O(1)$.
- `max_right(l, f)`: `f(prod(l, r))` が true となる最大の $r$ を返す. `f(e())` は true で、$f$ は単調であること. $O(\sqrt{n})$.

```cpp title="sqrt_decomposition.cpp"
#include <bits/stdc++.h>
using namespace std;

template <class S, S (*op)(S, S), S (*e)(), S (*inv)(S)>
struct sqrt_decomposition {
  // 長さ n で全要素 e() に初期化する. O(n)
  sqrt_decomposition(int n = 0) : sqrt_decomposition(vector<S>(n, e())) {}

  // 列 v で初期化する. O(n)
  sqrt_decomposition(const vector<S>& v)
      : n(v.size()), b(max(1, (int)sqrt(v.size()))), all(e()), data(v), block((n + b - 1) / b, e()) {
    for (int i = 0; i < n; i++) {
      block[i / b] = op(block[i / b], data[i]);
      all = op(all, data[i]);
    }
  }

  // a[p] <- op(a[p], x). O(1)
  void add(int p, S x) {
    assert(0 <= p && p < n);
    data[p] = op(data[p], x);
    block[p / b] = op(block[p / b], x);
    all = op(all, x);
  }

  // a[p] <- x. O(1)
  void set(int p, S x) {
    assert(0 <= p && p < n);
    add(p, op(x, inv(data[p])));
  }

  // a[p] を返す. O(1)
  S get(int p) const {
    assert(0 <= p && p < n);
    return data[p];
  }

  // op(a[l], ..., a[r - 1]) を返す. l == r なら e(). O(√n)
  S prod(int l, int r) const {
    assert(0 <= l && l <= r && r <= n);
    S res = e();

    // 先頭の端数
    while (l < r && l % b != 0) res = op(res, data[l++]);

    // ブロック単位
    while (l + b <= r) {
      res = op(res, block[l / b]);
      l += b;
    }

    // 末尾の端数
    while (l < r) res = op(res, data[l++]);

    return res;
  }

  // 全要素の積を返す. O(1)
  S all_prod() const {
    return all;
  }

  // f(prod(l, r)) が true となる最大の r を返す. O(√n)
  // f(e()) == true で、f は単調（ある r から先はずっと false）であること
  template <class F>
  int max_right(int l, F f) const {
    assert(0 <= l && l <= n);
    assert(f(e()));
    S sm = e();

    // 先頭の端数
    while (l < n && l % b != 0) {
      if (!f(op(sm, data[l]))) return l;
      sm = op(sm, data[l++]);
    }

    // ブロック単位: 丸ごと掛けても true なら進む
    while (l + b <= n && f(op(sm, block[l / b]))) {
      sm = op(sm, block[l / b]);
      l += b;
    }

    // false になったブロック（または末尾の端数）の中を 1 つずつ見る
    while (l < n && f(op(sm, data[l]))) sm = op(sm, data[l++]);

    return l;
  }

 private:
  int n, b;  // 要素数, ブロックの長さ
  S all;     // 全要素の積
  vector<S> data, block;
};
```

使用例（加算）:

```cpp
long long op(long long a, long long b) { return a + b; }
long long e() { return 0; }
long long inv(long long a) { return -a; }

sqrt_decomposition<long long, op, e, inv> sd(n);
sd.add(p, 1);                                                   // 値 p の出現回数を増やす
int kth = sd.max_right(0, [&](long long s) { return s <= k; });  // 0-indexed で k 番目に小さい値
```
