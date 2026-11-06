---
title: "耳dp"
sidebar:
  order: 3
---
## 概要

配列を左から処理するとき、
$$
\text{状態}0 \rightarrow \text{状態}1 \rightarrow \text{状態}2 \rightarrow \cdots
$$
のように、状態が一方向にしか進まない構造を利用するDP。

$$
dp_{s}[i] \coloneqq i \text{番目まで見て、現在フェーズ} s \text{の最適値}
$$
となるように `dp` を計算していく。

## 問題例

### [みんなのプロコン-D Ears](https://atcoder.jp/contests/yahoo-procon2019-qual/tasks/yahoo_procon2019_qual_d)

- 耳に入っている石の個数: $0 \rightarrow \text{偶数} \rightarrow \text{奇数} \rightarrow \text{偶数} \rightarrow 0$
- この状態遷移は一方方向なので、耳dp が適用できる

### [NDPC-G 口](https://atcoder.jp/contests/ndpc/tasks/ndpc2026_g)

-  口に入れることのできるキャンディの個数: $0 \rightarrow 1\text{以上の整数} \rightarrow 0$
- ある区間を移動することにした場合
    - $A[i] > 0$: コスト $0$
    - $A[i] = 0$: コスト $1$
- 先に全部コストを回収すれば、最大部分配列和として解くことができる
