---
title: "SWAG（Sliding Window Aggregation）"
tags: [sliding-window, monoid]
sidebar:
  order: 12
---
## 概要

キューの中にある要素全体の集約値を高速に求めるデータ構造

次のような操作を全部高速にできる

- 右から要素を追加する
- 左から要素を削除する
- 今の区間全体の min / max / sum / gcd などを求める

## アルゴリズム

SWAGでは内部で`stack`を2つ使う

- `front_stack` : 左から消す用
- `back_stack`  : 右から追加する用

キュー全体は`front_stack + back_stack` になっている

1. 右に追加するときは`back_stack` に入れる
2. 左から消すときは`back_stack` から消す
3. `front_stack` が空なのに消したいときは、`back_stack` から全部移す

## 実装

```cpp title="swag.cpp"
#include <bits/stdc++.h>

using namespace std;
using pii = pair<int, int>;
const int INF = 0x3fffffff;

struct SWAG {
  // pair<値, そのstack内での集計した値>
  vector<pii> front_stack;
  vector<pii> back_stack;

  int op(int a, int b) {
    return min(a, b);
  }

  // 右から追加
  void push(int x) {
    int agg;

    if (back_stack.empty()) {
      agg = x;
    } else {
      agg = op(back_stack.back().second, x);
    }

    back_stack.push_back({x, agg});
  }

  // 左から削除
  void pop() {
    if (front_stack.empty()) {
      // back_stack から front_stack に全部移す
      while (!back_stack.empty()) {
        int x = back_stack.back().first;
        back_stack.pop_back();

        int agg;
        if (front_stack.empty()) {
          agg = x;
        } else {
          agg = op(x, front_stack.back().second);
        }

        front_stack.push_back({x, agg});
      }
    }

    front_stack.pop_back();
  }

  // 今のキュー全体の最小値
  int fold() {
    if (front_stack.empty() && back_stack.empty()) {
      return INF;  // 単位元を返す
    }

    if (front_stack.empty()) {
      return back_stack.back().second;
    }

    if (back_stack.empty()) {
      return front_stack.back().second;
    }

    return op(front_stack.back().second, back_stack.back().second);
  }

  int size() {
    return (int)front_stack.size() + (int)back_stack.size();
  }
};
```
