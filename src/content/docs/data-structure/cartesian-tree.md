---
title: "Cartesian Tree"
tags: [tree, monotonic-stack]
sidebar:
  order: 14
---
## 1. 概要

列 $a_0, \dots, a_{N-1}$ から、「区間の最小値を根にして、その左右を再帰的に木にする」ことで得られる二分木を **Cartesian Tree** という.
各頂点の部分木が列の区間に対応し、区間の最小値を取る位置が木の構造として表れる.

| 処理 | 計算量 |
| --- | --- |
| 構築（各頂点の親, `cartesian_tree`） | $O(N)$ |
| 各頂点の部分木が表す区間（`cartesian_tree_ranges`） | $O(N)$ |

区間の最小値ごとに数え上げる問題（「すべての区間の最小値の和」など）や、最小値で区間を分割していく分割統治を、木の上の処理として書けるようになる.

## 2. 前提知識

- **二分木**: 各頂点が高々 1 つの左の子と高々 1 つの右の子をもつ根付き木.
- [ヒストグラムの長方形](../../data-structure/histogram-rectangle/)（単調スタックで、各要素について「直前・直後の小さい要素」を求める方法）

## 3. Cartesian Tree の定義と性質

### 3.1. 定義

区間 $[l, r)$ に対して、次の手順で二分木を作る. 列全体 $[0, N)$ から作ったものが Cartesian Tree である.

- $l = r$ なら空の木を返す.
- $i \in [l, r)$ のうち $a_i$ が最小のもの（複数あるときは $i$ が最小のもの）を $m$ とする.
- 頂点 $m$ を根、区間 $[l, m)$ から作った木を左の子、区間 $[m + 1, r)$ から作った木を右の子とする木を返す.

### 3.2. 性質

定義からすぐに次が分かる.

- **ヒープ**: 親の値は子の値以下である（$a_{\mathrm{par}(v)} \le a_v$）.
- **二分探索木**: 通りがけ順（左の部分木 → 根 → 右の部分木）に頂点をたどると、添字の順 $0, 1, \dots, N - 1$ になる.
- **部分木は区間**: 頂点 $v$ の部分木の頂点の集合は、$v$ を作ったときの区間 $[l_v, r_v)$ そのものであり、$v$ はその区間の最小値の位置である.

逆に、ヒープかつ二分探索木である二分木は（同じ値の扱いを決めれば）一意に定まり、Cartesian Tree と一致する.

:::note[区間最小値と LCA]
$i \le j$ について、$\min(a_i, \dots, a_j)$ を取る位置は、Cartesian Tree における $i$ と $j$ の LCA（最小共通祖先）である.
LCA を $w$ とすると、$i, j$ は $w$ の部分木の区間 $[l_w, r_w)$ に入り、$w$ の左右の別の部分木に分かれる（または一方が $w$）ので $i \le w \le j$ である. $w$ は $[l_w, r_w) \supseteq [i, j]$ の最小値なので、$[i, j]$ の最小値でもある.
:::

## 4. スタックによる構築

定義どおりに作ると最悪 $O(N^2)$ かかる（区間最小値を Sparse Table などで求めても $O(N \log N)$）. スタックを使うと $O(N)$ で作れる.

### 4.1. 右端のパスを保つ

$a_0, \dots, a_{i-1}$ の Cartesian Tree ができているとし、$a_i$ を追加する.
二分探索木の性質から、$i$ は通りがけ順で最後、つまり**根から右の子をたどり続けたパス（右端のパス）**の上に来る.
右端のパス上の頂点は根から順に値が広義単調増加である（ヒープの性質）. そこで、右端のパスをスタック `st` に根から順に持っておく.
木に追加するときに関係するのは、今ある木の右端のパスだけである.

**$a_i$ が右端のパスの末尾以上のとき**: $i$ を右端の頂点の右の子にすればよい.
例えば `a = [4, 2, 5, 3]`、`st = [1, 3]`（$a_1 = 2$, $a_3 = 3$）のときに $a_4 = 5$ が来たら、$4$ を $3$ の右の子にして `st = [1, 3, 4]` とする.

**$a_i$ が右端のパスの末尾より小さいとき**: $a_i$ より大きい頂点をスタックから取り除く.
取り除いた頂点はパスの上で連続した下の部分なので、それらをまとめた部分木（最後に取り除いた頂点 `prv` が根）は、すべて $i$ より左にあり $a_i$ より大きい. したがって `prv` は $i$ の左の子になる.
スタックに残った最後の頂点があれば $i$ はその右の子になり、なければ $i$ が新しい根になる.
上の例で $a_4 = 1$ が来たら、$3$, $1$ の順に取り除き、`prv = 1` が $4$ の左の子になる. スタックが空になったので $4$ が根になり、`st = [4]` となる.

同じ値のときは取り除かない（`a[i] < a[st.back()]` のときだけ取り除く）ことで、等しい値の間では左にある方が祖先になる.

### 4.2. 計算量

各頂点はスタックに 1 回積まれ、高々 1 回取り除かれる. 取り除く回数の合計は $N$ 以下なので、全体で $O(N)$ である.

## 5. 部分木と区間

頂点 $v$ の部分木の区間 $[l_v, r_v)$ は、木をたどらなくても次のように求まる.

- $l_v - 1$ は、$v$ より左で $a_j \le a_v$ となる最大の $j$（なければ $l_v = 0$）.
- $r_v$ は、$v$ より右で $a_j < a_v$ となる最小の $j$（なければ $r_v = N$）.

これは [ヒストグラムの長方形](../../data-structure/histogram-rectangle/) で求めた「$a_v$ を高さとして左右に広げた区間」と同じものである（等しい値の扱いだけ左右で変えている）.
左右の不等号を変えているので、各区間 $[l, r)$ について、その最小値を取る位置（左端のもの）を $v$ とすると $[l, r) \subseteq [l_v, r_v)$ かつ $l \le v < r$ となる $v$ がちょうど 1 つ決まる. よって

$$
\sum_{0 \le l < r \le N} \min_{l \le j < r} a_j = \sum_{v = 0}^{N - 1} a_v (v - l_v + 1)(r_v - v)
$$

のように、区間の最小値ごとの数え上げが $O(N)$ でできる.

## 6. 参考資料

- [Cartesian Tree の実装 〜 stack を用いた O(N) 時間構築 - けんちょんの競プロ精進記録](https://drken1215.hatenablog.com/entry/2023/10/19/025800)（スタックによる構築の動き、RMQ・LCA との関係）
- [Cartesian Tree - Nyaan's Library](https://nyaannyaan.github.io/library/tree/cartesian-tree.hpp.html)（同じ値のときに添字が小さい方を根にする実装. 構築のコードの元）
- [Cartesian tree - Wikipedia](https://en.wikipedia.org/wiki/Cartesian_tree)（ヒープかつ二分探索木としての特徴付け、右端のパスを使う線形時間構築、区間最小値と LCA の関係）

## 7. コード

### 7.1. 構築（4 章）

- `cartesian_tree(a)`: 最小値を根とする Cartesian Tree の各頂点の親を返す. 根の親は $-1$. 等しい値の間では添字が小さい方が祖先になる. $O(n)$.

```cpp title="cartesian_tree.cpp"
// 最小値を根とする Cartesian Tree の各頂点の親を返す（根の親は -1）.
// 最小値が複数あるときは添字が最小のものを根にする. O(n)
template <class T>
vector<int> cartesian_tree(const vector<T>& a) {
  int n = a.size();
  vector<int> par(n, -1);
  vector<int> st;  // 今の木の右端のパス（根から順に）
  st.reserve(n);
  for (int i = 0; i < n; i++) {
    int prv = -1;  // 最後に右端のパスから外した頂点
    while (!st.empty() && a[i] < a[st.back()]) {
      prv = st.back();
      st.pop_back();
    }
    if (prv != -1) par[prv] = i;           // 外した部分は i の左の子になる
    if (!st.empty()) par[i] = st.back();   // i は残った右端の頂点の右の子になる
    st.push_back(i);
  }
  return par;
}
```

使用例（子のリストと根を作る）:

```cpp
auto par = cartesian_tree(a);
int root = -1;
vector<vector<int>> g(n);  // g[v]: v の子（左の子が先）
for (int v = 0; v < n; v++) {
  if (par[v] == -1) root = v;
  else g[par[v]].push_back(v);
}
```

### 7.2. 部分木の区間（5 章）

- `cartesian_tree_ranges(a)`: 各頂点 $v$ の部分木に対応する区間 $[l_v, r_v)$ を返す. $O(n)$.

```cpp title="cartesian_tree_ranges.cpp"
// 頂点 v の部分木に対応する区間 [l, r) を返す. O(n)
// l - 1 は a[j] <= a[v] となる v より左で最大の j、r は a[j] < a[v] となる v より右で最小の j
template <class T>
vector<pair<int, int>> cartesian_tree_ranges(const vector<T>& a) {
  int n = a.size();
  vector<pair<int, int>> res(n);
  vector<int> st;

  for (int i = 0; i < n; i++) {
    while (!st.empty() && a[st.back()] > a[i]) st.pop_back();
    res[i].first = st.empty() ? 0 : st.back() + 1;
    st.push_back(i);
  }

  st.clear();

  for (int i = n - 1; i >= 0; i--) {
    while (!st.empty() && a[st.back()] >= a[i]) st.pop_back();
    res[i].second = st.empty() ? n : st.back();
    st.push_back(i);
  }

  return res;
}
```
