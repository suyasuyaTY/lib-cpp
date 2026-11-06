---
title: "Compressed Suffix Tree"
tags: [string-search]
sidebar:
  order: 4
---
## 概要

構築済みの `sa`・`lcp` から、接尾辞を辞書順に追加して木を作る。結果は `vector<node> tree` に保持し、各ノードは次の2つだけを持つ。

- `depth`：そのノードまでの共通接頭辞の長さ。
- `child`：子のノード番号。辞書順に並ぶ。

## アルゴリズム

### スタックに保持するもの

`st` には、最後に追加した接尾辞の経路上にある root と内部ノードを保持する。葉は入れない。底から top に向かって `depth` は狭義単調増加する。

接尾辞 `sa[i]` を追加するとき、直前との共通部分の長さを `x = (i == 0 ? 0 : lcp[i - 1])` とする。深さ `x` のノードを追加先として見つけるか、新しく作ればよい。

### 深すぎるノードを pop する

`tree[st.back()].depth > x` の間、スタックを pop する。深さ `x` より先は今回の接尾辞と共通でないため、その内部ノードの下には追加できない。

pop するのは探索位置を戻すためで、木のノードや辺は削除しない。root の深さは 0 なので、必ずスタックに残る。

### 深さ x の内部ノードを用意する

pop 後の top を `parent` とする。

- `tree[parent].depth == x`：そのノードをそのまま追加先に使う。
- `tree[parent].depth < x`：深さ `x` の内部ノード `v` を作り、`parent` の最後の子 `last` との間に挟む。

```text
変更前                  変更後
parent                  parent
 └─ last                 └─ v (depth = x)
                             └─ last
```

具体的には、`tree[parent].child.back()` を `v` に変更し、`tree[v].child` に `last` を追加する。その後 `v` をスタックに push する。

同じ接頭辞を持つ接尾辞は辞書順で連続するため、今回共有する経路は直前の接尾辞の経路上にある。調整するのは、その接尾辞を含む最後の子だけでよい。`last` が内部ノードなら、その下の部分木全体が移動する。

### 現在の接尾辞の葉を追加する

`depth = n - sa[i]` の葉を作り、`st.back()` の最後の子に追加する。葉はスタックには入れず、次の接尾辞へ進む。

例えば `a` の次に `ana` を追加すると、`x = 1`。root と `a` の葉の間に深さ 1 の内部ノードを挟み、その下に `ana` の葉を追加する。

```text
root (depth = 0)
 └─ 内部ノード (depth = 1)
     ├─ 葉 a   (depth = 1)
     └─ 葉 ana (depth = 3)
```

親と葉の `depth` が等しくなることがある。この長さ 0 の辺は「ここで接尾辞が終わる」ことを表し、そのまま残す。終端文字は追加しない。

## 計算量

文字列の長さを $N$ とすると、SA・LCP が構築済みの場合、時間・空間ともに $O(N)$。

接尾辞1つにつき葉を1つ、内部ノードを高々1つ作る。各内部ノードはスタックに1回入り、高々1回出るので、pop の総回数も $O(N)$。部分木の移動は子の番号を付け替えるだけで行える。

## 実装

`n` は元の文字列の長さとし、`sa`・`lcp` は構築済みとする。`lcp[i]` は `sa[i]` と `sa[i + 1]` の LCP。root の番号は 0 で、`n == 0` の場合は root だけが残る。

```cpp
struct node {
    int depth;
    vector<int> child;
};

vector<node> tree;

auto new_node = [&](int depth) {
    int id = (int)tree.size();
    tree.push_back({depth, {}});
    return id;
};

int root = new_node(0);
vector<int> st = {root};

for (int i = 0; i < n; i++) {
    int x = (i == 0 ? 0 : lcp[i - 1]);

    // 深すぎる内部ノードを探索経路から外す
    while (tree[st.back()].depth > x) {
        st.pop_back();
    }

    // 深さ x の内部ノードを、最後の子との間に挟む
    if (tree[st.back()].depth < x) {
        int parent = st.back();
        int last = tree[parent].child.back();
        int v = new_node(x);

        tree[parent].child.back() = v;
        tree[v].child.push_back(last);
        st.push_back(v);
    }

    // 現在の接尾辞を葉として追加（葉は st に入れない）
    int leaf = new_node(n - sa[i]);
    tree[st.back()].child.push_back(leaf);
}
```
