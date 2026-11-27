---
title: "多次元累積和"
tags: [range-query, static, 2d]
sidebar:
  order: 6
---
## 1. 概要

$d$ 次元の格子 $\lbrace 0, 1, \dots, B-1 \rbrace^d$ 上の関数 $f$ について、累積和

$$
F(x) = \sum_{0 \le y_0 \le x_0} \sum_{0 \le y_1 \le x_1} \cdots \sum_{0 \le y_{d-1} \le x_{d-1}} f(y_0, \dots, y_{d-1})
$$

を前計算し、直方体領域の和を包除原理で求めるデータ構造.
点の総数を $M = B^d$ とする.

| 操作 | 計算量 |
| --- | --- |
| 値の加算（`add`、構築前のみ） | $O(d)$ |
| 構築（`build`） | $O(dM)$ |
| 累積和（`prefix`） | $O(d)$ |
| 直方体領域の和（`sum`） | $O(d \, 2^d)$ |

- 構築は「次元ごとに 1 次元の累積和を取る」だけで、$B = 2$ のときは集合の[高速ゼータ変換](../../bitwise/subset-transform/)そのものである.
- 包除原理を各点で直接使って $F(x) = f(x) + \cdots$ と計算すると 1 点あたり $2^d$ 項かかるが、次元ごとに処理すれば 1 点あたり $d$ 回の加算で済む.

## 2. 前提知識

- 1 次元の累積和.
- [部分集合のゼータ・メビウス変換](../../bitwise/subset-transform/)（部分集合についての和 = 各ビットを次元とみた $B = 2$ の多次元累積和）.
- **包除原理**: 集合 $A_0, \dots, A_{d-1}$ について

  $$
  \left| \bigcup_{k=0}^{d-1} A_k \right| = \sum_{\emptyset \ne J \subseteq \lbrace 0, \dots, d-1 \rbrace} (-1)^{|J|-1} \left| \bigcap_{k \in J} A_k \right|
  $$

## 3. 多次元累積和

### 3.1. 次元ごとの累積和

$k = 0, 1, \dots, d-1$ の順に、第 $k$ 次元について 1 次元の累積和を取る. つまり $x_k$ の小さい順に

$$
g(x_0, \dots, x_k, \dots, x_{d-1}) \mathrel{+}= g(x_0, \dots, x_k - 1, \dots, x_{d-1}) \quad (x_k \ge 1)
$$

とする（$g$ は $f$ で初期化した配列）.

<a id="claim-3-1"></a>

:::note[主張 3.1]
第 $0, \dots, k-1$ 次元を処理した後の $g$ は

$$
g(x) = \sum_{y_0 \le x_0} \cdots \sum_{y_{k-1} \le x_{k-1}} f(y_0, \dots, y_{k-1}, x_k, \dots, x_{d-1})
$$

である. 特に全次元を処理すると $g = F$ になる.
:::

<details>
<summary>証明</summary>

$k$ についての帰納法. $k = 0$ では $g = f$ で成り立つ.
第 $k$ 次元の処理は、他の座標を固定して $x_k$ 方向の 1 次元累積和を取るので、処理後の $g(x)$ は処理前の $g(x_0, \dots, y_k, \dots, x_{d-1})$ の $y_k \le x_k$ についての和になる.
帰納法の仮定を代入すると、和の範囲に $y_k \le x_k$ が加わった式になる. $\square$

</details>

各次元の処理は $O(M)$ なので、構築は $O(dM)$ である.

### 3.2. 一次元の配列への埋め込み

座標 $x$ を、$x_0$ を最上位の桁とする $B$ 進数

$$
\mathrm{idx}(x) = \sum_{k=0}^{d-1} x_k B^{d-1-k}
$$

として長さ $M$ の配列に置く. $x_k$ を $1$ 増やすと添字は $\mathrm{step} = B^{d-1-k}$ 増える.
第 $k$ 次元の処理では、配列を長さ $\mathrm{step} \cdot B$ の塊（$x_0, \dots, x_{k-1}$ が等しい範囲）に分け、塊の中で下位の桁 $x_{k+1}, \dots, x_{d-1}$ を表すずれ $\mathrm{offset} \in [0, \mathrm{step})$ ごとに、$x_k = 1, \dots, B-1$ の順に

$$
g[\mathrm{block} + x_k \cdot \mathrm{step} + \mathrm{offset}] \mathrel{+}= g[\mathrm{block} + (x_k - 1) \cdot \mathrm{step} + \mathrm{offset}]
$$

とする. コードの `block`, `offset`, `digit` はそれぞれ塊の先頭、下位の桁のずれ、$x_k$ である.

### 3.3. 直方体領域の和

閉区間の直方体 $\lbrace y : l_k \le y_k \le u_k \ (0 \le k < d) \rbrace$ 上の $f$ の和を求める.
各 $J \subseteq \lbrace 0, \dots, d-1 \rbrace$ について、角の点 $x^J$ を

$$
x^J_k =
\begin{cases}
l_k - 1 & (k \in J) \\
u_k & (k \notin J)
\end{cases}
$$

と定める（座標が $-1$ になったら $F(x^J) = 0$ とする）.

<a id="claim-3-2"></a>

:::note[主張 3.2]

$$
\sum_{l_0 \le y_0 \le u_0} \cdots \sum_{l_{d-1} \le y_{d-1} \le u_{d-1}} f(y) = \sum_{J \subseteq \lbrace 0, \dots, d-1 \rbrace} (-1)^{|J|} F(x^J)
$$

:::

<details>
<summary>証明</summary>

$R = \lbrace y : y_k \le u_k \ (\forall k) \rbrace$、$A_k = \lbrace y \in R : y_k \le l_k - 1 \rbrace$ とおき、集合 $X$ 上の $f$ の和を $f(X)$ と書く.
直方体は $R \setminus \bigcup_k A_k$ であり、$\bigcap_{k \in J} A_k = \lbrace y : y \le x^J \rbrace$（成分ごとの比較）なので $f\left(\bigcap_{k \in J} A_k\right) = F(x^J)$ である.
包除原理（$f$ の和についても同じ式が成り立つ）より

$$
\begin{aligned}
f\left(R \setminus \bigcup_{k} A_k\right)
&= f(R) - f\left(\bigcup_{k} A_k\right) \\
&= f(R) - \sum_{\emptyset \ne J} (-1)^{|J|-1} f\left(\bigcap_{k \in J} A_k\right) \\
&= \sum_{J} (-1)^{|J|} F(x^J)
\end{aligned}
$$

となる. 最後の行では $J = \emptyset$ の項 $F(x^\emptyset) = F(u) = f(R)$ をまとめた. $\square$

</details>

各次元の指示関数を $[l_k \le y_k \le u_k] = [y_k \le u_k] - [y_k \le l_k - 1]$ と分けて $d$ 個の積を展開しても、同じ式が得られる.
項は $2^d$ 個、各項の添字計算に $O(d)$ かかるので、$O(d \, 2^d)$ である.
$d = 2$ なら $F(u_0, u_1) - F(l_0 - 1, u_1) - F(u_0, l_1 - 1) + F(l_0 - 1, l_1 - 1)$ というおなじみの式になる.

## 4. 参考資料

- [Sum over Subsets DP - USACO Guide](https://usaco.guide/plat/dp-sos)（SOS DP を各ビットを次元とみた多次元累積和として捉え、次元ごとに累積する方法）
- [The Inclusion-Exclusion Principle - cp-algorithms](https://cp-algorithms.com/combinatorics/inclusion-exclusion.html)（包除原理の集合版の式）

## 5. コード

- `prefix_sum<T, base, dim>`: 各座標が $0$ 以上 `base` 未満の `dim` 次元格子上の値（型 `T`）を管理する. 座標は `array<int, dim>`.
- `prefix_sum()`: 全要素 `T{}` で初期化する. $O(M)$.
- `add(x, v)`: $f(x) \mathrel{+}= v$. `build()` より前に呼ぶ. $O(d)$.
- `build()`: 累積和を構築する. $O(dM)$.
- `prefix(x)`: $F(x)$ を返す. $x_k < 0$ となる $k$ があれば `T{}`. `build()` 後に呼ぶ. $O(d)$.
- `sum(lower, upper)`: 閉区間の直方体 $\mathrm{lower}_k \le y_k \le \mathrm{upper}_k$ 上の $f$ の和を返す. `build()` 後に呼ぶ. $O(d \, 2^d)$.
- `coord_to_idx(x)` / `idx_to_coord(idx)`: 座標と一次元の添字を変換する. $O(d)$.

```cpp title="prefix_sum.cpp"
// base: 各次元の座標の個数（座標は 0 以上 base 未満）, dim: 次元数
template <class T, int base, int dim>
struct prefix_sum {
  using coord = array<int, dim>;

  // 全要素 T{} で初期化する. O(base^dim)
  prefix_sum() {
    pow_base[0] = 1;
    for (int k = 0; k < dim; k++) pow_base[k + 1] = pow_base[k] * base;
    data.assign(pow_base[dim], T{});
  }

  // 一次元の添字 → 座標（x[0] が最上位の桁）. O(dim)
  static coord idx_to_coord(size_t idx) {
    coord x{};
    for (int k = dim - 1; k >= 0; k--) {
      x[k] = idx % base;
      idx /= base;
    }
    return x;
  }

  // 座標 → 一次元の添字（x[0] が最上位の桁）. O(dim)
  static size_t coord_to_idx(const coord& x) {
    size_t idx = 0;
    for (int k = 0; k < dim; k++) {
      assert(0 <= x[k] && x[k] < base);
      idx = idx * base + x[k];
    }
    return idx;
  }

  // f(x) += v. build() より前に呼ぶ. O(dim)
  void add(const coord& x, const T& v) {
    assert(!built);
    data[coord_to_idx(x)] += v;
  }

  // 累積和を構築する. O(dim * base^dim)
  void build() {
    assert(!built);
    built = true;
    const size_t size = data.size();
    for (int k = 0; k < dim; k++) {
      const size_t step = pow_base[dim - 1 - k];  // x[k] を 1 増やしたときの添字の差
      const size_t block_size = step * base;      // x[k] が 0 から base - 1 まで一周する長さ
      for (size_t block = 0; block < size; block += block_size) {
        for (size_t offset = 0; offset < step; offset++) {
          for (int digit = 1; digit < base; digit++) {
            const size_t idx = block + digit * step + offset;
            data[idx] += data[idx - step];
          }
        }
      }
    }
  }

  // 0 <= y[k] <= x[k] (全 k) を満たす y についての f(y) の総和.
  // x[k] < 0 となる k があれば T{}. O(dim)
  T prefix(const coord& x) const {
    assert(built);
    for (int k = 0; k < dim; k++) {
      if (x[k] < 0) return T{};
      assert(x[k] < base);
    }
    return data[coord_to_idx(x)];
  }

  // lower[k] <= y[k] <= upper[k] (全 k) を満たす y についての f(y) の総和（閉区間）. O(dim 2^dim)
  T sum(const coord& lower, const coord& upper) const {
    assert(built);
    for (int k = 0; k < dim; k++) {
      assert(0 <= lower[k] && lower[k] < base);
      assert(0 <= upper[k] && upper[k] < base);
      if (lower[k] > upper[k]) return T{};
    }
    T res{};
    for (unsigned mask = 0; mask < (1u << dim); mask++) {
      // mask に含まれる次元 k は x[k] = lower[k] - 1、それ以外は x[k] = upper[k]
      coord x{};
      for (int k = 0; k < dim; k++) x[k] = (mask >> k & 1) ? lower[k] - 1 : upper[k];
      if (popcount(mask) % 2 == 0) {
        res += prefix(x);
      } else {
        res -= prefix(x);
      }
    }
    return res;
  }

 private:
  bool built = false;
  vector<T> data;
  array<size_t, dim + 1> pow_base{};
};
```

使用例（3 次元、各座標 $0$ 以上 $N$ 未満. `base` はコンパイル時定数なので上限を入れる）:

```cpp
prefix_sum<long long, 100, 3> ps;
ps.add({x, y, z}, a);
ps.build();
long long s = ps.sum({lx, ly, lz}, {rx, ry, rz});  // 閉区間
```
