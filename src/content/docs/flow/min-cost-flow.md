---
title: "最小費用流"
sidebar:
  order: 3
---
## 例題

> 水道管に見立てた有向グラフがある。
> 
> 
> 各辺には「頂点$u$から頂点$v$まで水を上限$cap$リットルまで流せる。1リットル流した時に$cost$円かかる」という情報がある。
> 
> $S$から$T$まで$F$リットル流したいとき、最小コストはいくらか？
> 

`atcoder::mcf_graph` を使うことで解くことができる。

[https://atcoder.github.io/ac-library/production/document_ja/mincostflow.html](https://atcoder.github.io/ac-library/production/document_ja/mincostflow.html)

## アレンジ

## 最大費用流

コストが最大になる流し方を求めたい場合は、各辺のコストを`INF-cost` とすることで最小費用流問題に帰着させることができる。

## 頂点に容量とコスト

頂点$v$に容量やコストが定まっている場合、$v_1, v_2$を作ればよい

## 最初から負の辺があるグラフ
