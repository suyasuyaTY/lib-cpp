---
title: "メビウス・ゼータ変換"
tags: [bit-dp, convolution]
sidebar:
  order: 2
---
## 概念

有限集合$V$の部分集合$2^V$上で定義された関数$f(T)$ が存在

$F(S) = \sum_{S \sub T} f(T)$という関係が存在するとき

- ゼータ変換：$f$から$F$を求める
- メビウス変換：$F$から$f$を求める

## メビウス関数

[メビウスの反転公式の証明と応用 | 高校数学の美しい物語](https://manabitimes.jp/math/1283)

## 約数ゼータ変換

$$
g(n) = \sum_{d|n} f(d)
$$

$g(n)$は$n$のすべての約数$d$について$f(d)$を足し合わせたもの

```cpp
// Reference:
//   Nyaan's Library: "倍数変換・約数変換" (multiplicative-function/divisor-multiple-transform.hpp)
//   https://nyaannyaan.github.io/library/multiplicative-function/divisor-multiple-transform.hpp.html
//   https://github.com/NyaanNyaan/library (CC0-1.0)
// Accessed: 2026-02-28

template <typename T>
void zeta_transform(vector<T> &a) {
  int N = a.size() - 1;
  auto sieve = prime_enumerate(N);
  for (auto &p : sieve)
    for (int k = 1; k * p <= N; ++k) a[k * p] += a[k];
}
template <typename T>
void mobius_transform(vector<T> &a) {
  int N = a.size() - 1;
  auto sieve = prime_enumerate(N);
  for (auto &p : sieve)
    for (int k = N / p; k > 0; --k) a[k * p] -= a[k];
}
```

## 倍数ゼータ変換

$$
g(n) = \sum_{n|m} f(m)
$$

$g(n)$は$n$のすべての倍数$m$について$f(m)$を足し合わせたもの

```cpp
// Reference:
//   Nyaan's Library: "倍数変換・約数変換" (multiplicative-function/divisor-multiple-transform.hpp)
//   https://nyaannyaan.github.io/library/multiplicative-function/divisor-multiple-transform.hpp.html
//   https://github.com/NyaanNyaan/library (CC0-1.0)
// Accessed: 2026-02-28

template <typename T>
void zeta_transform(vector<T> &a) {
  int N = a.size() - 1;
  auto sieve = prime_enumerate(N);
  for (auto &p : sieve)
    for (int k = N / p; k > 0; --k) a[k] += a[k * p];
}
template <typename T>
void mobius_transform(vector<T> &a) {
  int N = a.size() - 1;
  auto sieve = prime_enumerate(N);
  for (auto &p : sieve)
    for (int k = 1; k * p <= N; ++k) a[k] -= a[k * p];
}
```

## subsetゼータ変換

$$
g(S) = \sum_{T \subset S} f(T)
$$

K次元の0/1グリッドで0→1方向へ累積和

```cpp
template <typename T>
void zeta_transform(vector<T> &a, int K) {
  int M = 1 << K;
  for (int bit = 0; bit < K; bit++) {
    for (int mask = 0; mask < M; mask++) {
      if (mask & (1 << bit)) {
        a[mask] += a[mask ^ (1 << bit)];
      }
    }
  }
}
template <typename T>
void mobius_transform(vector<T> &a, int K) {
  int M = 1 << K;
  for (int bit = 0; bit < K; bit++) {
    for (int mask = 0; mask < M; mask++) {
      if (mask & (1 << bit)) {
        a[mask] -= a[mask ^ (1 << bit)];
      }
    }
  }
}
```

## supersetゼータ変換

$$
g(S) = \sum_{T \supset S} f(T)
$$

K次元の0/1グリッドで1→0方向へ累積和

```cpp
template <typename T>
void zeta_transform(vector<T> &a, int K) {
  int M = 1 << K;
  for (int bit = 0; bit < K; bit++) {
    for (int mask = 0; mask < M; mask++) {
      if ((mask & (1 << bit)) == 0) {
        a[mask] += a[mask | (1 << bit)];
      }
    }
  }
}
template <typename T>
void mobius_transform(vector<T> &a, int K) {
  int M = 1 << K;
  for (int bit = 0; bit < K; bit++) {
    for (int mask = 0; mask < M; mask++) {
      if ((mask & (1 << bit)) == 0) {
        a[mask] -= a[mask | (1 << bit)];
      }
    }
  }
}
```
