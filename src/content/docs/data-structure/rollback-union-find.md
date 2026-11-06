---
title: "Rollback付きUnion-Find"
tags: [union-find, offline]
sidebar:
  order: 16
---
## 概要

`UnionFind`に`undo`機能や`rollback`機能をつけたライブラリ

- マージは経路圧縮は行わない: サイズの小さい木を大きい木につなぐことで深さを $O(\log N)$ に抑える
- `undo`: 直前の`unite`を 1 回取り消す操作

## 実装

### データ

- `data`: 通常の`Union-Find'と同じ
  - 根: `-連結成分のサイズ`
  - 根以外: `親の頂点番号`
- `history`
- `inner_snap`

### `union`

1. まず根まで移動
2. `history`に`unite`前の情報を保存
    ```cpp
    history.emplace(x, data[x]);
    history.emplace(y, data[y]);
    ```
3. サイズが小さい方を大きい方にくっつける

### `undo`

- 直前の操作で変わるのは根の二つだけなので、そこを元に戻す

## 問題例

### [ABC334-G Christmas Color Grid 2](https://atcoder.jp/contests/abc334/tasks/abc334_g)

- 緑にする部分を区間としてとらえることで、分割統治で解くことができる
- 緑の連結成分数の数え方
  - 緑にした時に `+1`
  - 他の緑と`unite`したときに`-1`

## 参照元

- [RollbackつきUnion-Find](https://nyaannyaan.github.io/library/data-structure/rollback-union-find.hpp.html)
