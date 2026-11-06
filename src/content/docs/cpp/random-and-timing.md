---
title: "乱数"
tags: [randomized]
sidebar:
  order: 2
---
## 時間管理

```cpp
auto start_time = chrono::steady_clock::now();

auto elapsed = [&]() -> {
  auto now = chrono::steady_clock::now();
  return chrono::duration<double>(now - start_time).count();
};

while (elapsed() < 1.9) {
  // 乱択処理
}
```

## 乱択

```cpp
// 乱数生成器
mt19937_64 rng(
    chrono::steady_clock::now().time_since_epoch().count()
);

// [l, r] の整数
int randint(int l, int r) {
    return uniform_int_distribution<int>(l, r)(rng);
}

// [l, r] の long long
ll randll(ll l, ll r) {
    return uniform_int_distribution<ll>(l, r)(rng);
}

// [0, 1) の実数
double rand01() {
    return uniform_real_distribution<double>(0.0, 1.0)(rng);
}

// [l, r) の実数
double randdouble(double l, double r) {
    return uniform_real_distribution<double>(l, r)(rng);
}

// 確率 p で true
bool prob(double p) {
    return rand01() < p;
}
```
