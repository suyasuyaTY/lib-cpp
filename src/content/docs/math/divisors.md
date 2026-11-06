---
title: "約数に関するライブラリ"
tags: [number-theory]
sidebar:
  order: 4
---
## 約数列挙

```cpp
vector<ll> enum_divisors(ll N) {
  vector<ll> res;
  for (ll i = 1; i * i <= N; ++i) {
    if (N % i == 0) {
      res.push_back(i);
      if (N / i != i) res.push_back(N / i);
    }
  }
  sort(res.begin(), res.end());
  return res;
}
```

## 連続する区間の整数の素因数分解

計算量: $O(K \log \log K )$

```cpp
vector<int> primes;  // sqrt(N)以下の素数
map<ll, ll> div;
// [0 ~ K]まで
vector<ll> A(K + 1);
iota(A.begin(), A.end(), 0);
for (const int p : primes) {
  for (int k = p; k <= K; k += p) {
    while (A[k] % p == 0) {
      div[p] += 1;
      A[k] /= p;
    }
  }
}

// [L ~ N]まで
ll L = N - K + 1;
vector<ll> B(K);
iota(B.begin(), B.end(), L);
for (const int p : primes) {
  // [L ~ N]の中で最小のpの倍数: p * ((L + p - 1) / p)
  for (ll k = p * ((L + p - 1) / p); k <= N; k += p) {
    while (B[k - L] % p == 0) {
      div[p] += 1;
      B[k - L] /= p;
    }
  }
}
for (const ll b : B) {
  if (b != 1)
    div[b] += 1;
}
```

## オイラー関数

$\phi(N)$: $1, 2, \dots N$ のうち、 $N$ と互いに素であるものの個数

$N = p_1^{e_1} p_2^{e_2} \cdots p_K^{e_K}$ と素因数分解できるとき、
$$
\phi(N) = N \left(1 - \frac{1}{p_1} \right) \left(1 - \frac{1}{p_2} \right) \cdots \left(1 - \frac{1}{p_K} \right)
$$

## オイラーの定理

$n$ を自然数、 $a$ と $n$ を互いに素な正の整数とすると、 $a^{\phi(n)} \equiv 1 \pmod{n}$ が成り立つ。

+ その他の性質
  + $a^n \equiv 1 \pmod{M}$ となる最小の $n$: $\phi(M)$ の約数  [ABC222-G](https://atcoder.jp/contests/abc222/editorial/2750)

## 高速ゼータ変換・高速メビウス変換

### メビウス関数

メビウス関数 $\mu(n)$ とは、正の整数に対して $-1,0,1$ のいずれかを返す関数

+ $\mu(1) = 1$
+ $n$ がある素数 $p$ で $2$ 回以上割り切れる時: $\mu(n) = 0$
+  $n = p_1 \times p_2 \times \cdots \times p_K$ と素因数分解できるとき: $\mu(n) = (-1)^{K}$

エラトステネスの篩の中で同時に求められる。

$n = p_1^{e_1} \times p_2^{e_2} \cdots \times p_K^{e_K}$ と素因数分解できるとする。

$$
\sum_{d|n} \mu(d) = \sum_{k = 0}^{K} (-1)^k \binom{K}{k} = (1 - 1)^{K} = 0
$$

### 高速ゼータ変換

$f(1), f(2), \dots, f(N)$ が与えられている状況を考える。 $n > N$ のとき、 $f(n) = 0$ とする。

各素因数を軸にとった多次元累積和を高速ゼータ変換という。

$$
F(n) = \sum_{n|i} f(i)
$$

### 高速メビウス変換

$F(1), F(2), \dots, F(N)$ が与えられている状況を考える。 $n > N$ のとき、 $F(n) = 0$ とする。

高速ゼータ変換の逆変換を高速メビウス変換という。メビウス関数をもちいて次のように求められる。

$$
F(n) = \sum_{n|i} \mu(\frac{i}{n}) f(i)
$$

## 実装

```cpp title="eratosthenes.cpp"
#include <vector>

using pii = std::pair<int, int>;

struct Eratosthenes {
  std::vector<bool> isprime;
  std::vector<int> primes;     // 素数リスト
  std::vector<int> minfactor;  // 整数 i を割り切る最小の素数
  std::vector<int> mu;         // メビウス関数

  Eratosthenes(int N) : isprime(N + 1, true), minfactor(N + 1, -1), mu(N + 1, 1) {
    isprime[1] = false;
    minfactor[1] = 1;

    for (int p = 2; p <= N; p++) {
      if (!isprime[p]) continue;

      primes.push_back(p);
      minfactor[p] = p;
      mu[p] = -1;

      for (int q = 2 * p; q <= N; q += p) {
        isprime[q] = false;
        if (minfactor[q] == -1) minfactor[q] = p;
        if ((q / p) % p == 0)
          mu[q] = 0;
        else
          mu[q] = -mu[q];
      }
    }
  }

  // 高速素因数分解 (計算量: O(log x))
  std::vector<pii> factorize(int n) const {
    std::vector<pii> res;
    while (n > 1) {
      int p = minfactor[n], ex = 0;
      while (minfactor[n] == p) {
        ex++;
        n /= p;
      }
      res.emplace_back(p, ex);
    }
    return res;
  }

  // 高速素因数分解 (計算量: O(log x))
  std::vector<int> factorize_flat(int n) const {
    std::vector<int> res;
    while (n > 1) {
      res.push_back(minfactor[n]);
      n /= minfactor[n];
    }
    return res;
  }

  // 高速約数列挙（計算量: O(\sigma(n))）
  std::vector<int> divsors(int n) {
    std::vector<int> res({1});

    auto pf = factorize(n);

    // 約数列挙
    for (auto p : pf) {
      int s = ssize(res);
      for (int i = 0; i < s; ++i) {
        int v = 1;
        for (int j = 0; j < p.second; ++j) {
          v *= p.first;
          res.push_back(res[i] * v);
        }
      }
    }
    return res;
  }
};
```

## 参考文献
[けんちょんさん-素因数分解](https://qiita.com/drken/items/a14e9af0ca2d857dad23)
[オイラー関数の証明](https://manabitimes.jp/math/667)
[区間における素因数分解](https://atcoder.jp/contests/abc227/editorial/2909)
