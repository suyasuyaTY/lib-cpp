---
title: "Disjoint Sparse Table"
tags: [range-query, static, monoid]
sidebar:
  order: 8
---
## 1. 概要

更新のない列 $a_0, \dots, a_{N-1}$ に対して、**モノイド**の区間積を $O(1)$ で求めるデータ構造.
区間を**重ならない**左右の 2 区間に分け、それぞれの前計算済みの積を 1 回掛けて答える.
[スパーステーブル](../../data-structure/sparse-table/) と違って冪等性が要らないので、和・積・行列積・アフィン変換の合成なども扱える. 交換法則も逆元も要らない.

| 操作 | 計算量 |
| --- | --- |
| 構築 | $O(N \log N)$ 時間・空間 |
| 区間積（`prod`） | $O(1)$（演算 1 回） |
| 一点取得（`get`） | $O(1)$ |

静的な列の区間積を求める他のデータ構造との使い分けは [スパーステーブル 1 章](../../data-structure/sparse-table/) の表のとおりである.
前計算を $O(N \log \log N)$ に減らした Sqrt Tree（クエリは演算 2 回）もあるが、競技プログラミングでは DST で足りることが多い.

DST の考え方（区間の中央をまたぐクエリを左右の累積で答える）は、モノイドの形をしていない区間クエリにも使える.
例えば「左右それぞれの区間でナップサック DP の表を作り、最後に合わせる」ような問題でも、左右への要素の追加さえできればよい.
クエリが先に全部分かっているなら、分割統治で各段のテーブルを使い回して、空間を $O(N)$ に減らせる（3.4 節）.

## 2. 前提知識

- **モノイド**: 集合 $S$ と二項演算 $\cdot$ の組で、結合法則 $(a \cdot b) \cdot c = a \cdot (b \cdot c)$ と単位元 $e$（$a \cdot e = e \cdot a = a$）をもつもの. 単位元は空区間の積を返すためだけに使う.
- [スパーステーブル](../../data-structure/sparse-table/)（長さが $2$ のべきの区間で前計算する考え方、最上位ビットの求め方）

## 3. Disjoint Sparse Table

### 3.1. 段とブロック

簡単のため $N = 2^K$ とする. 段 $k$（$0 \le k < K$）では、列を長さ $2^{k+1}$ のブロック $[j 2^{k+1}, (j+1) 2^{k+1})$ に区切り、各ブロックをさらに長さ $2^k$ の左半分と右半分に分ける.
ブロックの中央を $m = j 2^{k+1} + 2^k$ として、

$$
\mathrm{table}_{k, i} =
\begin{cases}
a_i \cdot a_{i+1} \cdots a_{m-1} & (i \text{ が左半分 } [m - 2^k, m) \text{ にある}) \\
a_m \cdot a_{m+1} \cdots a_i & (i \text{ が右半分 } [m, m + 2^k) \text{ にある})
\end{cases}
$$

を持つ. つまり、左半分では中央から左へ伸ばした累積積（suffix 積）、右半分では中央から右へ伸ばした累積積（prefix 積）である.
どちらも中央から 1 要素ずつ伸ばしながら

$$
\mathrm{table}_{k, i} = a_i \cdot \mathrm{table}_{k, i+1} \ (\text{左半分}), \qquad
\mathrm{table}_{k, i} = \mathrm{table}_{k, i-1} \cdot a_i \ (\text{右半分})
$$

で計算できるので、各段 $O(N)$、全体で $O(N \log N)$ 時間・空間である.
段 $0$ では左右の半分の長さが $1$ なので、$\mathrm{table}_{0, i} = a_i$ となる.

### 3.2. 区間積

$[l, r)$ の積を、閉区間 $[l, r-1]$ として考える. $l = r - 1$ なら $a_l$ を返せばよいので、$l < r - 1$ とする.

$l$ と $r - 1$ が**同じブロックの別の半分**（$l$ が左半分、$r - 1$ が右半分）に入る段 $k$ が見つかれば、

$$
a_l \cdots a_{r-1} = (a_l \cdots a_{m-1}) \cdot (a_m \cdots a_{r-1}) = \mathrm{table}_{k, l} \cdot \mathrm{table}_{k, r-1}
$$

と、重ならない 2 区間の積で答えられる. この段は $l$ と $r - 1$ の XOR から求まる.

<a id="claim-3-1"></a>

:::note[主張 3.1]
$l < r - 1$ のとき、$k$ を $l \oplus (r - 1)$ の最上位ビットの位置とすると、段 $k$ で $l$ は左半分、$r - 1$ は右半分にあり、2 つは同じブロックに入る.
:::

<details>
<summary>証明</summary>

段 $k$ で $i$ が入るブロックの番号は $\lfloor i / 2^{k+1} \rfloor$ で、これは $i$ のビット $k+1$ 以上で決まる. $i$ が左右どちらの半分にあるかは、ビット $k$ が $0$ か $1$ かで決まる.

$k$ は $l$ と $r - 1$ が異なる最上位のビットなので、ビット $k+1$ 以上は一致し、2 つは段 $k$ で同じブロックに入る.
ビット $k$ は異なり、上位のビットが等しいうえで $l < r - 1$ なので、$l$ のビット $k$ が $0$、$r - 1$ のビット $k$ が $1$ である. よって $l$ は左半分、$r - 1$ は右半分にある. $\square$

</details>

最上位ビットは `std::bit_width(l ^ (r - 1)) - 1` で $O(1)$ で求まるので、クエリは $O(1)$（演算 1 回）である.

### 3.3. $N$ が $2$ のべきでないとき

$N$ を超えない範囲だけテーブルを作ればよい. 段 $k$ のブロックのうち、中央 $m$ が $m < N$ となるものについて、左半分全体と右半分の $[m, \min(m + 2^k, N))$ を埋める.
中央が $N$ 以上のブロックでは、$[l, r-1]$ が左半分に収まるので、そのブロックで答えることはない.
段数は $l \oplus (r - 1) < 2^{\lceil \log_2 N \rceil}$ より $\lceil \log_2 N \rceil$ 段で足りる.

### 3.4. オフライン版（分割統治）

クエリがすべて先に分かっているときは、テーブルを全段保存しなくてよい.
区間 $[l, r)$ を中央 $m$ で分け、作業配列に $m$ から左右へ伸ばした累積を作って、$m$ をまたぐクエリ（$q_l < m < q_r$）にその場で答える.
左半分 $[l, m)$ に収まるクエリ・右半分 $[m, r)$ に収まるクエリは、それぞれ再帰先に渡す.

各クエリはちょうど 1 回答えられ、再帰の深さは $O(\log N)$ なので、クエリ数を $Q$ として時間計算量は $O((N + Q) \log N)$ である.
作業配列は再帰のたびに上書きしてよいので、区間の情報を保持する空間は $O(N)$ で済む.
区間の情報が重い（例えば長さ $C$ の DP 表）とき、オンライン版の $O(N \log N)$ 個に対して $O(N)$ 個で済むのが利点である.

## 4. 参考資料

- [Disjoint Sparse Table - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/disjoint_sparse_table)（段とブロックの切り方、XOR の最上位ビットによる段の決め方、$N$ が $2$ のべきでないときの扱い、オフラインクエリへの分割統治の応用）
- [静的な列の区間積クエリ - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/static_range_product)（DST・Sqrt Tree などの前計算量とクエリの演算回数のトレードオフ）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（テンプレート引数 `op`, `e` と `prod` のインターフェース）

## 5. コード

### 5.1. モノイド版

- `disjoint_sparse_table<S, op, e>`: モノイド $(S, \mathrm{op})$ の列を管理する. `e()` は単位元を返す.
- `disjoint_sparse_table(v)`: 列 `v` で構築する. $O(n \log n)$.
- `get(p)`: $a_p$ を返す. $O(1)$.
- `prod(l, r)`: $\mathrm{op}(a_l, \dots, a_{r-1})$ を返す. $l = r$ なら `e()`. $O(1)$.

```cpp title="disjoint_sparse_table.cpp"
template <class S, S (*op)(S, S), S (*e)()>
struct disjoint_sparse_table {
  disjoint_sparse_table() : n(0) {}

  // 列 v で構築する. O(n log n)
  disjoint_sparse_table(const vector<S>& v) : n(v.size()) {
    int lg = max(1, (int)bit_width((unsigned)max(n - 1, 0)));
    table.assign(lg, vector<S>(n));
    table[0] = v;  // 段 0 は半分の長さが 1 なので a[i] そのもの
    for (int k = 1; k < lg; k++) {
      int half = 1 << k;
      for (int m = half; m < n; m += 2 * half) {
        // 左半分 [m - half, m): a[i] から a[m - 1] までの積（suffix 積）
        table[k][m - 1] = v[m - 1];
        for (int i = m - 2; i >= m - half; i--) table[k][i] = op(v[i], table[k][i + 1]);
        // 右半分 [m, min(m + half, n)): a[m] から a[i] までの積（prefix 積）
        table[k][m] = v[m];
        for (int i = m + 1; i < min(m + half, n); i++) table[k][i] = op(table[k][i - 1], v[i]);
      }
    }
  }

  // a[p] を返す. O(1)
  S get(int p) const {
    assert(0 <= p && p < n);
    return table[0][p];
  }

  // op(a[l], ..., a[r - 1]) を返す. l == r なら e(). O(1)
  S prod(int l, int r) const {
    assert(0 <= l && l <= r && r <= n);
    if (l == r) return e();
    r--;  // 閉区間 [l, r] にする
    if (l == r) return table[0][l];
    int k = bit_width((unsigned)(l ^ r)) - 1;  // l が左半分、r が右半分に入る段
    return op(table[k][l], table[k][r]);
  }

 private:
  int n;
  vector<vector<S>> table;
};
```

使用例（アフィン変換 $x \mapsto ax + b$ の合成. 左の要素から順に作用させる）:

```cpp
const long long MOD = 998244353;
using F = pair<long long, long long>;  // x -> first * x + second
F op(F f, F g) { return {f.first * g.first % MOD, (f.second * g.first + g.second) % MOD}; }
F e() { return {1, 0}; }

disjoint_sparse_table<F, op, e> dst(fs);
auto [a, b] = dst.prod(l, r);  // f[l], ..., f[r - 1] の順に作用させた合成
```

### 5.2. ひな形（オンライン版）

モノイドの形をしていない区間クエリ用のひな形. 区間の情報を表す `S` と、左右への要素の追加・クエリへの回答を用途に応じて定義する.
長さ 1 の区間は `query_single` で個別に扱う. 計算量は、これらの操作と `S` のコピーを $O(1)$ で行える場合、構築 $O(N \log N)$、クエリ $O(1)$ である.

```cpp title="disjoint_sparse_table_online.cpp"
// 区間について保持したい情報
struct S {
};

// クエリ
struct Query {
  int l, r;  // [l, r), l < r
};

// 要素 i 単体から状態を作る
auto make_single = [&](int i) -> S {
};

// 要素 i を既存区間の「左」に追加する
auto merge_left = [&](int i, const S &right) -> S {
};

// 要素 i を既存区間の「右」に追加する
auto merge_right = [&](const S &left, int i) -> S {
};

// left = [l, m) の情報と right = [m, r) の情報を使ってクエリに答える
auto query = [&](const S &left, const S &right, const Query &q) {
};

// 区間長が 1 の場合
auto query_single = [&](int i, const Query &q) {
};

// DST 構築
int K = 0;
while ((1 << K) < N) K++;
vector<vector<S>> table(K, vector<S>(N));
for (int k = 0; k < K; k++) {
  int half = 1 << k;
  for (int l = 0; l < N; l += 2 * half) {
    int m = l + half;  // ブロック [l, l + 2 * half) の中央
    int r = min(l + 2 * half, N);
    if (m >= N) break;

    table[k][m - 1] = make_single(m - 1);
    for (int i = m - 2; i >= l; i--) table[k][i] = merge_left(i, table[k][i + 1]);

    table[k][m] = make_single(m);
    for (int i = m + 1; i < r; i++) table[k][i] = merge_right(table[k][i - 1], i);
  }
}

// クエリ q に答える
for (const Query &q : queries) {
  if (q.r - q.l == 1) {
    query_single(q.l, q);
  } else {
    int k = bit_width((unsigned)(q.l ^ (q.r - 1))) - 1;
    query(table[k][q.l], table[k][q.r - 1], q);
  }
}
```

### 5.3. ひな形（オフライン版）

3.4 節の分割統治. `S`・`Query`・`make_single`・`merge_left`・`merge_right`・`query`・`query_single` は 5.2 節と同じものを定義し、クエリを `queries` に入れておく.
時間計算量は $O((N + Q) \log N)$、区間の情報を保持する作業配列は $O(N)$ 個である.

```cpp title="disjoint_sparse_table_offline.cpp"
// 分割統治用の作業配列. 再帰ごとに上書きしてよい
vector<S> dp(N);
auto solve = [&](auto &solve, int l, int r, const vector<int> &query_id) -> void {
  // この区間にクエリがない
  if (query_id.empty()) return;

  if (l + 1 == r) {
    for (int id : query_id) query_single(l, queries[id]);
    return;
  }

  int m = (l + r) / 2;

  // m から左右へ伸ばした累積を作る
  dp[m - 1] = make_single(m - 1);
  for (int i = m - 2; i >= l; i--) dp[i] = merge_left(i, dp[i + 1]);
  dp[m] = make_single(m);
  for (int i = m + 1; i < r; i++) dp[i] = merge_right(dp[i - 1], i);

  vector<int> left_query, right_query;
  for (int id : query_id) {
    const Query &q = queries[id];
    if (q.r <= m) {
      left_query.push_back(id);  // 完全に左
    } else if (q.l >= m) {
      right_query.push_back(id);  // 完全に右
    } else {
      query(dp[q.l], dp[q.r - 1], q);  // m をまたぐ
    }
  }

  solve(solve, l, m, left_query);
  solve(solve, m, r, right_query);
};

vector<int> all(queries.size());
iota(all.begin(), all.end(), 0);
solve(solve, 0, N, all);
```
