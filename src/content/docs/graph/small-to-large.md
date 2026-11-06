---
title: "木上のマージテク と DSU on Tree"
tags: [tree, subtree-query]
sidebar:
  order: 16
---
## 概要

木の各頂点について、部分木に含まれる色の種類数や、色ごとの出現回数などを求める手法。

各頂点で部分木をすべて走査すると、鎖状の木では合計 $O(N^2)$ かかる。大きい部分木の計算結果を使い回し、小さい部分木の情報だけを追加することで、同じ頂点を処理する回数を減らせる。

- **マージテク (Small to Large)**: 部分木ごとにデータ構造を持ち、小さいものを大きいものへマージする。
- **DSU on Tree**: 共通のデータ構造を 1 つ持ち、大きい子の部分木の情報を残したまま、小さい子の部分木の頂点を追加する。

## 共通の前処理

[HLD](../../graph/heavy-light-decomposition/) と同様に、部分木サイズが最大の子を `G[v][0]` に置く。

```cpp
int N;
vector<vector<int>> G;
// ここで N と G を入力する。

{
    vector<int> subtree_size(N);
    auto dfs = [&](auto& dfs, int v, int p) -> void {
        subtree_size[v] = 1;

        // 先頭に親が来ていたら一番後ろに置く
        if (!G[v].empty() && G[v][0] == p) swap(G[v][0], G[v].back());
        for (int& w : G[v]) {
            if (w == p) continue;
            dfs(dfs, w, v);
            subtree_size[v] += subtree_size[w];
            if (subtree_size[w] > subtree_size[G[v][0]]) swap(G[v][0], w);
        }
    };
    dfs(dfs, 0, -1);
}
```

## マージテク

### アルゴリズム

heavy child のデータを引き継ぎ、残りの子をマージする。以下は `color[v]` の出現回数をまとめ、各部分木の色の種類数を `dp[v]` に保存する例。

```cpp
vector<int> dp(N);
{
    auto dfs = [&](auto& dfs, int v, int p) -> map<int, int> {
        map<int, int> res;
        for (int w : G[v]) {
            if (w == p) continue;
            auto child = dfs(dfs, w, v);
            bool heavy = (w == G[v][0]);

            if (heavy) {
                // O(1) で引き継ぐ
                res.swap(child);
            } else {
                // 子どうしの寄与はマージ前に計算する
                for (const auto& [c, count] : child) {
                    res[c] += count;
                }
            }
        }

        ++res[color[v]];  // 頂点 v 自身の情報を追加する
        dp[v] = static_cast<int>(res.size());
        return res;  // コピーせずに返す
    };

    dfs(dfs, 0, -1);
}
```

後で使う部分木 DP の結果は `dp[v]` に保存する。

### 計算量

頂点 $v$ で引き継ぐ最大の子以外の子を $u$ とすると、最大の子の部分木は $u$ 以上の大きさなので、

$$
size[v] \geq 1 + 2size[u]
$$

が成り立つ。つまり、小さい側としてマージされるたびに、その頂点の情報が属する部分木の大きさは 2 倍以上になる。大きさは最大 $N$ なので、各頂点が小さい側に入る回数は $O(\log N)$、マージ元を走査する量の合計は $O(N\log N)$ となる。

- 1 要素の追加・統合が $O(1)$: 全体で $O(N\log N)$
- `map` や `set` など、1 要素の操作が $O(\log N)$: 全体で $O(N\log^2 N)$
- `unordered_map` など、1 要素の操作が期待 $O(1)$: 全体で期待 $O(N\log N)$

`map` は木の探索に加えてメモリ確保・解放があるため、配列より定数倍が大きい。以下は $N(\log_2 N)^2$ による規模の目安であり、実際の操作回数や通過保証ではない。

| $N$ | $N(\log_2 N)^2$ | 判断の目安 |
| --- | --- | --- |
| $2 \times 10^5$ | 約 $6 \times 10^7$ | 数秒の制限では、複数の `map` や追加の探索があると要実測 |
| $10^6$ | 約 $4 \times 10^8$ | `map` でのマージは厳しくなりやすく、配列を使う DSU on Tree などを検討 |

特に、平衡な木で色がすべて異なる場合はマージ量が多い。最大サイズのこの入力で実測する。鎖状の木や同じ色が多い入力だけでは、厳しいケースの目安にならない。

## DSU on Tree

### アルゴリズム

light child を処理して情報を消し、heavy child の情報を残して light child の頂点を追加し直す。`keep = false` なら、答えを保存した後に部分木の情報を消す。

以下は色の種類数を求める例。$0 \leq color[v] < N$ とする。

```cpp
vector<int> in(N), out(N), order;
{
    // 2nd dfs: 部分木を区間 [in[v], out[v]) に対応させる
    auto dfs = [&](auto& dfs, int v, int p) -> void {
        in[v] = static_cast<int>(order.size());
        order.push_back(v);
        for (int w : G[v]) {
            if (w == p) continue;
            dfs(dfs, w, v);
        }
        out[v] = static_cast<int>(order.size());
    };
    dfs(dfs, 0, -1);
}

vector<int> count(N), answer(N);
int distinct = 0;
auto add = [&](int v) -> void {
    if (count[color[v]]++ == 0) ++distinct;
};
auto remove = [&](int v) -> void {
    if (--count[color[v]] == 0) --distinct;
};

{
    auto dfs = [&](auto& dfs, int v, int p, bool keep) -> void {
        for (int w : G[v]) {
            if (w == p || w == G[v][0]) continue;
            dfs(dfs, w, v, false);
        }
        if (!G[v].empty() && G[v][0] != p) {
            dfs(dfs, G[v][0], v, true);
        }
    
        for (int w : G[v]) {
            if (w == p || w == G[v][0]) continue;
            for (int i = in[w]; i < out[w]; ++i) add(order[i]);
        }
        add(v);
        answer[v] = distinct;
    
        if (!keep) {
            for (int i = in[v]; i < out[v]; ++i) remove(order[i]);
        }
    };
    dfs(dfs, 0, -1, true);
}
```

### 計算量

light child から親へ進むたびに部分木の頂点数が 2 倍以上になるため、根までの経路に含まれる light edge は $O(\log N)$ 本である。

ある頂点が再追加・削除されるのは、その頂点を含む light child の部分木を処理するときである。したがって、各頂点の追加・削除は $O(\log N)$ 回、全体の操作回数は $O(N\log N)$ となる。

- `add`・`remove` が $O(1)$: 全体で $O(N\log N)$
- `add`・`remove` が $O(\log N)$: 全体で $O(N\log^2 N)$

前処理は $O(N)$。以上は各頂点の答えを $O(1)$ で取得できる場合であり、答えの取得に別の処理が必要なら、その計算量を加える。

各頂点の情報が $O(1)$ 個で、集計用データが $O(N)$ 領域に収まる場合、木・集計用データ・再帰スタックを含めた空間計算量は $O(N)$ となる。

## 使い分け

- **マージテク**: 部分木ごとに `map` や `set`、部分木 DP の状態を持ち、それらを直接マージできる場合に使いやすい。情報の削除操作は不要。
- **DSU on Tree**: 頂点単位の追加・削除と、現在の集計結果からの答えの取得を効率よく行える場合に使いやすい。共通の頻度配列などを使い回せる。

## 問題例

### [ABC454-G Mode in the Subtree](https://atcoder.jp/contests/abc454/tasks/abc454_g)

### [ABC359-G Sum of Tree Distance](https://atcoder.jp/contests/abc359/tasks/abc359_g)

### [ABC340-G Leaf Color](https://atcoder.jp/contests/abc340/tasks/abc340_g)
