---
title: "Lowlink"
sidebar:
  order: 5
---
## 概要

Lowlink は、無向グラフを DFS して、橋や関節点を $O(N+M)$ で求めるアルゴリズムである。

- **橋**: その辺を削除すると、連結成分の個数が増える辺
- **関節点**: その頂点と接続する辺を削除すると、連結成分の個数が増える頂点

各頂点 $v$ について、次の 2 つの値を持つ。

- $ord[v]$: DFS で $v$ を訪問した順番
- $low[v]$: $v$ の部分木から、木の辺を 0 本以上下り、後退辺を高々 1 本使って到達できる頂点の $ord$ の最小値

ここで後退辺とは、DFS 木の辺ではない、頂点とその祖先を結ぶ辺のことである。

## コード

辺に ID を付け、DFS で使ってきた親の**辺**だけを無視する。`w == parent` として親頂点をすべて無視すると、同じ 2 頂点を結ぶ多重辺を後退辺として扱えず、誤って橋と判定することがある。

```cpp
int N, M;
vector<vector<pii>>> G(N);  // (行き先, 辺 ID)

for (int id = 0; id < M; id++) {
    int u, v;
    cin >> u >> v;
    u--,v--;

    G[u].emplace_back(v, id);
    G[v].pmplace_back(u, id);
}

vector<int> ord(N, -1), low(N);
vector<int> articulation_points;
vector<pii>> bridges;
int timer = 0;

auto dfs = [&](auto& dfs, int v, int parent_edge = -1) -> void {
    ord[v] = low[v] = timer++;

    int child_count = 0;
    bool is_articulation = false;

    for (auto [w, edge_id] : G[v]) {
        if (edge_id == parent_edge) continue;

        if (ord[w] == -1) {
            // (v, w) は DFS 木の辺
            child_count++;
            dfs(dfs, w, edge_id);
            chmin(low[v], low[w]);

            if (ord[v] < low[w]) {
                bridges.push_back({v, w});
            }

            if (parent_edge != -1 && ord[v] <= low[w]) {
                is_articulation = true;
            }
        } else if (ord[w] < ord[v]) {
            // (v, w) は祖先 w へ戻る後退辺
            // 既に探索した子孫への辺の可能性もあるため, ord[w] < ord[v] の条件を付けている
            chmin(low[v], ord[w]);
        }
    }

    if (parent_edge == -1 && child_count >= 2) {
        is_articulation = true;
    }

    if (is_articulation) articulation_points.push_back(v);
};

// 非連結グラフにも対応する
for (int v = 0; v < N; v++) {
    if (ord[v] == -1) dfs(dfs, v);
}
```

## `ord` と `low` から判定できる理由

DFS 木の辺 $(v,w)$ を考える。ただし $v$ は親、$w$ は子とする。

### $low[w] < ord[v]$ の場合

$w$ の部分木から、$v$ より前に訪問された祖先への後退辺が存在する。

つまり、$w$ の部分木から

$$w\text{ の部分木} \rightarrow v\text{ の祖先} \rightarrow v$$

という迂回路を通れる。この経路は辺 $(v,w)$ を使わないため、$(v,w)$ を削除しても $w$ の部分木は $v$ 側とつながっている。

### $low[w] = ord[v]$ の場合

$w$ の部分木から $v$ 自身へ戻る後退辺はあるが、$v$ より上の祖先へ戻る後退辺はない。

そのため、辺 $(v,w)$ を削除しても $v$ への迂回路があり、$(v,w)$ は**橋ではない**。一方で頂点 $v$ 自体を削除すると、その迂回路の行き先も消えるので、$w$ の部分木は $v$ の親側から切り離されるため、 $v$ は**関節点である**。

### $low[w] > ord[v]$ の場合

$w$ の部分木から $v$ または $v$ より上の祖先へ戻る後退辺がない。

したがって、$w$ の部分木とそれより上の部分を結ぶ経路は DFS 木の辺 $(v,w)$ しかない。この辺を削除するとグラフが分断されるので、$(v,w)$ は**橋である**。また、頂点 $v$ 自体を削除すると、$w$ の部分木は $v$ の親側から切り離されるため、 $v$ は**関節点である**。

以上から、次の条件が得られる。

- DFS 木の辺 $(v,w)$ が橋であることと $ord[v] < low[w]$ は同値
- 根でない頂点 $v$ が関節点であることと、ある子 $w$ について $ord[v] \leq low[w]$ は同値

### DFS 木の根だけは別に判定する

根には親側がないため、上の関節点の条件をそのまま使えない。根を削除したとき、DFS 木の子ごとの部分木を互いにつなぐ辺があれば、後から訪れる側はその辺を使って既訪問頂点へ到達し、根の別の子にはならない。

したがって、DFS 木において根の子が 2 個以上であることと、根が関節点であることは同値である。

## 問題例

### [ARC111-D Orientation](https://atcoder.jp/contests/arc111/tasks/arc111_d)

### [ABC334-G Christmas Color Grid 2](https://atcoder.jp/contests/abc334/tasks/abc334_g)

- 緑の連結成分ごとにDFS木を作成する
- 関節点である場合に増える連結成分数
  - 根: DFS木における子の数 - 1
  - 根以外: 頂点 $v$ の子 $w$ ごとに $ord[v] \leq low[w]$ を満たす個数
    - 頂点 $v$ を消した時に親側の部分木と連結なのはできるのは $ord[v] > low[w]$ を満たす頂点
    - それ以外の部分木は独立: この分だけ増える
