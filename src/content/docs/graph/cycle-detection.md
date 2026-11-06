---
title: "サイクル検出"
sidebar:
  order: 1
---
```cpp
int N;
vector<vector<int>> G(N);

// サイクル検出
vector<bool> visit(N, false), finished(N, false);
vector<int> history;

// サイクルのスタート地点を返す
// 無向辺の時は, rev を true にする
auto dfs = [&](auto &dfs, int v, int p, bool rev = false) -> int {
    visit[v] = true;  // 行きがけ時に true になる
    history.push_back(v);
    for (int w : G[v]) {
        if (rev && w == p) continue;  // 無向辺の場合は逆流を禁止する
        if (finished[w]) continue;    // w が探索済みならスキップ

        // サイクルが検出された場合
        if (seen[w] && !finished[w]) {
        return w;
        }

        int pos = dfs(dfs, w, v, rev);
        if (pos != -1) return pos;
    }
    finished[v] = true;  // 帰りがけ時に true になる
    history.pop_back();  // 探索が完全に終了したので履歴から消す
    return -1;
};

auto reconstruct = [&](int pos) {
    vector<int> cycle;
    while (!history.empty()) {
        int v = history.back();
        cycle.push_back(v);
        history.pop_back();
        if (v == pos) break;
    }

    ranges::reverse(cycle);
    return cycle;
};
```
