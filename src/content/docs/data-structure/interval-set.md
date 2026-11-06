---
title: "区間集合の追加・削除を set で実装する"
tags: [interval]
sidebar:
  order: 10
---
## 概要

半開区間 $[l, r)$ の追加・削除を、`set<pll>` で管理する。各要素は区間の左端・右端の組で、左端の昇順に並ぶ。重なる区間や隣接する区間は併合し、常に互いに離れた区間だけを保持する。

- 追加: $[l, r)$ と重なる・隣接する区間をまとめて、1 個の区間にする。
- 削除: $[l, r)$ と重なる部分を取り除く。区間の途中を削除した場合は、左右の 2 個の区間に分かれる。

### 計算量

空の区間集合から始め、追加を $A$ 回、削除を $D$ 回、合計 $Q = A + D$ 回行うとする。番兵は以下の個数に含めない。

- 追加 1 回で `set` に挿入する区間は高々 1 個。
- 削除 1 回で `set` に挿入する区間は、削除範囲の左右に残る高々 2 個。
- よって、全クエリで挿入する区間は累計で高々 $A + 2D$ 個。挿入した各要素は高々 1 回しか消去されないので、消去も累計で高々 $A + 2D$ 回。

したがって、区間の更新を `set` への挿入・消去として数えると、合計は高々 $2A + 4D \le 4Q$ 回になる。同じ端点の区間を作り直した場合も、別の挿入として数える。各ループの反復では必ず要素を消去するため、ループの総反復回数も $O(Q)$ に収まる。

1 回のクエリで区間数が増えるのは高々 1 個なので、保持する区間数は高々 $Q$ 個。検索・挿入・消去をそれぞれ $O(\log(Q + 2))$ と見積もると、全体の時間計算量は $O(Q\log(Q))$ となる。

## 実装

```cpp
auto init = [&](set<pll> &s) -> void {
  s.emplace(-LINF, -LINF);
  s.emplace(LINF, LINF);
};

// 区間 [l, r) を追加する
auto insert = [&](set<pll> &s, ll l, ll r) -> void {
  if (l >= r) return;

  ll nl = l;
  ll nr = r;

  {
    // 左側に繋がる区間があるか調べる
    auto it = prev(s.upper_bound({l, LINF}));
    auto [a, b] = *it;

    if (a != -LINF && b >= l) {
      nl = min(nl, a);
      nr = max(nr, b);

      s.erase(it);
    }
  }

  {
    // nl 以降の、重なる/隣接する区間を全部併合
    auto it = s.lower_bound({nl, -LINF});

    while (it->first != LINF && it->first <= nr) {
      auto [a, b] = *it;

      nl = min(nl, a);
      nr = max(nr, b);

      it = s.erase(it);
    }
  }

  s.emplace(nl, nr);
};

// 区間 [l, r) を削除する
auto erase = [&](set<pll> &s, ll l, ll r) -> void {
  if (l >= r) return;

  {
    // l より左から始まって、l にかかっている可能性がある区間を見る
    auto it = prev(s.upper_bound({l, LINF}));
    auto [a, b] = *it;

    if (a != -LINF && b > l) {
      s.erase(it);

      // 左側を残す
      if (a < l) {
        s.emplace(a, l);
      }

      // 右側を残す
      if (b > r) {
        s.emplace(r, b);
      }
    }
  }

  {
    // l 以降から始まる区間を見る
    auto it = s.lower_bound({l, -LINF});

    while (it->first < r) {
      auto [a, b] = *it;

      it = s.erase(it);

      // r をまたいでいるなら右側だけ残す
      if (b > r) {
        s.emplace(r, b);
        break;
      }
    }
  }
};
```
