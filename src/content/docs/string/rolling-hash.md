---
title: "ローリングハッシュ"
tags: [string-search, hashing, randomized]
sidebar:
  order: 6
---
文字列の部分区間ハッシュを O(1) で取得する。`RollingHash::get(l, r)`。2 法・乱択基数

## 実装

```cpp title="rolling_hash.cpp"
#include <bits/stdc++.h>

using namespace std;

struct RollingHash {
  static constexpr array<long long, 2> MOD = {1000000007u, 1000000009u};

  struct Key {
    array<uint32_t, 2> h{};
    bool operator==(const Key& o) const { return h == o.h; }
    bool operator!=(const Key& o) const { return h != o.h; }
    bool operator<(const Key& o) const { return h < o.h; }  // lexicographic
  };

  inline static bool initialized = false;
  inline static array<long long, 2> base = {0u, 0u};
  inline static vector<array<long long, 2>> power = {{1u, 1u}};  // power[len][k] = base[k]^len mod MOD[k]

  // pref[i][k] = hash of s[0..i) under (MOD[k], base[k])
  vector<array<long long, 2>> pref;

  RollingHash() = default;
  explicit RollingHash(const string& s) { build(s); }

  void build(const string& s) {
    init_if_needed();
    int n = (int)s.size();
    ensure_powers(n);

    pref.assign(n + 1, {0u, 0u});
    for (int i = 0; i < n; i++) {
      long long x = (uint8_t)s[i] + 1u;  // 0回避
      for (int k = 0; k < 2; k++) {
        long long mod = MOD[k];
        pref[i + 1][k] = add(mul(pref[i][k], base[k], mod), x % mod, mod);
      }
    }
  }

  // s[l..r) のハッシュ（O(1)）
  Key get(int l, int r) const {
    Key res;
    int len = r - l;
    for (int k = 0; k < 2; k++) {
      uint32_t mod = MOD[k];
      uint32_t t = mul(pref[l][k], power[len][k], mod);
      res.h[k] = sub(pref[r][k], t, mod);
    }
    return res;
  }

 private:
  static inline long long add(long long a, long long b, long long mod) {
    long long s = a + b;
    if (s >= mod) s -= mod;
    return s;
  }
  static inline long long sub(long long a, long long b, long long mod) {
    return (a >= b) ? (a - b) : (a + mod - b);
  }
  static inline long long mul(long long a, long long b, long long mod) {
    return (a * b) % mod;
  }

  static void init_if_needed() {
    if (initialized) return;

    static std::mt19937_64 rng(chrono::high_resolution_clock::now().time_since_epoch().count());

    for (int k = 0; k < 2; k++) {
      // base[k] は各 mod で乱択（0,1は避ける）
      std::uniform_int_distribution<long long> dist(2, MOD[k] - 2);
      base[k] = dist(rng);
    }

    initialized = true;
    power.assign(1, {1u, 1u});
  }

  static void ensure_powers(int n) {
    if ((int)power.size() > n) return;
    int cur = (int)power.size();
    power.resize(n + 1);
    for (int i = cur; i <= n; i++) {
      for (int k = 0; k < 2; k++) {
        power[i][k] = mul(power[i - 1][k], base[k], MOD[k]);
      }
    }
  }
};
```
