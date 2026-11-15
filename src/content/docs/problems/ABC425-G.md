---
title: ABC425 G - Sum of Min of XOR
problem: https://atcoder.jp/contests/abc425/tasks/abc425_g
uses: [bitwise/xor-min-max]
tags: []
---
[問題](https://atcoder.jp/contests/abc425/tasks/abc425_g)

## 問題

正整数 $N, M$ と長さ $N$ の非負整数列 $A$ が与えられる.

$$
\sum_{x = 0}^{M - 1} \min_{1 \le i \le N} (x \oplus A_i)
$$

を求めよ. 制約は $1 \le N \le 2 \times 10^5$、$1 \le M \le 10^9$、$0 \le A_i \le 10^9$.

## 1. 愚直解

$A$ を binary trie に入れると、各 $x$ について $\min_i (x \oplus A_i)$ は $O(30)$ で求まる（[XOR の最小化・最大化 3.2 節](../../bitwise/xor-min-max/)）.
しかし $x$ が $M \le 10^9$ 通りあるので間に合わない. 同じ分岐を通る $x$ をまとめて数える（[3.3 節](../../bitwise/xor-min-max/)）.

## 2. 上位 bit での分割

$B = 30$ とすると $A_i < 2^B$、$M \le 2^B$ である. trie のノード $v$（上位 bit が固定された $A_i$ の集合）、残りの bit 数 $k$、$0 \le M \le 2^k$ について

$$
f(v, M, k) = \sum_{x = 0}^{M - 1} \min_{a \in v} \left( (a \bmod 2^k) \oplus x \right)
$$

とすると、答えは $f(\mathrm{root}, M, B)$ である. $h = 2^{k-1}$ とし、$x$ を上位 bit $k - 1$ の値 $b$ で分ける.

- $v$ に子 $b$ がある: [主張 3.1](../../bitwise/xor-min-max/#claim-3-1) より、XOR の bit $k - 1$ を $0$ にできる子 $b$ の中で最小値が決まる. 下位 bit の和は $f(c_b, \cdot, k - 1)$.
- $v$ に子 $b$ がない: どの $a$ でも XOR の bit $k - 1$ が $1$ になり、各 $x$ について $h$ が加わる. 下位 bit は子 $1 - b$ の中で最小化するので、$x$ が $m$ 個なら $m h + f(c_{1-b}, m, k - 1)$.

これを使って、$M$ の大きさで次の 3 通りに分ける.

- $M = 2^k$: $x$ の bit $k - 1$ が $0$ のもの $h$ 個と $1$ のもの $h$ 個の両方を足す. 子が両方あれば $f(c_0, h, k - 1) + f(c_1, h, k - 1)$、片方 $c$ しかなければ $2 f(c, h, k - 1) + h^2$.
- $M \le h$: bit $k - 1$ が $0$ の $x$ だけで、下位 bit は $[0, M)$.
- $h < M < 2^k$: bit $k - 1$ が $0$ の $x$ 全体（下位 bit が $[0, h)$）と、bit $k - 1$ が $1$ で下位 bit が $[0, M - h)$ の $x$ に分ける.

## 3. 計算量

$M = 2^k$ の場合（$x$ の範囲が部分木全体）は $M$ によらないので、$\mathrm{full}(v, k) = f(v, 2^k, k)$ と書く. $\mathrm{full}$ は各ノードで子を高々 1 回ずつ呼ぶ（子が片方のときは 2 倍するだけ）ので、各ノードを 1 回しか訪れない.
$M < 2^k$ の場合の再帰は、各段で $M$ が半端な側の子 1 つにしか進まないので、根から 1 本のパスをたどるだけである.
よって全体で trie のノード数 $O(BN)$ である. 答えは高々 $M \cdot 2^B \le 2^{60}$ なので `long long` に収まる.

## 提出コード

```cpp
const int B = 30;
vector<array<int, 2>> ch(1, {-1, -1});  // binary trie の子

// x ∈ [0, 2^k) すべてについての min_a (x xor a) の和（ノード v の部分木、下位 k bit）
long long full(int v, int k) {
  if (k == 0) return 0;
  int c0 = ch[v][0], c1 = ch[v][1];
  long long h = 1LL << (k - 1);
  if (c0 == -1) return 2 * full(c1, k - 1) + h * h;
  if (c1 == -1) return 2 * full(c0, k - 1) + h * h;
  return full(c0, k - 1) + full(c1, k - 1);
}

// x ∈ [0, M) についての和. 0 <= M <= 2^k
long long f(int v, long long M, int k) {
  if (M == 0) return 0;
  if (M == (1LL << k)) return full(v, k);
  long long h = 1LL << (k - 1);
  // x の bit k-1 が b で、下位 k-1 bit が [0, m) の部分
  auto side = [&](int b, long long m) -> long long {
    if (ch[v][b] != -1) return f(ch[v][b], m, k - 1);
    return m * h + f(ch[v][b ^ 1], m, k - 1);
  };
  if (M <= h) return side(0, M);
  return side(0, h) + side(1, M - h);
}

int main() {
  int n;
  long long m;
  cin >> n >> m;
  for (int i = 0; i < n; i++) {
    long long a;
    cin >> a;
    int v = 0;
    for (int j = B - 1; j >= 0; j--) {
      int b = a >> j & 1;
      if (ch[v][b] == -1) {
        ch[v][b] = ch.size();
        ch.push_back({-1, -1});
      }
      v = ch[v][b];
    }
  }
  cout << f(0, m, B) << endl;
}
```
