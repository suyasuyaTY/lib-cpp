---
title: "Baby-step giant-step"
tags: [number-theory, modular]
sidebar:
  order: 8
---
## 1. 概要

関数 $f$ と始点 $s$, 目標 $g$ が与えられたとき,

$$
f^{t}(s) = g \quad (0 \leq t \leq N)
$$

を満たす最小の非負整数 $t$ を, 時間計算量・空間計算量 $O(\sqrt{N})$ で求めるアルゴリズム。
ここで $f^{t}$ は $f$ を $t$ 回適用したものを表す。

素朴に $f^{0}(s), f^{1}(s), \ldots$ と順に調べると $O(N)$ かかるが, 「小さい歩幅 (baby step)」と「大きい歩幅 (giant step)」に分けて調べることで $O(\sqrt{N})$ に落とす。

代表例は離散対数問題 ($a^{t} \equiv b \pmod{m}$ を満たす $t$ を求める) や, 位数 ([原始根](../../math/primitive-root/) を参照) の計算。

## 2. 使える条件

- $f(x)$ が高速に計算できる
- $f^{M}(x)$ が高速に計算できる ($M \approx \sqrt{N}$)
- $f$ が単射である (逆関数 $f^{-1}$ が存在する)
- 値をハッシュテーブルなどで高速に検索できる

## 3. アイデア

$M = \lceil \sqrt{N} \rceil$ とし, 求める $t \ (\geq 1)$ を

$$
t = iM - j \quad (i \geq 1, \ 0 \leq j < M)
$$

の形で表す。$i$ を固定すると $t$ は $(i-1)M + 1 \leq t \leq iM$ の範囲を動くので, $i = 1, 2, \ldots$ と増やせば $t$ を小さい順に漏れなく調べられる。

このとき, $f$ が単射なので両辺に $f^{j}$ を適用しても同値性が保たれ,

$$
f^{iM - j}(s) = g \iff f^{iM}(s) = f^{j}(g)
$$

となる。左辺は $i$ だけ, 右辺は $j$ だけに依存するので, 次のように分けて計算できる。

| | 計算するもの | 個数 |
| --- | --- | --- |
| baby step | $f^{j}(g) \ (0 \leq j < M)$ | $M$ 個 |
| giant step | $f^{iM}(s) \ (i = 1, 2, \ldots)$ | 約 $N / M$ 個 |

## 4. アルゴリズム

1. $s = g$ なら $t = 0$ が答え。
2. $M = \lceil \sqrt{N} \rceil$ とする。
3. **baby step**: $f^{0}(g), f^{1}(g), \ldots, f^{M-1}(g)$ を計算し, ハッシュテーブル $\mathrm{table}[f^{j}(g)] = j$ を作る。
   - 同じ値が複数回出たときは **大きい $j$ を残す** ($t = iM - j$ を小さくするため)。
4. **giant step**: $i = 1, 2, \ldots$ の順に $x_i = f^{iM}(s)$ を計算する ($x_{i+1} = f^{M}(x_i)$)。
   - $x_i$ が $\mathrm{table}$ にあれば, $t = iM - \mathrm{table}[x_i]$ が答え ($t \leq N$ を確認する)。
   - $iM \geq N$ となるまで調べても見つからなければ, 解なし。

### 計算量

- baby step: $f$ を $M$ 回 → $O(\sqrt{N})$
- giant step: $f^{M}$ を約 $N/M$ 回 → $O(\sqrt{N})$
- ハッシュテーブルの要素数: $M$ 個 → 空間 $O(\sqrt{N})$

## 5. 例: 位数の計算

$\gcd(10, K) = 1$ のとき, $10^{t} \equiv 1 \pmod{K}$ を満たす最小の正整数 $t$ (10 の位数) を求める。

上の枠組みで

$$
f(x) = 10x \bmod K, \quad s = 1, \quad g = 1
$$

とおけばよい。$\gcd(10, K) = 1$ より $f$ は単射で, $f^{M}(x) = 10^{M} x \bmod K$ も繰り返し二乗法で求めた $10^{M}$ を掛けるだけで計算できる。
また位数は $K$ 以下なので $N = K$ とできる。

ただし $t \geq 1$ を求めたいので, 始点を $s = f(1)$ にずらして $f^{u}(f(1)) = 1$ となる最小の $u \geq 0$ を求め, $t = u + 1$ とする。

## 6. 実装

```cpp title="baby_step_giant_step.cpp"
// Baby-step giant-step
// f^t(s) = g (0 <= t <= N) を満たす最小の t を O(sqrt(N)) で求める
#include <bits/stdc++.h>

using namespace std;

// f   : x -> f(x)   (単射であること)
// f_m : x -> f^M(x)
// M   : f_m が何回分の f を表すか (ceil(sqrt(N)) が最適)
// 存在しなければ -1
template <class T>
long long baby_step_giant_step(T s, T g, long long N, long long M, auto f, auto f_m) {
  if (s == g) return 0;

  // baby step: f^j(g) (0 <= j < M) を保存する
  unordered_map<T, long long> baby;

  T cur = g;
  for (long long j = 0; j < M; ++j) {
    // 同じ値が複数回出たら、大きい j を残す (t = iM - j を小さくするため)
    baby[cur] = j;
    cur = f(cur);
  }

  // giant step: f^{iM}(s) (i = 1, 2, ...) を順に調べる
  // i に対して t は (i-1)M + 1 <= t <= iM の範囲を動く
  T giant = s;
  for (long long i = 1; (i - 1) * M + 1 <= N; ++i) {
    giant = f_m(giant);

    auto it = baby.find(giant);
    if (it != baby.end()) {
      long long t = i * M - it->second;
      return t <= N ? t : -1;
    }
  }

  return -1;
}
```

`baby_step_giant_step(s, g, N, M, f, f_m)` に, $f$ と $f^{M}$ を計算する関数を渡して使う。
$M$ は $\lceil \sqrt{N} \rceil$ にすると $O(\sqrt{N})$ になる ($f^{M}$ の計算に $M$ が必要なので, 呼び出し側で決めて渡す)。
位数の計算 `order10` は使用例として同じファイルに置いている。

## 7. 関連問題

- [ABC222 G - 222](https://atcoder.jp/contests/abc222/tasks/abc222_g)

## 8. 参考文献

- https://atcoder.jp/contests/abc270/editorial/4965
