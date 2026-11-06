---
title: "Disjoint Sparse Table"
tags: [range-query, static, monoid]
sidebar:
  order: 7
---
## 概要

更新のない静的な列に対する区間クエリを高速に処理するデータ構造。

長さ $N$ の列に対して、$O(N \log N)$ 時間・空間で事前計算することで、結合則を満たす演算の区間積を $O(1)$ 時間で求められる。区間を重ならない左右の区間に分け、それぞれの計算済みの値を結合する。演算に可換性や冪等性は不要で、和・最小値・行列積などに使える。ここでは、各演算を $O(1)$ とする。

## 実装

- **オンライン版**：クエリが順次与えられ、その場で答える必要がある場合に使う。各段の情報を保持し、前処理後は各クエリに答える。
- **オフライン版**：クエリが最初からすべてわかっている場合に使う。分割統治でまとめて処理し、各段の情報を保存する代わりに作業配列を使い回す。

以下は、区間の情報を表す `S` と、左右への要素追加・クエリ回答を用途に応じて定義する実装のひな形。長さ 1 の区間は `query_single` で個別に扱う。計算量は、これらの操作と状態のコピーを定数時間で行える場合のもの。

### オンラインクエリの場合

```cpp
// 区間について保持したい情報
struct S {
};

// クエリ
struct Query {
  int l, r;  // [l, r)
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

// left と right を使ってクエリに答える
auto query = [&](const S &left, const S &right, const Query &q) {
};

// 区間長が1の場合
auto query_single = [&](int i, const Query &q) {
};

// DST 構築
vector<vector<S>> table;
{
  int K = 0;
  while ((1 << K) < N) K++;
  for (int k = 0; k < K; k++) {
    int half = 1 << k;
    int block = 1 << (k + 1);

    for (int l = 0; l < N; l += block) {
      int m = min(l + half, N);
      int r = min(l + block, N);

      if (m == N) continue;

      table[k][m - 1] = make_single(m - 1);
      for (int i = m - 2; i >= l; i--) {
        table[k][i] = merge_left(i, table[k][i + 1]);
      }

      table[k][m] = make_single(m);
      for (int i = m + 1; i < r; i++) {
        table[k][i] = merge_right(table[k][i - 1], i);
      }
    }
  }
}

Query q;

// [l, r) を前提とする
cin >> q.l >> q.r;
q.l--;

if (q.r - q.l == 1) {
  query_single(q.l, q);
} else {
  unsigned x = static_cast<unsigned>(q.l ^ (q.r - 1));
  int k = std::bit_width(x) - 1;

  query(table[k][q.l], table[k][q.r - 1], q);
}
```

### オフラインクエリの場合

区間の中央をまたぐクエリにその場で答え、左右どちらかに収まるクエリは再帰先へ渡す。クエリ数を $Q$ とすると、この実装の時間計算量は $O((N + Q) \log N)$。区間情報を保持する作業配列は $O(N)$ で済む。

```cpp
// 区間について保持したい情報
struct S {
};

// クエリ
struct Query {
  int l, r;  // [l, r)
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

// left と right を使ってクエリに答える
auto query = [&](const S &left, const S &right, const Query &q) {
};

// 区間長が1の場合
auto query_single = [&](int i, const Query &q) {
};

// 分割統治用 DP
// 再帰ごとに上書きしてよい
vector<S> dp(N);
auto solve = [&](auto &solve, int l, int r, const vector<int> &query_id) -> void {
  // この区間にクエリがない
  if (query_id.empty()) {
    return;
  }

  if (l + 1 == r) {
    for (int id : query_id) {
      const auto &q = queries[id];
      assert(q.l == l && q.r == r);
      query_single(l, q);
    }
    return;
  }

  int m = (l + r) / 2;

  // 左側を更新
  dp[m - 1] = make_single(m - 1);
  for (int i = m - 2; i >= l; i--) {
    dp[i] = merge_left(i, dp[i + 1]);
  }

  dp[m] = make_single(m);
  for (int i = m + 1; i < r; i++) {
    dp[i] = merge_right(dp[i - 1], i);
  }

  vector<int> left_query;
  vector<int> right_query;

  for (int id : query_id) {
    const auto &q = queries[id];

    // 完全に左
    if (q.r <= mid) {
      left_query.push_back(id);
    }
    // 完全に右
    else if (q.l >= mid) {
      right_query.push_back(id);
    }
    // mid をまたぐ
    else {
      query(dp[q.l], dp[q.r - 1], q);
    }
  }

  solve(solve, l, mid, left_query);
  solve(solve, mid, r, right_query);
};
```

## 問題例

### [ABC426-G Range Knapsack Query](https://atcoder.jp/contests/abc426/tasks/abc426_g)

DSTで実装するとMLEするので, 分割統治で実装する。
