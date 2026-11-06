---
title: "文字列の辞書順とソート"
sidebar:
  order: 5
---
## 概要

> - 文字列を連結したときに、辞書順で最小・最大になるソートは一意に定まる
> - $i < j$ なら、 $S[i] + S[j] \le S[j] + S[i]$ となるようにソートをする。

## コード

```cpp
auto comp = [&](int i, int j) -> bool {
    int N = ssize(S[i]), M = ssize(S[j]);
    if (N >= M) {
      for (int k = 0; k < M; k++) {
        if (S[i][k] == S[j][k]) continue;
        return S[i][k] < S[j][k];
      }
      if (Z[i][M] < N - M) {
        return S[i][M + Z[i][M]] < S[i][Z[i][M]];
      }
      for (int k = 0; k < M; k++) {
        if (S[j][k] == S[i][k + N - M]) continue;
        return S[j][k] < S[i][k + N - M];
      }
      return false;
    } else {
      for (int k = 0; k < N; k++) {
        if (S[i][k] == S[j][k]) continue;
        return S[i][k] < S[j][k];
      }
      if (Z[j][N] < M - N) {
        return S[j][Z[j][N]] < S[j][N + Z[j][N]];
      }
      for (int k = 0; k < N; k++) {
        if (S[j][k + M - N] == S[i][k]) continue;
        return S[j][k + M - N] < S[i][k];
      }
      return false;
    }
  };
```

再帰一回当たりの比較コスト: $O(\min(|X|, |Y|)) = O(\sum S[i])$

## アルゴリズム

> $N \coloneqq |X|, M \coloneqq |Y|$
- $N \le M$
    - `X + Y = X[0:N] + Y[0:M-N] + Y[M-N:M]`
    - `Y + X = Y[0:N] + Y[N:M]   + X[0:N]`
    1. `X[0:N] と Y[0:N]` を比較 $(O(N))$
    2. `Y[0:M-N] と Y[N:M]` を比較 $(O(1))$
    3. `Y[M-N:M] と X[0:N]` を比較 $(O(N))$
- $N > M$
    - `X + Y = X[0:M] + X[M:N] + Y[0:M]`
    - `Y + X = Y[0:M] + X[0:N-M] + X[N-M:N]`
     1. `X[0:M] と Y[0:M]`   を比較 $(O(M))$
     2. `X[M:N] と X[0:N-M]` を比較 $(O(1))$
     3. `Y[0:M] と X[N-M:N]` を比較 $(O(M))$

`z-algorithm` を使用して、最初に一致していない場所を見つけ

## 一意に定まる理由

文字列 $A, B$ の比較を考える。
ここで、文字列を 26 進数表記の整数を $a,b$ とすると、
$$
\begin{aligned}
&A \oplus B < B \oplus A \\
&\Leftrightarrow a \times 26^{|B|} + b < b \times 26^{|A|} + a \\
&\Leftrightarrow \frac{a}{26^{|A|} - 1} < \frac{b}{26^{|B| - 1}}\\
\end{aligned}
$$
と変形できるので、各文字列のみに依存する数による並び替えができる。

## 例題

### [ABC225-F String Cards](https://atcoder.jp/contests/abc225/tasks/abc225_f)

- このソートが決めているのは「2つとも使うと決めたとき、どちらを先に置くべきか」というだけで、「どの文字列を選ぶべきか」までは決まっていない
- そのため、先に選んだ文字列の順番を求めてから、`dp`でどの文字列を選ぶかを決める

### [ABC434-F Concat (2nd)](https://atcoder.jp/contests/abc434/tasks/abc434_f)

- ソート後の文字列を $S_{1}, S_{2}, \dots, S_{N}$ とする。
    - 辞書順最小: $S_{1} S_{2} \dots,S_{N-2} S_{N-1} S_{N}$
    - 末尾2個交換: $S_{1} S_{2} \dots,S_{N-2} S_{N} S_{N-1}$
    - 接頭辞が $S_{1} S_{2} \dots,S_{N-2}$ 以外なら交換したら、どちらかより大きくなる
    - $S_{N-1}$ の接頭辞が $S_{N-2}$ と一致する可能性があるので、$S_{1} S_{2} \dots,S_{N-1} S_{N-2} S_{N}$ も候補になる

### [ABC471-F Concat (maximize)](https://atcoder.jp/contests/abc471/tasks/abc471_f)

- 使う文字列が$K$個決まれば、辞書順最大の文字列を作ることに等しい
- 使う文字列の候補
    1. 桁数が多い
    2. 数字として考えたときに多い
- 同じ桁数なら 2. を考慮
- 数字として考えたときに大きいものが後ろにあればそれを一つだけ先頭用として使うと大きくなる可能性があるのでそれも候補に入れる

## 参照元

- [一意に定義できる理由](https://atcoder.jp/contests/abc225/editorial/2833)
