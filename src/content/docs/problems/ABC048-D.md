---
title: ABC048 D - An Ordinary Game
problem: https://atcoder.jp/contests/abc048/tasks/arc064_b
uses: [game/winning-strategy]
tags: []
---
[問題](https://atcoder.jp/contests/abc048/tasks/arc064_b)

## 問題

隣り合う文字が等しくない文字列 $s$ がある. 2 人が交互に、$s$ の両端以外の文字を 1 つ取り除く. ただし取り除いた結果、等しい文字が隣り合ってはいけない. 取り除けなくなった人が負け. 先手と後手のどちらが勝つか求めよ.

制約は $3 \le |s| \le 10^5$.

## 1. 終了局面の形

両端の文字は取り除けないので、ゲームの間ずっと $s$ の先頭の文字 $s_{\text{first}}$ と末尾の文字 $s_{\text{last}}$ は変わらない.

文字列 $t = t_1 t_2 \cdots t_k$ で手を打てないのは、$2 \le i \le k - 1$ を満たすすべての $i$ について、$t_i$ を取り除くと $t_{i-1}$ と $t_{i+1}$ が隣り合い、$t_{i-1} = t_{i+1}$ となるときである.
よって終了局面の $t$ は 2 種類の文字が交互に並んだ文字列 $xyxy\cdots$ であり、$t_1 = t_k$ と $k$ が奇数であることは同値である.

## 2. 手数の偶奇

1 手ごとに文字列の長さはちょうど 1 減るので、手数は $|s| - k$ である.
1 章より $k$ の偶奇は $s_{\text{first}} = s_{\text{last}}$ かどうかで決まり、打ち方によらない.
[必勝戦略の考え方](../../game/winning-strategy/) 4.3 節より、手数 $|s| - k$ が奇数なら先手の勝ちである. まとめると、

- $s_{\text{first}} = s_{\text{last}}$ のとき: $|s|$ が偶数なら先手、奇数なら後手の勝ち.
- $s_{\text{first}} \ne s_{\text{last}}$ のとき: $|s|$ が奇数なら先手、偶数なら後手の勝ち.
