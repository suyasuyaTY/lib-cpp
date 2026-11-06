---
title: "双対セグメント木"
tags: [range-update, monoid]
sidebar:
  order: 2
---
## 概要

- 区間作用/1点取得のSegment Tree
- 区間集約値をもたないため、`lazy_segtree`より単純

## 実装

```cpp
struct dual_segtree {
  int n;     // 元の配列サイズ
  int size;  // 2のべき乗に丸めたサイズ
  vector<int> node;

  dual_segtree(int n) : n(n) {
    size = 1;
    while (size < n) size <<= 1;

    node.assign(2 * size, -INF);
  }

  // [l, r) に chmax(x)
  void apply(int l, int r, int x) {
    l += size;
    r += size;

    while (l < r) {
      if (l & 1) {
        // 奇数から始まるなら親ノードは区間をすべて含まないので更新
        // 親ノードは更新する区間をすべて含まないので、右隣りに移す
        chmax(node[l++], x);
      }

      if (r & 1) {
        // 奇数で終わるなら親ノードは区間をすべて含まないので更新
        // 親ノードは更新する区間をすべて含まないので、右隣りに移す
        chmax(node[--r], x);
      }

      l >>= 1;
      r >>= 1;
    }
  }

  // A[i] を取得
  int get(int i, int init_value) {
    int res = init_value;

    for (int k = i + size; k > 0; k >>= 1) {
      chmax(res, node[k]);
    }

    return res;
  }
};
```

- 実装上は各ノードを連続区間として解釈する必要がないから、2のべき乗にする必要はない
- 操作が可換ならば、葉 $\rightarrow$ 根までの集約をどの順番で拾っても問題ないので単純に書ける

## 問題例

### [ABC342-G Retroactive Range Chmax](https://atcoder.jp/contests/abc342/tasks/abc342_g)

- 1点更新`chmax`で取り消し操作ありの場合
  - `priority_queue<int> add`: `max`を取る要素
  - `priority_queue<int> erase`: `max`を取る要素から消したもの
  - という二つを用意し、`add.top() == erase.top()` となったものを消していくことで簡単に書ける
- `max`は可換なので、双対セグメント木に簡単に乗せることができる
