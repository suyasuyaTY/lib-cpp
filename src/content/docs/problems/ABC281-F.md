---
title: ABC281 F - Xor Minimization
problem: https://atcoder.jp/contests/abc281/tasks/abc281_f
uses: [bitwise/xor-min-max]
tags: []
---
[問題](https://atcoder.jp/contests/abc281/tasks/abc281_f)

## 問題

長さ $N$ の非負整数列 $A$ が与えられる. 非負整数 $x$ を 1 つ選んで、すべての $A_i$ を $A_i \oplus x$ に置き換える.
操作後の最大値 $\max_i (A_i \oplus x)$ の最小値を求めよ.
制約は $1 \le N \le 1.5 \times 10^5$、$0 \le A_i < 2^{30}$.

## 1. 条件の言いかえ

求めるものは

$$
\min_{x \ge 0} \max_i (A_i \oplus x)
$$

である. $x$ の bit 30 以上を $1$ にすると最大値の bit 30 以上も $1$ になって損なので、$0 \le x < 2^{30}$ としてよい.
[XOR の最小化・最大化 主張 3.1](../../bitwise/xor-min-max/#claim-3-1) より、$x$ を上位 bit から決めていけばよい.

## 2. trie 上の分割統治への帰着

$A$ を binary trie に入れる（[XOR の最小化・最大化 3.2 節](../../bitwise/xor-min-max/)）.
trie のノード $v$（上位 bit が固定された候補の集合）と残りの bit 数 $k$ について、

$$
g(v, k) = \min_{0 \le x < 2^k} \max_{a \in v} \left( (a \bmod 2^k) \oplus x \right)
$$

とすると、答えは $g(\mathrm{root}, 30)$ である. 上位 bit $k - 1$ で分けて（[3.3 節](../../bitwise/xor-min-max/)）、

- 子が片方しかない（候補の bit $k - 1$ がすべて同じ）: $x$ の bit $k - 1$ を候補と同じにすれば、最大値の bit $k - 1$ は $0$ にできる. $g(v, k) = g(\text{その子}, k - 1)$.
- 子が両方ある: $x$ の bit $k - 1$ をどちらにしても、どちらかの子の候補は bit $k - 1$ が $1$ になり、最大値の bit $k - 1$ は $1$ になる. 最大値を決めるのは bit $k - 1$ が $1$ になる側の子だけなので、$x$ の bit $k - 1$ を $0$ にすると子 $1$、$1$ にすると子 $0$ が残る.

  $$
  g(v, k) = 2^{k - 1} + \min\left( g(c_0, k - 1),\ g(c_1, k - 1) \right)
  $$

[主張 3.1](../../bitwise/xor-min-max/#claim-3-1) より、bit $k - 1$ を $0$ にできるならそれが最優先なので、この場合分けで最適である.

## 3. 計算量

各ノードを 1 回ずつ訪れるので、trie のノード数 $O(30 N)$ で求まる.

## 提出コード

```cpp
const int B = 30;
vector<array<int, 2>> ch(1, {-1, -1});  // binary trie の子

// 上位 k bit が決まったノード v の候補について、min_x max_a (x xor a) の下位 k bit 分
long long solve(int v, int k) {
  if (k == 0) return 0;
  int c0 = ch[v][0], c1 = ch[v][1];
  if (c0 == -1) return solve(c1, k - 1);  // x の bit を 1 にすれば 0
  if (c1 == -1) return solve(c0, k - 1);  // x の bit を 0 にすれば 0
  return (1LL << (k - 1)) + min(solve(c0, k - 1), solve(c1, k - 1));
}

int main() {
  int n;
  cin >> n;
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
  cout << solve(0, B) << endl;
}
```
