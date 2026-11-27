---
title: "重み付き Union-Find"
tags: [union-find, potential]
sidebar:
  order: 17
---
## 1. 概要

各頂点 $v$ に未知の値（ポテンシャル）$p(v)$ があるとして、「$p(b) - p(a) = w$」という制約を 1 つずつ加えながら、

- 2 頂点の差 $p(b) - p(a)$ が制約から決まるか（連結か）、決まるならその値
- 新しい制約がこれまでの制約と矛盾しないか

を答えるデータ構造. [Union-Find](../../data-structure/union-find/) の各辺に重みを持たせて実現する.

| 操作 | 計算量 |
| --- | --- |
| 制約の追加・矛盾判定（`merge`） | 償却 $O(\alpha(N))$ |
| 連結判定（`same`） | 償却 $O(\alpha(N))$ |
| 差の取得（`diff`） | 償却 $O(\alpha(N))$ |
| リーダー・サイズ（`leader`, `size`） | 償却 $O(\alpha(N))$ |
| 連結成分の一覧（`groups`） | $O(N \alpha(N))$ |

重みは加法についての**可換群**（`int`, `long long`, modint など. `+` と `-` が使える型）であればよい.

## 2. 前提知識

- [Union-Find](../../data-structure/union-find/): union by size と経路圧縮.
- [ポテンシャル](../../graph/potential/): 頂点に値を割り当てて、辺の重みを差で表す考え方.

## 3. 重み付き Union-Find

### 3.1. ポテンシャルの持ち方

制約 $p(b) - p(a) = w$ を、頂点 $a$ から $b$ への重み $w$ の辺とみなす.
連結成分の中では、根 $r$ を基準（$p(r) = 0$ とみなす）にすれば、すべての頂点のポテンシャルが決まる. そこで各頂点 $v$ に

$$
d(v) = p(v) - p(\mathrm{par}(v))
$$

（親との差、根では $0$）を持たせる. 根 $r$ までの経路 $v = v_0, v_1, \dots, v_k = r$ に沿って足すと

$$
\mathrm{weight}(v) := p(v) - p(r) = \sum_{i=0}^{k-1} d(v_i)
$$

となる. 同じ成分の 2 頂点 $a, b$ の差は、根が共通なので

$$
p(b) - p(a) = \mathrm{weight}(b) - \mathrm{weight}(a)
$$

で求まる. 別の成分の 2 頂点の差は、制約からは決まらない.

### 3.2. 経路圧縮での重みの更新

経路圧縮で $v$ の親を根 $r$ に付け替えるときは、$d(v)$ を $p(v) - p(r)$ に更新する.
再帰で親 $u = \mathrm{par}(v)$ を先に圧縮すると、その時点で $d(u) = p(u) - p(r)$ になっているので、

$$
p(v) - p(r) = \bigl(p(v) - p(u)\bigr) + \bigl(p(u) - p(r)\bigr) = d(v) + d(u)
$$

より $d(v) \leftarrow d(v) + d(u)$ とすればよい.

```cpp
int leader(int a) {
  if (parent_or_size[a] < 0) return a;
  int p = parent_or_size[a];
  int r = leader(p);                    // d(p) = p(p) - p(r) になる
  diff_to_parent[a] += diff_to_parent[p];
  return parent_or_size[a] = r;
}
```

`leader(v)` を呼んだ直後は $v$ の親が根なので、$\mathrm{weight}(v) = d(v)$ である.

### 3.3. merge での重みの式

制約 $p(b) - p(a) = w$ を加える. $a, b$ の根をそれぞれ $x, y$ とする.

- **$x = y$ のとき**: $p(b) - p(a)$ はすでに決まっている. $\mathrm{weight}(b) - \mathrm{weight}(a) = w$ なら矛盾なし、そうでなければ**矛盾**である. どちらの場合も何も変えない.
- **$x \neq y$ のとき**: 根どうしを辺でつなぐ. $y$ を $x$ の子にするなら、$d(y) = p(y) - p(x)$ を求めればよい.

$$
\begin{aligned}
p(y) - p(x)
&= \bigl(p(b) - p(a)\bigr) + \bigl(p(a) - p(x)\bigr) - \bigl(p(b) - p(y)\bigr) \\
&= w + \mathrm{weight}(a) - \mathrm{weight}(b)
\end{aligned}
$$

union by size のために逆に $x$ を $y$ の子にするときは、$d(x) = p(x) - p(y)$ なので符号を反転すればよい.
新しい辺は根どうしを結ぶだけで、他の頂点の $d$ は変わらない（根からの差は根を基準に正しいまま）.

計算量は通常の Union-Find と同じで、各操作は償却 $O(\alpha(N))$ である.

:::tip
矛盾判定は「すべての制約を満たす $p$ が存在するか」の判定になる.
制約を 1 つずつ `merge` して、`false` が返ったところで矛盾が見つかる.
:::

:::caution
重みには逆元（引き算）が必要である. 結合法則と交換法則も使うので、加法の可換群でなければならない.
足し算が積み重なるので、`int` ではオーバーフローに注意する.
:::

## 4. 参考資料

- [Union-Find の計算量上界 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/unionfind_complexity)（union by size と経路圧縮の計算量）
- [DSU - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/dsu.html)（インターフェース）

## 5. コード

- `weighted_dsu<T>`: 重みの型 `T` は加法の可換群（`+`, `-`, `T(0)` が使える型）.
- `weighted_dsu(n)`: $n$ 頂点、制約なしで初期化する. $O(n)$.
- `merge(a, b, w)`: 制約 $p(b) - p(a) = w$ を加える. $a, b$ がすでに連結なら何も変えず、制約と矛盾しなければ `true`、矛盾すれば `false` を返す. 連結でなければ併合して `true` を返す. 償却 $O(\alpha(n))$.
- `same(a, b)`: $a, b$ が連結（差が決まる）かを返す. 償却 $O(\alpha(n))$.
- `diff(a, b)`: $p(b) - p(a)$ を返す. $a, b$ が連結であること. 償却 $O(\alpha(n))$.
- `weight(a)`: $p(a) - p(\mathrm{leader}(a))$ を返す. 償却 $O(\alpha(n))$.
- `leader(a)`: $a$ を含む連結成分の根を返す. 償却 $O(\alpha(n))$.
- `size(a)`: $a$ を含む連結成分の頂点数を返す. 償却 $O(\alpha(n))$.
- `groups()`: 連結成分ごとの頂点のリストを返す. 各成分の中は頂点番号の昇順、成分どうしは最小の頂点番号の昇順. $O(n \alpha(n))$.

```cpp title="weighted_dsu.cpp"
template <class T>
struct weighted_dsu {
 public:
  weighted_dsu() : _n(0) {}

  // n 頂点、辺なし、ポテンシャル差の制約なしで初期化する. O(n)
  explicit weighted_dsu(int n) : _n(n), parent_or_size(n, -1), diff_to_parent(n, T(0)) {}

  // 制約 v[b] - v[a] = w を加える.
  // すでに a, b が連結なら何も変えず、制約と矛盾しないかを返す. 償却 O(α(n))
  bool merge(int a, int b, T w) {
    assert(0 <= a && a < _n);
    assert(0 <= b && b < _n);
    int x = leader(a), y = leader(b);
    if (x == y) return diff(a, b) == w;
    // v[y] - v[x] = w + (v[a] - v[x]) - (v[b] - v[y])
    w += diff_to_parent[a] - diff_to_parent[b];
    if (-parent_or_size[x] < -parent_or_size[y]) {
      swap(x, y);
      w = -w;
    }
    // ここで v[y] - v[x] = w. y を x の子にする
    parent_or_size[x] += parent_or_size[y];
    parent_or_size[y] = x;
    diff_to_parent[y] = w;
    return true;
  }

  // a と b が連結か. 償却 O(α(n))
  bool same(int a, int b) {
    assert(0 <= a && a < _n);
    assert(0 <= b && b < _n);
    return leader(a) == leader(b);
  }

  // a を含む連結成分のリーダー（根）. 償却 O(α(n))
  int leader(int a) {
    assert(0 <= a && a < _n);
    if (parent_or_size[a] < 0) return a;
    int p = parent_or_size[a];
    int r = leader(p);
    // ここで diff_to_parent[p] = v[p] - v[r] になっている
    diff_to_parent[a] += diff_to_parent[p];
    return parent_or_size[a] = r;
  }

  // v[a] - v[leader(a)] を返す. 償却 O(α(n))
  T weight(int a) {
    leader(a);
    return diff_to_parent[a];
  }

  // v[b] - v[a] を返す. a, b は連結であること. 償却 O(α(n))
  T diff(int a, int b) {
    assert(same(a, b));
    return weight(b) - weight(a);
  }

  // a を含む連結成分のサイズ. 償却 O(α(n))
  int size(int a) {
    return -parent_or_size[leader(a)];
  }

  // 連結成分の一覧. 各成分内は頂点番号の昇順、成分は最小の頂点番号の昇順. O(n α(n))
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
  // 根以外: v[a] - v[親]. 根: 0
  vector<T> diff_to_parent;
};
```

使用例（制約 $p(r_i) - p(l_i) = w_i$ がすべて満たせるか）:

```cpp
weighted_dsu<long long> d(n);
bool ok = true;
for (int i = 0; i < m; i++) ok &= d.merge(l[i], r[i], w[i]);
```
