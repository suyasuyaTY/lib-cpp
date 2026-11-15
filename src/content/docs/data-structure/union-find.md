---
title: "Union-Find"
tags: [union-find]
sidebar:
  order: 16
---
## 1. 概要

$N$ 頂点、辺なしのグラフに辺を追加しながら、2 頂点が連結かどうかを答えるデータ構造（Disjoint Set Union, DSU）.
各連結成分には**リーダー**（代表元）と呼ぶ頂点が 1 つ決まっていて、2 頂点が連結であることは、リーダーが等しいことと同じである.

| 操作 | 計算量 |
| --- | --- |
| 辺の追加（`merge`） | 償却 $O(\log N)$ |
| 連結判定（`same`） | 償却 $O(\log N)$ |
| リーダー（`leader`） | 償却 $O(\log N)$ |
| 連結成分のサイズ（`size`） | 償却 $O(\log N)$ |
| 連結成分の一覧（`groups`） | $O(N \log N)$ |

このページの実装は [AtCoder Library（ACL）の dsu](https://atcoder.github.io/ac-library/production/document_ja/dsu.html) と同じインターフェースだが、union by size をせず経路圧縮だけを使う.
そのため **`merge(a, b)` の後のリーダーは必ず merge 前の `leader(a)` になる**（ACL の dsu では $a$ 側・$b$ 側のどちらになるか決められない. 3.3 節）.
計算量は償却 $O(\log N)$ になるが、実用上はほとんど遅くならない.

## 2. 前提知識

- 特になし.

## 3. Union-Find の仕組み

### 3.1. 根付き森で持つ

各連結成分を 1 つの根付き木で表し、**木の根をリーダー**とする. 頂点 $v$ は親 $\mathrm{par}(v)$ だけを持ち、根は自分が根であることと成分のサイズを持つ.

- **根を求める**（find）: 親をたどって根まで登る.
- **併合する**（union）: $a, b$ の根 $x, y$ を求め、$x \neq y$ なら一方の根をもう一方の根の子にする.

ACL と同じく、`parent_or_size[v]` という 1 つの配列で、根なら $-(\text{サイズ})$、そうでなければ親を持つ.
このままでは木が一直線に伸びて、根を求めるのに $O(N)$ かかりうる.

### 3.2. 経路圧縮

**根を求めるときに通った頂点の親を、すべて根に付け替える.**
付け替えても各頂点の属する木（成分）とその根は変わらないので、答えには影響しない. 一度通った経路は次からは 1 歩で根に着く.

:::note[定理 3.1]
経路圧縮だけを使った Union-Find で、$N$ 頂点に対して find と union を合わせて $Q$ 回（$Q \ge N$）行うと、全体の計算量は $O(Q \log_{2 + Q/N} N)$ である. 特に 1 回あたり償却 $O(\log N)$ である.
:::

証明は Tarjan–van Leeuwen の論文（参考資料）にある.
union を「どちらの根をどちらの子にするか」を任意に選んでも成り立つので、次節のようにリーダーを固定できる.

:::tip[union by size も使うとき]
サイズの小さい木の根を大きい木の根の子にする（union by size）と、経路圧縮と合わせて全体 $O(N + Q\alpha(N))$ になる（[Union-Find の計算量上界](https://info.atcoder.jp/entry/algorithm_lectures/unionfind_complexity)）. $\alpha$ は[逆アッカーマン関数](https://info.atcoder.jp/entry/algorithm_lectures/ackermann_function)で、実用上は $4$ 以下の定数とみなせる.
ただし新しい根が $a, b$ のサイズで決まるので、リーダーが勝手に入れ替わる. 経路圧縮だけでも $\log$ の底が $2 + Q/N$ と大きく、実際の木も低いので、速度の差はほとんど出ない.
:::

:::caution
経路圧縮をすると木の形が変わるので、操作を取り消したいときには使えない. その場合は union by size だけで $O(\log N)$ にする（[Rollback 付き Union-Find](../../data-structure/rollback-union-find/)）.
:::

### 3.3. リーダーを固定する

`merge(a, b)` では、**常に $b$ の根 $y$ を $a$ の根 $x$ の子にする**. すると新しい根、つまり新しいリーダーは必ず $x = \mathrm{leader}(a)$ である.

ACL の dsu は union by size のために、`merge(a, b)` で**サイズの大きい方の根**を新しい根にする.
したがって `merge(a, b)` と書いても $a$ のリーダーが残るとは限らない（ACL のドキュメントも「元の二つの成分の代表元のいずれか」としか保証していない）.
これが困るのは、**リーダーに成分の情報を持たせて、「$a$ の成分に $b$ の成分を吸収する」処理をしたいとき**である.

```cpp
// ACL の dsu
int la = d.leader(a), lb = d.leader(b);
int l = d.merge(a, b);         // l は la にも lb にもなりうる
val[l] = f(val[la], val[lb]);  // 値を新しいリーダーへ移し直す必要がある
```

値を新しいリーダーへ移し直せば対処できるが、移し忘れたり、どちらの値を残すかを間違えたりしやすい.
また、**リーダーの頂点番号自体に意味がある**場合は、値の移し替えでは対処できない.
例えば、木の頂点を親の成分に吸収していきながら「成分のリーダー＝成分の中で最も根に近い頂点」を保ちたいとき、`merge(親, 子)` の後のリーダーは親側でなければならない.

このページの実装なら、どちらも `merge(a, b)` と書くだけでよい.

## 4. 参考資料

- [Worst-case Analysis of Set Union Algorithms - Journal of the ACM](https://doi.org/10.1145/62.2160)（R. E. Tarjan, J. van Leeuwen. 経路圧縮だけを使ったときの $O(Q \log_{2 + Q/N} N)$ の評価）
- [Union-Find の計算量上界 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/unionfind_complexity)（union by size と経路圧縮での $O(N + Q\alpha(N))$ の証明）
- [アッカーマン関数，逆アッカーマン関数 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/ackermann_function)（逆アッカーマン関数の定義と値の目安）
- [DSU - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/dsu.html)（インターフェースと、merge 後の代表元についての仕様）

## 5. コード

- `dsu(n)`: $n$ 頂点、辺なしで初期化する. $O(n)$.
- `merge(a, b)`: 辺 $(a, b)$ を追加し、新しいリーダーを返す. **新しいリーダーは必ず merge 前の `leader(a)`**. すでに連結なら何も変えず `leader(a)` を返す. 償却 $O(\log n)$.
- `same(a, b)`: $a, b$ が連結かを返す. 償却 $O(\log n)$.
- `leader(a)`: $a$ を含む連結成分のリーダーを返す. 償却 $O(\log n)$.
- `size(a)`: $a$ を含む連結成分の頂点数を返す. 償却 $O(\log n)$.
- `groups()`: 連結成分ごとの頂点のリストを返す. **各成分の中は頂点番号の昇順、成分どうしは最小の頂点番号の昇順**に並ぶ（ACL では未定義）. $O(n \log n)$.

木が一直線になると深さが $n$ になりうるので、`leader` は再帰でなくループで書く（スタックオーバーフロー対策）.

```cpp title="dsu.cpp"
struct dsu {
 public:
  dsu() : _n(0) {}

  // n 頂点、辺なしで初期化する. O(n)
  explicit dsu(int n) : _n(n), parent_or_size(n, -1) {}

  // a と b を連結にし、新しいリーダーを返す.
  // リーダーは必ず merge 前の leader(a) になる. 償却 O(log n)
  int merge(int a, int b) {
    assert(0 <= a && a < _n);
    assert(0 <= b && b < _n);
    int x = leader(a), y = leader(b);
    if (x == y) return x;
    // 常に b 側の根を a 側の根の子にする
    parent_or_size[x] += parent_or_size[y];
    parent_or_size[y] = x;
    return x;
  }

  // a と b が連結か. 償却 O(log n)
  bool same(int a, int b) {
    assert(0 <= a && a < _n);
    assert(0 <= b && b < _n);
    return leader(a) == leader(b);
  }

  // a を含む連結成分のリーダー（木の根）. 経路圧縮をする. 償却 O(log n)
  int leader(int a) {
    assert(0 <= a && a < _n);
    int r = a;
    while (parent_or_size[r] >= 0) r = parent_or_size[r];
    while (parent_or_size[a] >= 0) {
      int p = parent_or_size[a];
      parent_or_size[a] = r;
      a = p;
    }
    return r;
  }

  // a を含む連結成分のサイズ. 償却 O(log n)
  int size(int a) {
    assert(0 <= a && a < _n);
    return -parent_or_size[leader(a)];
  }

  // 連結成分の一覧. 各成分内は頂点番号の昇順、成分は最小の頂点番号の昇順. O(n log n)
  vector<vector<int>> groups() {
    vector<int> id(_n, -1);
    vector<vector<int>> result;
    for (int i = 0; i < _n; i++) {
      int r = leader(i);
      if (id[r] == -1) {
        id[r] = result.size();
        result.emplace_back();
      }
      result[id[r]].push_back(i);
    }
    return result;
  }

 private:
  int _n;
  // 根なら -(成分のサイズ)、そうでなければ親
  vector<int> parent_or_size;
};
```

使用例（成分に値を持たせて、$a$ の成分に $b$ の成分を吸収する）:

```cpp
dsu d(n);
vector<long long> val(n);  // val[leader] にその成分の値を持つ
// a の成分に b の成分を吸収する
int la = d.leader(a), lb = d.leader(b);
if (la != lb) {
  d.merge(a, b);  // リーダーは la のまま
  val[la] += val[lb];
}
```
