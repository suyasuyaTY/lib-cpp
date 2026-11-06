---
title: "Slope Trick"
tags: [dp-optimization, convexity]
sidebar:
  order: 8
---
[Slope-Trick](https://ei1333.github.io/library/structure/others/slope-trick.hpp)

## 概要

1変数の区分線形凸関数を、関数全体ではなく「傾きの変化点」で管理するデータ構造

- 絶対値の傾きは1である必要がある
- 関数の持ち方
    - $(t)_+ = \max(0,t)$
    - $L$：左側の折れ線。max-heapで管理
    - $R$：右側の折れ線。min-heapで管理
    - $\min f(x)$：関数の最小値

$$
f(x) = \min f(x) + \sum_{l \in L} (l - x)_+ + \sum_{r \in R}(x - r)_+ 
$$

## 構築

## 初期状態

$f(x) = 0$

```cpp
min_f = 0;
L = {};
R = {};
```

## 追加する関数

### 右上がりの関数

$$
(x - a)_+ = \max(0, x - a)
$$

### 右下がりの関数

$$
(a - x)_+ = \max(0, a - x)
$$

### 絶対値

$$
|x - a| = (x - a)_+ + (a - x)_+
$$

## ヒープの更新

- 常に$\max L \le \min R$
- 最小値を取る区間は$[\max L, \min R]$

### 右上がりの関数の追加

- $p = \max L$に着目すると、次の式が成り立つ
    
    $$
    (p - x)_{+} + (x - a)_{+} = (p - a)_{+} + (\min(p,a) - x)_{+} +  (x - \max(p,a))_{+}
    $$

```cpp
void add_x_minus_a(T a) {
    if (!L.empty()) {
        min_f += max<T>(0, top_L() - a);
    }

    push_L(a);
    T x = pop_L();
    push_R(x);
}
```

## 右下がりの関数の追加

- $q = \min R$に着目すると、次の式が成り立つ
    
    $$
    (x - q)_{+} + (a - x)_{+} = (a - q)_{+} + (\min(q,a) - x)_{+} +  (x - \max(q,a))_{+}
    $$

```cpp
void add_a_minus_x(T a) {
    if (!R.empty()) {
        min_f += max<T>(0, a - top_R());
    }

    push_R(a);
    T x = pop_R();
    push_L(x);
}
```

## 累積min

### 左側からの累積min

- 元の関数が谷型なら、最小点より右側を水平にした関数になる
- 右上がりの部分を消せばいいので、$R$を空にすればいい

```cpp
void prefix_min() {
    R = {};
}
```

### 右側からの累積min

- 元の関数が谷型なら、最小点より左側を水平にした関数になる
- 右下がりの部分を消せばいいので、$L$を空にすればいい

```cpp
void suffix_min() {
    L = {};
}
```

## 平行移動

$$
g(x) = f(x - c)
$$

- グラフを右に$c$移動する操作
- 全折れ点を$c$増やせばいいが、ヒープの全要素を書き換えると遅くなるので遅延評価

```cpp
void shift(T c) {
    add_l += c;
    add_r += c;
}

void push_L(T x) {
    L.push(x - add_l);
}

T top_L() const {
    return L.top() + add_l;
}
```

## 区間内からの最小値

$$
g(x) = \min_{x - b \le y \le x - a} f(y)
$$

- $f$が最小値を取る区間を$[u,v]$とする
- 選べる区間が最小区間より左：$x \in (-\infty, u + a)$
    - 左側では、右へ行くほど小さくなるので、選べる範囲の一番右が最適
    - $g(x) = f(x - a)$
- 選べる区間が最小区間と交わる：$x \in [u + a, v + b]$
    - 最小値を取る場所を選べる
    - $g(x)= \min f$
- 選べる区間が最小区間より右：$x \in [v + b, \infty)$
    - 右側では、左に行くほど小さくなるので、選べる範囲の一番左が最適
    - $g(x) = f(x - b)$

```cpp
void sliding_min(T a, T b) {
    assert(a <= b);
    add_l += a;
    add_r += b;
}
```
