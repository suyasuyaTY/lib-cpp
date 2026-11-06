---
title: "巨大な LCM を持たない合同条件の管理"
tags: [number-theory, modular]
sidebar:
  order: 7
---
## 概要

$i<k$ について合同条件

$$
x \equiv r_i \pmod{M_i}
$$

が与えられているとする。新しい法 $L=M_k$ に対して、$x \bmod L$ が取りうる値を求め、そのうち一つを新しい条件として追加したい。

既存の条件を

$$
x \equiv r \pmod{\operatorname{lcm}(M_1,\dots,M_{k-1})}
$$

という一本の合同式で持つと、LCM が非常に大きくなり、多倍長整数が必要になる。そこで、LCM 全体ではなく、素数ごとの合同条件を管理する。

## 保持する情報

既存の法の LCM を

$$
\operatorname{lcm}(M_1,\dots,M_{k-1})=\prod_p p^{e_p}
$$

とする。各素数 $p$ について、次の二つを保持する。

- `pow_max[p]` $=p^{e_p}$：これまでに現れた最大の素数冪
- `rem[p]` $=x \bmod p^{e_p}$：その素数冪に対する余り

異なる素数の冪は互いに素なので、これらをすべて合わせた条件は、元の LCM を法とする合同条件と中国剰余定理により同値である。

## $x \bmod L$ が取りうる値を求める

新しい法を

$$
L=\prod_p p^{f_p}
$$

と素因数分解する。

### 1. 素数ごとの制約を取り出す

$L$ に含まれる各素数 $p$ について、既存の条件から分かるのは

$$
x \equiv \operatorname{rem}[p]
\pmod{p^{\min(e_p,f_p)}}
$$

である。ただし、これまで現れていない素数では $e_p=0$ とみなし、制約はない。

- $e_p\ge f_p$：既存の条件だけで $x \bmod p^{f_p}$ が一意に決まる。
- $e_p<f_p$：$x \bmod p^{e_p}$ までしか決まらない。

### 2. 制約を中国剰余定理でまとめる

$$
g=\prod_p p^{\min(e_p,f_p)}
$$

とする。各素数について得た条件の法は互いに素なので、中国剰余定理によって

$$
x \equiv a \pmod g
$$

という一本の条件にまとめられる。なお、$g$ は既存の法の LCM と $L$ の最大公約数に等しい。

したがって、$x \bmod L$ が取りうる値は

$$
a, a+g, a+2g, \dots
$$

である。

## 中国剰余定理による二条件の併合

互いに素な $g,h$ に対して、次の二条件を併合する。

$$
x\equiv r\pmod g,\qquad x\equiv s\pmod h
$$

$x=r+gk$ とおくと、二つ目の条件から

$$
r+gk\equiv s\pmod h
$$

を得る。$g$ は $h$ を法とする逆元を持つので、

$$
k\equiv(s-r)g^{-1}\pmod h
$$

である。よって、併合後の条件は

$$
x\equiv r+gk\pmod{gh}
$$

となる。この操作を素数ごとの条件に順番に適用すれば、前節の $a \bmod g$ を求められる。

## 選んだ値を新しい条件として追加する

取りうる値の中から $s=x\bmod L$ を一つ選んだとする。$L$ に含まれる各素数 $p$ について、次のように更新する。

- $e_p\ge f_p$：既存の条件の方が強いため、更新しない。
- $e_p<f_p$：新しい条件の方が強いため、次のように更新する。
  - `pow_max[p]` $\gets p^{f_p}$
  - `rem[p]` $\gets s \bmod p^{f_p}$

$s$ は前節で求めた取りうる値から選ぶため、更新前の条件との整合性は保たれる。

## 実装例

以下では、素因数分解の結果を `(素数, その素数の最大冪)` の列として持つ。例えば、$12=2^2\cdot3$ は `{{2, 4}, {3, 3}}` と表す。

3つの処理はすべて `main` 内のラムダ式として定義する。

- `factorize(L)`：$L$ を素因数分解する。
- `get_residue_class(factors)`：$x\bmod L$ が取りうる値を $r+gk$ の `(r, g)` で返す。
- `merge_condition(factors, s)`：選んだ条件 $x\equiv s\pmod L$ を併合する。

`get_residue_class` と `merge_condition` は、素因数分解結果を `const` 参照で受け取る。$L$ と $s$ は `long long` の非負整数であり、$0\le s<L$ とする。

```cpp
map<ll, ll> pow_max;  // p -> これまでに現れた最大の p の冪
map<ll, ll> rem;      // p -> x mod pow_max[p]

// 戻り値の各要素は (p, p^f)。
auto factorize = [](ll n) -> vector<pll> {
    vector<pll> factors;

    for (ll p = 2; p <= n / p; ++p) {
        if (n % p != 0) continue;

        ll prime_power = 1;
        while (n % p == 0) {
            n /= p;
            prime_power *= p;
        }
        factors.emplace_back(p, prime_power);
    }

    if (n > 1) factors.emplace_back(n, n);
    return factors;
};

// 戻り値 (r, g) は x = r + gk (k は整数) を表す。
auto get_residue_class = [&](const vector<pll>& factors) -> std::pair<ll, ll> {
    ll r = 0;
    ll g = 1;

    for (const auto& [p, prime_power] : factors) {
        const auto it = pow_max.find(p);
        if (it == pow_max.end()) continue;

        // この素数について既存の条件と L が共有する部分。
        const ll h = min(it->second, prime_power);
        const ll target = rem.at(p) % h;

        // x = r + gk ≡ target (mod h) を解く。
        ll diff = (target - r + h) % h;

        const ll k = diff * inv_mod(g, h) % h;
        const ll next_g = g * h;

        r = (r + g * k) % next_g;
        g = next_g;
    }

    return {r, g};
};

auto merge_condition = [&](const vector<pll>& factors, ll s) -> void {
    for (const auto& [p, prime_power] : factors) {
        const auto it = pow_max.find(p);

        if (it == pow_max.end() || it->second < prime_power) {
            pow_max[p] = prime_power;
            rem[p] = s % prime_power;
        }
    }
};
```

## 問題例

### [ABC371-G Lexicographically Smallest Permutation](https://atcoder.jp/contests/abc371/tasks/abc371_g)

- $P$ はいくつかのループに分解できる
- 前の項を含むループから、何回shiftするのが許可されているかを$x = r + gk$で求め、一番小さいものを先頭に持っていくのを繰り返す
