---
title: "Mo's Algorithm"
tags: [offline, range-query, sqrt]
sidebar:
  order: 1
---
## 1. 概要

**更新のない列**に対する区間クエリ $[l, r)$ を、処理する順番を並べ替えて高速に答える手法.
次の 2 つを満たすときに使える.

- クエリを先読みできる（オフライン）.
- 今の区間の両端に 1 要素を**追加・削除**したときの答えの変化が、速く計算できる.

区間を 1 つずつずらしながら答えを更新していき、端点の移動量の合計を $O(N\sqrt{Q})$ に抑える.
例えば「区間内の値の種類数」は、値ごとの出現回数を持てば追加・削除が $O(1)$ なので、全体 $O(N\sqrt{Q})$ で求まる.

## 2. 前提知識

- [平方分割](../../data-structure/sqrt-decomposition/)（[3.5 節](#35-答えの取得が重いとき)で使う）
- [オイラーツアー](../../graph/euler-tour/)、[LCA](../../graph/lca/)（[4 章](#4-木上のパスクエリ)で使う）

## 3. 列の区間クエリ

以下、記号を次のように定める.

| 記号 | 意味 |
| --- | --- |
| $N$ | 区間の端点が動く範囲. 列の長さで、クエリは $0 \leq l \leq r \leq N$ を満たす |
| $Q$ | クエリの個数 |
| $B$ | 左端をまとめるブロックの幅 |
| $T$ | 1 要素の追加・削除にかかる時間 |
| $K$ | 今の区間の答えを取り出すのにかかる時間 |

### 3.1. 考え方

区間 $[l, r)$ を平面上の点 $(l, r)$ とみると、クエリの処理は「点を順にたどる経路」になり、端点の移動量の合計はその経路のマンハッタン距離の和になる.
ある区間の答えから隣の区間の答えへは、1 要素の追加・削除でたどれるので、計算時間は移動量 $\times T$ になる.
そこで、移動量が小さくなるようにクエリの順番を並べ替える.

### 3.2. クエリの並べ替え

1. 左端 $l$ を幅 $B$ のブロックに分け、ブロック番号 $\lfloor l/B \rfloor$ の昇順に処理する.
2. 同じブロックの中では、右端 $r$ について、偶数番目のブロックなら昇順、奇数番目のブロックなら降順に処理する.

2 の「偶奇で向きを変える」工夫により、ブロックが変わるたびに右端が $N$ から $0$ へ戻る無駄がなくなる.

各クエリでは、区間を広げる移動を先に、狭める移動を後に行う. こうすると途中で $l > r$ にならない.

### 3.3. 計算量

- **左端の移動**: 同じブロック内では 1 クエリあたり $B$ 以下、ブロックをまたぐ移動は合計 $O(N)$. 合わせて $O(QB + N)$.
- **右端の移動**: 1 つのブロックの中では単調なので $N$ 以下、ブロックは $N/B$ 個. 合わせて $O(N^2/B)$.

全体は $O\left(T\left(QB + \frac{N^2}{B}\right) + QK\right)$ で、相加相乗平均から $B = N/\sqrt{Q}$ のとき最小になり、

$$
O\left(TN\sqrt{Q} + QK\right)
$$

となる（$1 \leq Q \leq N^2$ とする. ほかにクエリのソートで $O(Q \log Q)$）.

### 3.4. 実行時間の目安

ランダムな $N = Q$ の入力で、端点の移動回数と実行時間を測った（`-O2`、1 回の追加・削除が配列アクセス程度の $T = O(1)$ と、Fenwick 木を 1 回更新する $T = O(\log N)$）.
移動回数は $N\sqrt{Q}$ の約 $0.83$ 倍だった.

| $N = Q$ | 移動回数 | $T = O(1)$ | $T = O(\log N)$ |
| --- | --- | --- | --- |
| $10^5$ | $2.6 \times 10^7$ | 0.09 秒 | 0.5 秒 |
| $2 \times 10^5$ | $7.5 \times 10^7$ | 0.24 秒 | 1.8 秒 |
| $5 \times 10^5$ | $3.0 \times 10^8$ | 1.1 秒 | 9.7 秒 |
| $10^6$ | $8.3 \times 10^8$ | 3.5 秒 | 37 秒 |

1 秒あたりに処理できる量の目安は次のとおり（環境で数倍は変わるので余裕を持つ）.

- $T = O(1)$: $N\sqrt{Q} \approx 3 \times 10^8$. 制限時間 2 秒なら $N = Q = 5 \times 10^5$ 程度まで.
- $T = O(\log N)$: $N\sqrt{Q} \approx 4 \times 10^7$. 制限時間 2 秒なら $N = Q = 2 \times 10^5$ が限度.

$T = O(1)$ でも、追加・削除がランダムアクセスになる（値ごとの出現回数を持つなど）と、キャッシュミスで移動 1 回あたり数 ns かかる.

### 3.5. 答えの取得が重いとき

追加・削除は $O(N\sqrt{Q})$ 回起こるのに対し、答えの取得は $Q$ 回しか起こらない.
そのため、取得を重くしてでも追加・削除を軽くするデータ構造が有利になる.

例として、値の種類数を $M$ とし、区間内の $k$ 番目に小さい値を求める. 値ごとの出現回数を管理すると、次の違いがある.

| データ構造 | 追加・削除 $T$ | 答えの取得 $K$ | Mo 全体 |
| --- | --- | --- | --- |
| Fenwick 木 | $O(\log M)$ | $O(\log M)$ ※ | $O((N\sqrt{Q} + Q)\log M)$ |
| [平方分割](../../data-structure/sqrt-decomposition/) | $O(1)$ | $O(\sqrt{M})$ | $O(N\sqrt{Q} + Q\sqrt{M})$ |

※ Fenwick 木上で二分累乗による探索を行う. 累積和を呼ぶ通常の二分探索だと $O(\log^2 M)$.

平方分割では `add` で出現回数を増減し、`max_right` で $k$ 番目を探す.

### 3.6. コード

- `mo(n, query)`: 各クエリの答えを `query` の順に並べて返す. $O(Q \log Q + TN\sqrt{Q} + QK)$.
  - `n`: 区間の端点が動く範囲（列の長さ）. 各クエリ $[l, r)$ は $0 \leq l \leq r \leq n$ を満たすこと. **クエリの個数ではない**.
  - `query`: 半開区間 $[l, r)$ を `{l, r}` で並べたもの.

```cpp title="mo_algorithm.cpp"
// 列の区間クエリ [l, r) を Mo's algorithm で処理し、答えを query の順に返す
// n: 区間の端点が動く範囲（0 <= l <= r <= n）. クエリの個数ではない
auto mo = [&](int n, const vector<pii>& query) {
  int q = query.size();
  int B = max(1, (int)(n / sqrt(max(1, q))));  // ブロック幅 N / √Q

  vector<int> order(q);
  iota(order.begin(), order.end(), 0);
  ranges::sort(order, [&](int a, int b) {
    int ba = query[a].first / B, bb = query[b].first / B;
    if (ba != bb) return ba < bb;
    // 偶数ブロックは r の昇順、奇数ブロックは r の降順
    if (ba % 2 == 0) return query[a].second < query[b].second;
    return query[a].second > query[b].second;
  });

  vector<ll> ans(q);
  int l = 0, r = 0;
  for (int i : order) {
    auto [L, R] = query[i];
    // 広げる移動を先に、狭める移動を後に行う
    while (l > L) add(--l);
    while (r < R) add(r++);
    while (l < L) remove(l++);
    while (r > R) remove(--r);
    ans[i] = get(i);
  }
  return ans;
}
```


## 4. 木上のパスクエリ

### 4.1. 考え方

頂点数 $V$ の木で、パス $u$-$v$ 上の頂点についてのクエリにも使える.

DFS で、頂点に**入るときと出るときの両方**で頂点を記録した長さ $2V$ の列（オイラーツアー）を作る. 頂点 $v$ を入るときに記録した位置を $\mathrm{in}_v$、出るときに記録した位置を $\mathrm{out}_v$ とする.
$\mathrm{in}_u \leq \mathrm{in}_v$ とし、$w = \mathrm{lca}(u, v)$ とすると、

- $w = u$ のとき: 区間 $[\mathrm{in}_u, \mathrm{in}_v]$ に**ちょうど 1 回**現れる頂点が、パス上の頂点である.
- $w \neq u$ のとき: 区間 $[\mathrm{out}_u, \mathrm{in}_v]$ にちょうど 1 回現れる頂点に、$w$ を加えたものがパス上の頂点である.

区間内で 2 回現れる頂点は、その部分木に入って出てきただけなのでパスに含まれない.
そこで、端点の移動で頂点を見るたびに「含まれていなければ追加、含まれていれば削除」と切り替える（`toggle`）.
列の長さが $2V$ になるので、計算量は 3 章の $N$ を $2V$ に置き換えたものになる.

### 4.2. コード

- `mo_tree(G, path)`: 各パスクエリの答えを `path` の順に並べて返す.
  - `G`: 木の隣接リスト（頂点 $0$ を根として DFS する）.
  - `path`: パスの両端 `{u, v}` を並べたもの.
  - `lca(u, v)`: $u, v$ の LCA を返す関数.
- DFS は再帰を使わずスタックで行うので、深い木でもスタックオーバーフローしない.

```cpp title="mo_tree.cpp"
// 木のパスクエリ u-v を Mo's algorithm で処理し、答えを path の順に返す
// G: 木の隣接リスト（根は 0）, lca(u, v): LCA を返す
// add(v), remove(v): 頂点 v をパスに追加・削除する
// get(q): 今のパスでのクエリ q の答えを返す
auto mo_tree = [&](const vector<vector<int>>& G, const vector<pii>& path) {
  int V = G.size(), q = path.size();

  // オイラーツアー: 入るときと出るときに頂点を記録する（長さ 2V）
  vector<int> in(V), out(V), tour, par(V, -1), it(V, 0), st = {0};
  in[0] = 0;
  tour.push_back(0);
  while (!st.empty()) {
    int v = st.back();
    if (it[v] < (int)G[v].size()) {
      int w = G[v][it[v]++];
      if (w == par[v]) continue;
      par[w] = v;
      in[w] = tour.size();
      tour.push_back(w);
      st.push_back(w);
    } else {
      out[v] = tour.size();
      tour.push_back(v);
      st.pop_back();
    }
  }

  // パスをツアー上の区間 [l, r) に変換する
  vector<pii> query(q);
  vector<int> extra(q, -1);  // 区間に含まれない LCA
  for (int i = 0; i < q; i++) {
    auto [u, v] = path[i];
    if (in[u] > in[v]) swap(u, v);
    int w = lca(u, v);
    if (w == u) {
      query[i] = {in[u], in[v] + 1};
    } else {
      query[i] = {out[u], in[v] + 1};
      extra[i] = w;
    }
  }

  int n = tour.size();
  int B = max(1, (int)(n / sqrt(max(1, q))));  // ブロック幅 N / √Q

  vector<int> order(q);
  iota(order.begin(), order.end(), 0);
  ranges::sort(order, [&](int a, int b) {
    int ba = query[a].first / B, bb = query[b].first / B;
    if (ba != bb) return ba < bb;
    // 偶数ブロックは r の昇順、奇数ブロックは r の降順
    if (ba % 2 == 0) return query[a].second < query[b].second;
    return query[a].second > query[b].second;
  });

  // 区間内にちょうど 1 回現れる頂点だけを含める
  vector<bool> active(V, false);
  auto toggle = [&](int v) {
    if (active[v]) remove(v);
    else add(v);
    active[v] = !active[v];
  };

  vector<decay_t<decltype(get(0))>> ans(q);
  int l = 0, r = 0;
  for (int i : order) {
    auto [L, R] = query[i];
    while (l > L) toggle(tour[--l]);
    while (r < R) toggle(tour[r++]);
    while (l < L) toggle(tour[l++]);
    while (r > R) toggle(tour[--r]);
    if (extra[i] != -1) add(extra[i]);
    ans[i] = get(i);
    if (extra[i] != -1) remove(extra[i]);
  }
  return ans;
}
```

## 5. 参考資料

- [Mo's algorithm - ei1333の日記](https://ei1333.hateblo.jp/entry/2017/09/11/211011)（クエリの並べ替えと計算量の評価）
- [Sqrt Decomposition (Mo's algorithm) - cp-algorithms](https://cp-algorithms.com/data_structures/sqrt_decomposition.html#mos-algorithm)（ブロック幅の選び方と、偶奇で右端の向きを変える工夫）
- [Mo's Algorithm on Trees - Codeforces](https://codeforces.com/blog/entry/43230)（入る・出るの両方を記録するオイラーツアーと LCA の扱い）
