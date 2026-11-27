---
title: "スパーステーブル"
tags: [range-query, static]
sidebar:
  order: 7
---
## 1. 概要

更新のない列 $a_0, \dots, a_{N-1}$ に対して、$\min$・$\max$・$\gcd$ のような**冪等**な演算の区間積を $O(1)$ で求めるデータ構造.
長さが $2$ のべきの区間の積をすべて前計算しておき、クエリの区間を**重なってもよい** 2 つの区間で覆う.

| 操作 | 計算量 |
| --- | --- |
| 構築 | $O(N \log N)$ 時間・空間 |
| 区間積（`prod`） | $O(1)$（演算 1 回） |
| 一点取得（`get`） | $O(1)$ |

静的な列の区間積を求めるデータ構造は、演算に要求する性質と前計算の重さで使い分ける.

| データ構造 | 演算の条件 | 前計算 | クエリ | 更新 |
| --- | --- | --- | --- | --- |
| 累積和 | 群（逆元が必要） | $O(N)$ | $O(1)$ | 不可 |
| スパーステーブル | 冪等な半群 | $O(N \log N)$ | $O(1)$ | 不可 |
| [Disjoint Sparse Table](../../data-structure/disjoint-sparse-table/) | 半群（モノイド） | $O(N \log N)$ | $O(1)$ | 不可 |
| Sqrt Tree | 半群（モノイド） | $O(N \log \log N)$ | $O(1)$（演算 2 回） | 不可 |
| [セグメント木](../../data-structure/segment-tree/) | モノイド | $O(N)$ | $O(\log N)$ | 一点更新 $O(\log N)$ |

- 和のように逆元があるなら累積和でよい. 冪等でない演算（和・積・行列積など）にスパーステーブルは使えないので、DST などを使う.
- $N$ と $Q$ が同程度なら、メモリが少なく更新もできるセグメント木で足りることが多い. スパーステーブルは、$Q$ が $N$ よりずっと大きいときや、二分探索の中で区間積を何度も求めるときに有利になる.
- $\min$ に限れば $O(N)$ 前計算・$O(1)$ クエリの線形時間 RMQ も知られている. 逆に $N$ がごく小さく $Q$ がとても大きいなら、全区間の答えを $O(N^2)$ で前計算するのが最適なこともある.

## 2. 前提知識

- **冪等な半群（band）**: 集合 $S$ と二項演算 $\cdot$ の組で、次を満たすもの.
  - 結合法則: $(a \cdot b) \cdot c = a \cdot (b \cdot c)$
  - 冪等性: $a \cdot a = a$

  例: $\min$、$\max$、$\gcd$、$\mathrm{lcm}$、bit AND、bit OR. 交換法則も単位元も要らない（例えば $a \cdot b = a$ も冪等な半群である）.

## 3. スパーステーブル

### 3.1. テーブル

$k = 0, 1, \dots, \lfloor \log_2 N \rfloor$ と $0 \le i \le N - 2^k$ について、長さ $2^k$ の区間の積

$$
\mathrm{table}_{k, i} = a_i \cdot a_{i+1} \cdots a_{i + 2^k - 1}
$$

を持つ. 長さ $2^{k+1}$ の区間は長さ $2^k$ の区間 2 つにちょうど分かれるので、

$$
\mathrm{table}_{0, i} = a_i, \qquad
\mathrm{table}_{k+1, i} = \mathrm{table}_{k, i} \cdot \mathrm{table}_{k, i + 2^k}
$$

で $k$ の小さい順に埋められる. 各段は $N$ 個以下で段数は $\lfloor \log_2 N \rfloor + 1$ なので、時間・空間とも $O(N \log N)$ である.
ここまでは結合法則しか使っていない.

### 3.2. 区間積

$[l, r)$（$l < r$）の積を求める. $2^k \le r - l < 2^{k+1}$ となる $k = \lfloor \log_2 (r - l) \rfloor$ をとると、

$$
[l, r) = [l, l + 2^k) \cup [r - 2^k, r)
$$

である（$2^k \le r - l$ より両方とも $[l, r)$ に含まれ、$r - l < 2^{k+1}$ より間に隙間がない）. そこで

$$
\mathrm{prod}(l, r) = \mathrm{table}_{k, l} \cdot \mathrm{table}_{k, r - 2^k}
$$

と演算 1 回で答える. 2 つの区間は一般に重なるが、冪等性があれば重なった部分は 1 回分として数えられる.

<a id="claim-3-1"></a>

:::note[主張 3.1]
$(S, \cdot)$ が冪等な半群なら、$\mathrm{table}_{k, l} \cdot \mathrm{table}_{k, r - 2^k} = a_l \cdot a_{l+1} \cdots a_{r-1}$ である.
:::

<details>
<summary>証明</summary>

$m_1 = r - 2^k$、$m_2 = l + 2^k$ とおくと $l \le m_1 \le m_2 \le r$ である.
$[l, m_1)$、$[m_1, m_2)$、$[m_2, r)$ の積をそれぞれ $x, y, z$ とする（空の区間は式から除く. $y$ は空でない）. 結合法則から $\mathrm{table}_{k, l} = x \cdot y$、$\mathrm{table}_{k, m_1} = y \cdot z$ なので、

$$
\begin{aligned}
\mathrm{table}_{k, l} \cdot \mathrm{table}_{k, m_1}
&= x \cdot (y \cdot y) \cdot z \\
&= x \cdot y \cdot z \\
&= a_l \cdot a_{l+1} \cdots a_{r-1}
\end{aligned}
$$

となる. 2 行目で $y \cdot y = y$ を使った. $\square$

</details>

重なり $y$ を $x$ と $z$ の間で 2 回掛けているだけで、要素の順序は変えていないので、交換法則は要らない.
冪等でない演算（和など）では $y$ が 2 回数えられてしまうので、このままでは使えない.

### 3.3. $\lfloor \log_2 \rfloor$ の計算

$\lfloor \log_2 n \rfloor$ は $n$ の最上位ビットの位置なので、C++20 の `std::bit_width(n) - 1`（GCC なら `31 - __builtin_clz(n)`）で $O(1)$ で求まる.
$1 \le n \le N$ について $\lfloor \log_2 n \rfloor$ の表を $O(N)$ で前計算してもよい.

## 4. 参考資料

- [スパーステーブル - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/sparse_table)（テーブルの定義と構築、重なる 2 区間でよい理由と冪等なモノイドへの一般化、$\log$ の計算、セグメント木などとの比較）
- [静的な列の区間積クエリ - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/static_range_product)（DST・Sqrt Tree など、静的な列の区間積を求める手法の前計算量とクエリの演算回数のトレードオフ）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（テンプレート引数 `op` と `prod` のインターフェース）

## 5. コード

- `sparse_table<S, op>`: 冪等な半群 $(S, \mathrm{op})$ の列を管理する. 単位元は要らない.
- `sparse_table(v)`: 列 `v` で構築する. $O(n \log n)$.
- `get(p)`: $a_p$ を返す. $O(1)$.
- `prod(l, r)`: $\mathrm{op}(a_l, \dots, a_{r-1})$ を返す. $l < r$ であること. $O(1)$.

```cpp title="sparse_table.cpp"
template <class S, S (*op)(S, S)>
struct sparse_table {
  sparse_table() : n(0) {}

  // 列 v で構築する. O(n log n)
  sparse_table(const vector<S>& v) : n(v.size()) {
    int lg = max(1, (int)bit_width((unsigned)n));
    table.assign(lg, {});
    table[0] = v;
    for (int k = 0; k + 1 < lg; k++) {
      // table[k + 1][i] = op(a[i], ..., a[i + 2^(k+1) - 1])
      int m = n - (1 << (k + 1)) + 1;
      table[k + 1].resize(m);
      for (int i = 0; i < m; i++) {
        table[k + 1][i] = op(table[k][i], table[k][i + (1 << k)]);
      }
    }
  }

  // a[p] を返す. O(1)
  S get(int p) const {
    assert(0 <= p && p < n);
    return table[0][p];
  }

  // op(a[l], ..., a[r - 1]) を返す. l < r であること. O(1)
  S prod(int l, int r) const {
    assert(0 <= l && l < r && r <= n);
    int k = bit_width((unsigned)(r - l)) - 1;  // 2^k <= r - l < 2^(k+1)
    return op(table[k][l], table[k][r - (1 << k)]);
  }

 private:
  int n;
  vector<vector<S>> table;
};
```

使用例（区間最小値）:

```cpp
int op(int a, int b) { return min(a, b); }

sparse_table<int, op> st(a);
int mn = st.prod(l, r);  // min(a[l], ..., a[r - 1])
```
