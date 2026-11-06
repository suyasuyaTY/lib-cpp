---
title: "vector, ranges::views"
sidebar:
  order: 1
---
## コピー

## 完全コピー

```cpp
vector<int> b = a;
vector<int> b(a);
```

## 一部コピー

```cpp
vector<int> b(a.begin(), a.begin() + k);
```

## view→vectorに変換

```cpp
auto v = A | views::take(5) | ranges::to<vector>();
```

## 追加

```cpp
A.reserve(A.size() + B.size());
A.insert(A.end(), B.begin(), B.end());

ranges::copy(B, back_inserter(A));
```

## 操作

## take（先頭k個）

```cpp
A | views::take(k);
```

## drop（先頭k個を捨てる）

```cpp
A | views::drop(k);
```

## reverse（逆順）

```cpp
A | views::reverse;
```

## filter（条件）

```cpp
A | views::filter([](int x){ return x % 2 == 0; });
```

## transform（写像）

```cpp
A | views::transform([](int x){ return x * 2; });
```

## iota（数列生成）

```cpp
views::iota(0, 10); // 0〜9
```

## zip（同時）

`(A[i], B[i])` を同時に扱うことができる

サイズは小さい方にそろえられる

```cpp
auto vw = views::zip(A, B);
for (auto [a, b] : views::zip(A, B)) {
  // a = A[i], b = B[i]
}
```

## chunk（グループ化）

```cpp
for (auto group : A | views::chunk(3)) {
  for (int x : group) {
    cout << x << " ";
  }
}
```

## 関数への渡し方

```cpp
// 通常の関数
template <ranges::input_range R>
auto solve(R &&A) { ... }

// ラムダ式
auto solve = [](auto &&A) {
  for (auto x : A) { ... }
};
auto solve = []<ranges::input_range R>(R &&A) {
  for (auto x : A) {
    ...
  }
};
```
