---
title: "掃き出し法"
tags: [xor]
sidebar:
  order: 1
---
## 1. 概要

**行基本変形で行列を階段形に変形する**アルゴリズム（Gauss の消去法）.
rank、連立一次方程式の解、行列式、逆行列、行空間の基底などがまとめて求まる.

競技プログラミングでは、行列を一度に変形するよりも「**ベクトルを 1 本ずつ追加しながら、それまでのベクトルが張る空間の基底を階段形で持っておく**」形で使うことが多い.
新しいベクトルを既存の基底で掃き出し、

- $0$ にならなければ、それまでのベクトルと線形独立なので基底に加える.
- $0$ になれば、それまでのベクトルの線形結合で表せる（従属）.

と判定できる.

## 2. 前提知識

- 体 $\mathbb{F}$ 上のベクトル空間（競プロでは $\mathrm{mod}\ p$ の modint や $\mathbb{F}_2$）.
- **行基本変形**: 「ある行を定数倍（$\neq 0$）する」「ある行に別の行の定数倍を足す」「2 つの行を入れ替える」の 3 つ. どれも行ベクトルが張る空間（行空間）を変えない.
- **ピボット**: 行ベクトルの先頭の非零成分の位置.
- **階段形**: 各行のピボットの位置が相異なる形. 階段形の非零行は線形独立であり、その本数が rank になる.
- **簡約階段形**: 階段形で、さらに各ピボットの列にはそのピボット以外に非零成分がない形. 行空間が同じなら簡約階段形は一意に定まる.

## 3. 尺取り法で K 次元を満たす最大の L を求めたい場合

実装: [実装](#実装) の `latest_linear_basis.cpp`（`LinearBasis`）

### 3.1. 問題設定

$\mathbb{F}^D$ のベクトル列 $v_0, v_1, \dots, v_{N-1}$ が与えられる.
区間 $[l, r]$ のベクトルが張る空間を $V_{l,r} = \mathrm{span}\lbrace v_l, \dots, v_r \rbrace$ とする.

各 $r$ について、$\dim V_{l,r} = k$ となる最大の $l$ を求めたい.
これが分かれば、例えば「rank が $k$ になる区間の個数」は $\sum_r (l_r + 1)$ で求まる.

### 3.2. ベクトルの逐次追加

$D$ 次元のベクトルを扱うとき、`basis[i]` を「ピボットが $i$ である基底ベクトル」として持つ.
新しいベクトル $v$ を追加するときは $i = 0, 1, \dots, D-1$ の順に見て、$v_i \neq 0$ なら

- `basis[i]` が空なら、$v$ を $v_i$ で割って `basis[i]` に登録して終了する.
- そうでなければ、$v \leftarrow v - v_i \cdot \mathtt{basis}[i]$ として $i$ 成分を消し、次へ進む.

最後まで登録されなければ $v$ は $0$ になっており、既存の基底の線形結合で表せる.

### 3.3. 新しい行を優先する基底

各基底ベクトルに、**それを作るのに使った行のうち最も古い行の番号** `pos[i]` を持たせる.
そして、同じピボットを持つベクトルがぶつかったときは、**番号が新しい方を基底に残し、古い方を掃き出し続ける**.

$v_r$（番号 $r$）を追加する手順は次の通り. 掃き出し中のベクトルを $u$、その番号を $t$ とする（最初は $u = v_r, t = r$）.

$i = 0, 1, \dots, D-1$ の順に見て、$u_i \neq 0$ なら

1. `basis[i]` が空なら、$u$ を正規化して `basis[i]` に登録し、`pos[i] = t` として終了する.
2. `pos[i] < t` なら、$(u, t)$ と $(\mathtt{basis}[i], \mathtt{pos}[i])$ を入れ替え、新しい `basis[i]` を正規化する.
3. $u \leftarrow u - u_i \cdot \mathtt{basis}[i]$ として $i$ 成分を消す.

2 の入れ替えの後も、$u$ と `basis[i]` はどちらも $i$ より前の成分が $0$ でピボットが $i$ なので、そのまま消去を続けられる.

> **定理**
>
> $v_0, \dots, v_r$ を追加した後、任意の $l \leq r$ について
>
> $$
> S_l = \lbrace \mathtt{basis}[i] : \mathtt{pos}[i] \geq l \rbrace
> $$
>
> は $V_{l,r}$ の基底である. 特に $\dim V_{l,r} = |\lbrace i : \mathtt{pos}[i] \geq l \rbrace|$ である.

<details>
<summary>証明</summary>

$S_l$ のベクトルはピボットが相異なるので線形独立である. よって $S_l$ が $V_{l,r}$ を張ることを $r$ についての帰納法で示す.

$v_r$ の追加中、基底ベクトルと掃き出し中のベクトル $u$ を合わせた「番号付きベクトルの集まり」$C$ を考える.
最初は $C$ = （追加前の基底）$\cup \lbrace (v_r, r) \rbrace$ であり、帰納法の仮定から、$C$ のうち番号が $l$ 以上のベクトルが張る空間は

$$
V_{l,r-1} + \mathrm{span}\lbrace v_r \rbrace = V_{l,r}
$$

である. この性質が手順の各操作で保たれることを示す.

- 正規化（定数倍）と入れ替えは、ベクトルの集まりとしての $C$ を変えない.
- 消去 $u \leftarrow u - u_i \cdot \mathtt{basis}[i]$ では、入れ替えにより $\mathtt{pos}[i] \geq t$ となっている.
  - $t \geq l$ なら、番号が $l$ 以上のベクトルの中での行基本変形なので、張る空間は変わらない.
  - $t < l$ なら、番号が $l$ 以上のベクトルは変化しない.

手順の最後に $u$ は基底に登録されるか $0$ になるので、番号が $l$ 以上の基底ベクトル $S_l$ は $V_{l,r}$ を張る. $\square$

</details>

この定理から、$\dim V_{l,r} \geq k$ となる最大の $l$ は、**`pos` のうち $k$ 番目に大きい値**である.
`oldest(k)` はこれを返し（rank が $k$ 未満なら $-1$）、$k = D$ とすれば 3.1 の $l_r$ が求まる.

```cpp
LinearBasis lb(D);
long long ans = 0;  // rank が D になる区間の個数
for (int r = 0; r < N; r++) {
  lb.add(v[r], r);
  int l = lb.oldest(D);
  if (l != -1) ans += l + 1;
}
```

## 4. F_2 での基底を高速に求める

実装: [実装](#実装) の `noshi_basis.cpp`（`Row<K>`, `noshi_basis(input)`）

### 4.1. 問題設定

$\mathbb{F}_2$ 上では加減算が XOR になる.
$64K$ bit のベクトルを `unsigned long long` $K$ 個の配列 `Row<K>` で表し、`a[0]` を最上位のワードとする.
XOR と大小比較はどちらも $O(K)$ でできる.

与えられたベクトルの集合が張る空間の基底を、**簡約階段形**で求める.
ピボットは各ベクトルの最上位 bit とする.

### 4.2. 最上位 bit の判定

$b \neq 0$ のとき、

$$
(x \oplus b) < x \iff x \text{ の } b \text{ の最上位 bit が立っている}
$$

である. XOR で変わるのは $b$ が $1$ の bit だけであり、その中で最上位の bit が大小を決めるからである.
これにより、ピボットの位置を求めずに「$b$ のピボットを $x$ から消すべきか」を比較 1 回で判定できる.

### 4.3. 簡約階段形を保つ

基底が簡約階段形である（各基底ベクトルのピボットの bit が、他のどの基底ベクトルでも $0$）という性質を保ちながら $x$ を追加する.

1. 各基底ベクトル $b$ について、$x$ に $b$ のピボットが立っていれば $x \leftarrow x \oplus b$ とする.
2. $x \neq 0$ なら、各基底ベクトル $b$ について、$b$ に $x$ のピボットが立っていれば $b \leftarrow b \oplus x$ とし、$x$ を基底に加える.

1 で $b$ を XOR しても、$x$ の他のピボットの bit は変わらない（$b$ のその bit は $0$）.
よって基底を見る順番によらず、1 の後の $x$ はすべてのピボットの bit が $0$ になる.
$x \neq 0$ なら、その最上位 bit は既存のどのピボットとも異なる新しいピボットである.

2 でも、$x$ は既存のピボットの bit が $0$ なので、$b$ のピボットは壊れない.
したがって追加後も簡約階段形である.

最後にソートすると、`basis[i]` が $i$ 番目に小さいピボットを持つ基底ベクトルになる.
簡約階段形は一意なので、結果は入力の順番によらず、張る空間だけで決まる.

## 実装

```cpp title="latest_linear_basis.cpp"
struct LinearBasis {
  int D;
  int rank = 0;

  vector<vector<mint>> basis;
  vector<int> pos;

  LinearBasis(int D)
      : D(D), basis(D, vector<mint>(D)), pos(D, -1) {}

  // v を基底に追加する(O(D^2))
  void add(vector<mint> v, int id) {
    for (int i = 0; i < D; i++) {
      if (v[i] == 0) continue;

      // 新しいピボットを発見
      if (pos[i] == -1) {
        mint inv = v[i].inv();
        for (int j = i; j < D; j++) {
          v[j] *= inv;
        }

        basis[i] = move(v);
        pos[i] = id;
        rank++;
        return;
      }

      // より新しい行を基底に残す
      if (pos[i] < id) {
        swap(pos[i], id);
        swap(basis[i], v);

        mint inv = basis[i][i].inv();
        for (int j = i; j < D; j++) {
          basis[i][j] *= inv;
        }
      }

      // ピボット i を消去
      mint coef = v[i];
      for (int j = i; j < D; j++) {
        v[j] -= coef * basis[i][j];
      }
    }
  }

  // k 番目に古い基底の ID を返す(O(D log D))
  int oldest(int k) const {
    if (rank < k) return -1;

    vector<int> ids;
    for (int i = 0; i < D; i++) {
      if (pos[i] != -1) {
        ids.push_back(pos[i]);
      }
    }

    sort(ids.rbegin(), ids.rend());
    return ids[k - 1];
  }
};
```

```cpp title="noshi_basis.cpp"
// xor の基底
#include <algorithm>
#include <vector>

using namespace std;

using ull = unsigned long long;

template <size_t K>
struct Row {
  std::array<ull, K> a{};

  Row() = default;

  template <class... Ts>
    requires(sizeof...(Ts) == K)
  constexpr Row(Ts... xs) : a{static_cast<ull>(xs)...} {}

  constexpr ull& operator[](size_t i) {
    return a[i];
  }

  constexpr const ull& operator[](size_t i) const {
    return a[i];
  }

  constexpr bool any() const {
    for (ull x : a) {
      if (x) return true;
    }
    return false;
  }

  constexpr Row& operator^=(const Row& other) {
    for (size_t i = 0; i < K; ++i) {
      a[i] ^= other.a[i];
    }
    return *this;
  }

  friend constexpr Row operator^(Row lhs, const Row& rhs) {
    lhs ^= rhs;
    return lhs;
  }

  friend constexpr bool operator<(const Row& lhs, const Row& rhs) {
    for (size_t i = 0; i < K; ++i) {
      if (lhs.a[i] != rhs.a[i]) {
        return lhs.a[i] < rhs.a[i];
      }
    }
    return false;
  }

  friend constexpr bool operator==(const Row& lhs, const Row& rhs) {
    return lhs.a == rhs.a;
  }
};

template <size_t K>
std::vector<Row<K>> noshi_basis(const std::vector<Row<K>>& input) {
  std::vector<Row<K>> basis;

  for (auto x : input) {
    for (const auto& b : basis) {
      if ((x ^ b) < x) x ^= b;  // b の最高位 bit が x に立っていたら消す
    }
    // x は既存の基底ではもう小さくできない形になっている
    for (auto& b : basis) {
      if ((b ^ x) < b) b ^= x;  // x の最高位 bit が b に立っていたら消す
    }
    // x != 0 なら新たな基底なので追加する
    if (x.any()) basis.push_back(x);
  }

  sort(basis.begin(), basis.end());
  return basis;
}
```
