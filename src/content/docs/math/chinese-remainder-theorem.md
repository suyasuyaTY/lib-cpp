---
title: "中国剰余定理"
tags: [number-theory, modular]
sidebar:
  order: 6
---
「～で割った余りが～である」という複数の条件が単一の条件にまとめ上げる定理

## アルゴリズム

### 拡張ユークリッドの互除法を用いた方法
$x \equiv b_i \pmod {m_i} (i = 1, \dots, K)$ を満たす $x \equiv r \pmod{lcm(m_1, m_2, \dots, m_K)}$ を具体的に求める。

:::note[二元の場合の解]
$$
\begin{align*}
x &= b_1 + s m_1 p = b_2 - s m_2 q \\
s &= \frac{b_2 - b_1}{d}
\end{align*}
$$
:::

1. 初期値の設定
    $x \equiv 0 \pmod{1}$ として任意の整数を設定する。
2. 各 $i$ に対する条件とマージ

```cpp
inline ll mod(ll a, ll m) {
  return (a % m + m) % m;
}

ll extGcd(ll a, ll b, ll &p, ll &q) {
  if (b == 0) {
    p = 1;
    q = 0;
    return a;
  }
  ll d = extGcd(b, a % b, q, p);
  q -= a / b * p;
  return d;
}

// 中国剰余定理
// リターン値を (r, m) とすると解は x ≡ r (mod. m)
// 解なしの場合は (0, -1) をリターン
pair<ll, ll> ChineseRem(const vector<ll> &b, const vector<ll> &m) {
  ll r = 0, M = 1;
  for (int i = 0; i < (int)b.size(); ++i) {
    ll p, q;
    ll d = extGcd(M, m[i], p, q);  // p is inv of M/d (mod. m[i]/d)
    if ((b[i] - r) % d != 0) return make_pair(0, -1);
    ll tmp = (b[i] - r) / d * p % (m[i] / d);
    r += M * tmp;
    M *= m[i] / d;
  }
  return make_pair(mod(r, M), M);
}
```

### Garnerのアルゴリズム
$m_1, m_2, \dots, m_K$ はどの2つも互いに素であるとする。

$$
x = t_1 + t_2 m_1 + t_3 m_1 m_2 + \cdots + t_K m_1 m_2 \dots m_K
$$

の形で条件を満たすものを探す。

$$
t_1 + t_2 m_1 + \cdots + t_k m_1 m_2 \dots m_k \equiv b_k \pmod{m_k}
$$

を満たすように $t_k$ を求めればよい。 $m_1, m_2, \dots, m_k$ はどの2つも互いに素なので、逆元が必ず存在するため構成可能。

```cpp
// 負の数にも対応した mod (a = -11 とかでも OK)
inline ll mod(ll a, ll m) {
  ll res = a % m;
  if (res < 0) res += m;
  return res;
}

// 拡張 Euclid の互除法
ll extGCD(ll a, ll b, ll &p, ll &q) {
  if (b == 0) {
    p = 1;
    q = 0;
    return a;
  }
  ll d = extGCD(b, a % b, q, p);
  q -= a / b * p;
  return d;
}

// 逆元計算 (ここでは a と m が互いに素であることが必要)
ll modinv(ll a, ll m) {
  ll x, y;
  extGCD(a, m, x, y);
  return mod(x, m);  // 気持ち的には x % m だが、x が負かもしれないので
}

// Garner のアルゴリズム, x%MOD, LCM%MOD を求める (m は互いに素でなければならない)
// for each step, we solve "coeffs[k] * t[k] + constants[k] = b[k] (mod. m[k])"
//      coeffs[k] = m[0]m[1]...m[k-1]
//      constants[k] = t[0] + t[1]m[0] + ... + t[k-1]m[0]m[1]...m[k-2]
ll Garner(vector<ll> b, vector<ll> m, ll MOD) {
  m.push_back(MOD);  // banpei
  vector<ll> coeffs((int)m.size(), 1);
  vector<ll> constants((int)m.size(), 0);
  for (int k = 0; k < (int)b.size(); ++k) {
    ll t = mod((b[k] - constants[k]) * modinv(coeffs[k], m[k]), m[k]);
    for (int i = k + 1; i < (int)m.size(); ++i) {
      (constants[i] += t * coeffs[i]) %= m[i];
      (coeffs[i] *= m[k]) %= m[i];
    }
  }
  return constants.back();
}
```
