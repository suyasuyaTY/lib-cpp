---
title: ABC334 G - Christmas Color Grid 2
problem: https://atcoder.jp/contests/abc334/tasks/abc334_g
uses: [data-structure/rollback-union-find]
tags: [probability, modular]
---
[問題](https://atcoder.jp/contests/abc334/tasks/abc334_g)

## 問題

$H \times W$ のグリッドの各マスは赤（`.`）か緑（`#`）である.
緑のマスを頂点とし、上下左右に隣接する緑のマスどうしを辺で結んだグラフの連結成分数を「緑の連結成分数」と呼ぶ.
緑のマスを一様ランダムに 1 つ選んで赤に塗り替えたとき、塗り替え後の緑の連結成分数の期待値を $\bmod 998244353$ で求めよ.
制約は $1 \leq H, W \leq 1000$、緑のマスは 1 つ以上.

## 1. 条件の言いかえ

緑のマスを $c_0, c_1, \dots, c_{K-1}$ とし、$c_i$ を赤にしたときの緑の連結成分数を $f(i)$ とする. 答えは

$$
\frac{1}{K} \sum_{i=0}^{K-1} f(i)
$$

である. $f(i)$ は「$c_i$ **以外**の緑のマスをすべて加えたグラフ」の連結成分数なので、各 $i$ について $c_i$ だけを除いたグラフの連結成分数が分かればよい.

## 2. 分割統治と Rollback 付き Union-Find

1 マスだけを除いたグラフを $K$ 通り作り直すと $O(K^2)$ かかる.
そこで「まだ加えていないマス」を区間 $[l, r)$ として持ち、それ以外のマスはすべて加えた状態で次の再帰を行う.

- $\mathrm{solve}(l, r)$: $c_l, \dots, c_{r-1}$ 以外の緑のマスがすべて加わっている状態で呼ぶ.
  - $r - l = 1$ なら、今の連結成分数が $f(l)$ である.
  - そうでなければ $m = \lfloor (l + r)/2 \rfloor$ として、
    1. $c_m, \dots, c_{r-1}$ を加えて $\mathrm{solve}(l, m)$ を呼び、加えた分を取り消す.
    2. $c_l, \dots, c_{m-1}$ を加えて $\mathrm{solve}(m, r)$ を呼び、加えた分を取り消す.

マスの追加は Union-Find の merge、取り消しは [Rollback 付き Union-Find](../../data-structure/rollback-union-find/) の `rollback`（3.4 節）で行う.
再帰の前に `get_state()` を覚えておき、戻るときに `rollback` すればよい.

## 3. 連結成分数の数え方

連結成分数 $\mathrm{comp}$ は、Union-Find とは別に変数で持つ.

- マスを緑として加えたときに $+1$ する.
- 上下左右の加え済みの緑のマスと merge するとき、その 2 マスがまだ連結でなかったら（`same` が false なら）$-1$ する.

取り消すときは、再帰の前に覚えておいた $\mathrm{comp}$ の値に戻す.

各マスは再帰の深さ $O(\log K)$ のそれぞれで 1 回ずつ加えられるので、merge は $O(K \log K)$ 回で、全体の計算量は $O(K \log^2 K)$ である（$K \leq HW$）.
