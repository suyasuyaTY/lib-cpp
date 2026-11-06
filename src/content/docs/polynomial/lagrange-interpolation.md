---
title: "ラグランジュ補間"
sidebar:
  order: 1
---
## 1. 概要

$f(x)$ が $n$ 次以下の多項式であるとき、$x$ 座標が相異なる $n + 1$ 点 $(x_i, y_i)$ が分かれば、$f(x)$ を一意に復元できる。ただし $y_i = f(x_i)$ とする。

用途は 2 つある。

- **1 点での値 $f(t)$ を求める**（4 章）：競技プログラミングで多い用途。
  - 一般の点：補間公式をそのまま評価すると $O(n^2)$。
  - 連続整数・等間隔の点：階乗と累積積を使って $O(n)$。
- **多項式自体（係数 $c_0, \dots, c_n$）を復元する**（5 章）：
  - そのまま展開すると $O(n^2)$。
  - 分割統治と NTT で $O(n \log^2 n)$。

ここでの計算量は体上の演算回数で考える。mod の逆元を累乗で計算する場合、その計算時間は別途必要になる。

実装例：[実装](#実装)

- `lagrange_interpolation(y, t)`：連続整数の点から 1 点の値を求める（4 章）。等間隔の点での呼び出し例付き。
- `Interpolation(x).interpolate(y)`, `interpolation_iota(y)`：係数を復元する（5 章）。多項式の積・剰余・微分は [形式的冪級数の実装](../../fps/formal-power-series/#実装) を使うので、先に貼っておく。

## 2. 前提知識

- 多項式の根と一意性、mod 上での割り算
- 5 章：[NTT](../../fps/ntt/)（多項式の積）、[逆元](../../fps/formal-power-series/)（多項式の割り算）

## 3. 補間公式

$i$ 番目の点でだけ $1$、他の既知の点では $0$ になる多項式を作る。

$$
L_i(x)=\prod_{\substack{0 \le j \le n \\ j \ne i}}
\frac{x-x_j}{x_i-x_j}
$$

$L_i$ は $n$ 次の多項式であり、次を満たす。

$$
L_i(x_k)=
\begin{cases}
1 & (k=i),\\
0 & (k\ne i).
\end{cases}
$$

$k=i$ なら各因子が $1$、$k\ne i$ なら $j=k$ の因子の分子が $0$ になるためである。

よって、求める多項式は

$$
f(x)=\sum_{i=0}^{n} y_i L_i(x)
$$

となる。右辺は $n$ 次以下であり、$x=x_k$ を代入すると $y_k$ だけが残るので、すべての既知の点を通る。

## 4. 1 点での値 $f(t)$ を求める

### 4.1. 一般の点

3 章の式に $x = t$ を代入し、各 $L_i(t)$ を $O(n)$ で計算すれば、全体で $O(n^2)$ である。

### 4.2. 連続整数

$y_i=f(i)$（$0 \le i \le n$）が分かっているとする。

$$
f(t) = \sum_{i=0}^{n} y_i \,
\frac{\prod_{j \ne i} (t - j)}{\prod_{j \ne i} (i - j)}
$$

の分母と分子をそれぞれ $O(1)$ で求められるようにする。

**分母**は階乗を使ってまとめられる。

$$
\begin{aligned}
\prod_{\substack{0 \le j \le n \\ j \ne i}}(i-j)
&=(i(i-1)\cdots 1)((-1)(-2)\cdots (-(n-i)))\\
&=i!\,(-1)^{n-i}(n-i)!.
\end{aligned}
$$

**分子**は $j = i$ の因子だけが抜けた積

$$
\prod_{\substack{0 \le j \le n \\ j \ne i}}(t-j) = t(t-1) \cdots (t-i+1) \cdot (t - i - 1) \cdots (t - n)
$$

なので、左からの累積積と右からの累積積

$$
\mathrm{pre}[i] = \prod_{j=0}^{i-1} (t - j),
\qquad
\mathrm{suf}[i] = \prod_{j=i}^{n} (t - j)
$$

（$\mathrm{pre}[0] = \mathrm{suf}[n+1] = 1$）を前計算しておけば

$$
\boxed{
\prod_{\substack{0 \le j \le n \\ j \ne i}}(t-j) = \mathrm{pre}[i] \cdot \mathrm{suf}[i+1]
}
$$

と求まる。以上をまとめると

$$
f(t) = \sum_{i=0}^{n} y_i \cdot \frac{(-1)^{n-i} \, \mathrm{pre}[i] \, \mathrm{suf}[i+1]}{i! \, (n-i)!}
$$

であり、階乗の逆元も $O(n)$ で前計算できるので全体で $O(n)$ である。

### 4.3. 等間隔だが連続整数ではない

$x_i=a+di$（$0 \le i \le n$）で値が与えられる場合は、変数を変換する。
$d$ は非零で、逆元が存在するとする。

$$
g(i)=f(a+di), \qquad u=\frac{t-a}{d}.
$$

$g$ も $n$ 次以下の多項式であり、$g(i)=y_i$ なので、4.2 の方法で

$$
f(t)=g\left(\frac{t-a}{d}\right)
$$

を求めればよい。$t$ が既知の点の間にある必要はなく、$(t-a)/d$ が整数になる必要もない。
mod 上では整数除算をせず、$d^{-1}$ を掛けて求める。

$a,a+1,\ldots,a+n$ のように始点だけが異なる場合は $d=1$ として $u=t-a$ にずらすだけでよい。

## 5. 多項式自体を復元する

$f(x) = c_0 + c_1 x + \cdots + c_n x^n$ の係数をすべて求める。

### 5.1. 補間公式の書き換え

$Q(x) = \prod_{j=0}^{n} (x - x_j)$ とおく。積の微分より

$$
Q'(x_i) = \prod_{j \ne i} (x_i - x_j)
$$

なので、3 章の $L_i$ の分母は $Q'(x_i)$ である。よって $w_i = y_i / Q'(x_i)$ とおくと

$$
f(x) = \sum_{i=0}^{n} w_i \, \frac{Q(x)}{x - x_i}
$$

と書ける。

**$O(n^2)$ の方法**: $Q(x)$ を $O(n^2)$ で展開しておき、各 $i$ について $Q(x) / (x - x_i)$ を組立除法で $O(n)$ で求めて $w_i$ 倍して足す。$Q(x) = (x - x_i) R(x)$ のとき、$R$ の係数は上から

$$
r_{n} = q_{n+1}, \qquad r_{k-1} = q_k + x_i \, r_k
$$

で求まる。$n$ が数千程度までならこれで十分である。

### 5.2. 分割統治による $O(n \log^2 n)$ の方法

点の添字 $\lbrace 0, \dots, n \rbrace$ を半分ずつに分けた二分木を考え、各ノード（区間 $I$）に

$$
Q_I(x) = \prod_{j \in I} (x - x_j),
\qquad
N_I(x) = \sum_{i \in I} w_i \prod_{j \in I, \ j \ne i} (x - x_j)
$$

を持たせる。根では $N_{\text{根}} = f$ である。

**Step 1（部分積の木）**: 葉は $Q_{\lbrace i \rbrace} = x - x_i$、内部ノードは $Q_I = Q_{\text{左}} \, Q_{\text{右}}$。
木の各段で次数の合計は $n + 1$ なので、NTT を使えば 1 段 $O(n \log n)$、全体 $O(n \log^2 n)$ である。

**Step 2（重み $w_i$）**: $Q'(x_i)$ を全 $i$ について求める（多点評価）。
$g(x_i) = g \bmod (x - x_i)$ であり、$I \subseteq J$ なら $(g \bmod Q_J) \bmod Q_I = g \bmod Q_I$ なので、根から順に

$$
g_I = g_{\text{親}} \bmod Q_I
$$

と剰余をとりながら木を下れば、葉で $g_{\lbrace i \rbrace} = g(x_i)$ が得られる。
多項式の剰余は逆元を使って $O(d \log d)$ でできるので、全体 $O(n \log^2 n)$ である。

**Step 3（和をまとめる）**: 葉は $N_{\lbrace i \rbrace} = w_i$。内部ノードでは、$i$ が左にあれば右の点の因子 $Q_{\text{右}}$ がすべて掛かり、右にあれば $Q_{\text{左}}$ が掛かるので

$$
\boxed{
N_I = N_{\text{左}} \, Q_{\text{右}} + N_{\text{右}} \, Q_{\text{左}}
}
$$

である。Step 1 の $Q$ をそのまま使え、全体 $O(n \log^2 n)$ である。

### 5.3. 連続整数の点

$x_i = i$ のときは 4.2 節の分母の計算から

$$
Q'(i) = (-1)^{n-i} \, i! \, (n-i)!
$$

なので、Step 2 の多点評価を省略して $w_i$ を $O(n)$ で求められる。
Step 1 と Step 3 は残るので計算量は $O(n \log^2 n)$ のままだが、定数倍が大きく改善する。

## 実装

```cpp title="interpolation.cpp"
#include <cassert>
#include <vector>

// ラグランジュ補間
// - lagrange_interpolation(y, t): y[i] = f(i) から 1 点の値 f(t) を求める。O(n)
// - Interpolation(x).interpolate(y): 相異なる x[i] と y[i] = f(x[i]) から f の係数を求める。O(n log^2 n)
// - interpolation_iota(y): y[i] = f(i) から f の係数を求める。O(n log^2 n)
//
// 係数を求める部分の多項式演算（積・剰余・微分）は FPS を使う。
// 形式的べき級数/FPS.cpp を先に貼り、FPS = FormalPowerSeries<mint> が定義されていること。

// ---------------------------------------------------------------------------
// 1 点の値
// ---------------------------------------------------------------------------

// y[i] = f(i) から f(t) を求める。deg(f) <= n = y.size() - 1。
// mint は素数 p を法とする modint 型（inv() を持つ）を想定。FPS は不要。
// 前提: y は空でなく、n < p。
// 時間: O(n + log p)（逆元計算を含む）、追加メモリ: O(n)。
template <class mint>
mint lagrange_interpolation(const std::vector<mint>& y, mint t) {
    assert(!y.empty());
    int n = (int)y.size() - 1;

    std::vector<mint> invfact(n + 1);
    mint fact = 1;
    for (int i = 1; i <= n; ++i) fact *= i;
    invfact[n] = fact.inv();
    for (int i = n; i >= 1; --i) invfact[i - 1] = invfact[i] * i;

    std::vector<mint> pre(n + 2), suf(n + 2);
    pre[0] = 1;
    for (int i = 0; i <= n; ++i) pre[i + 1] = pre[i] * (t - mint(i));
    suf[n + 1] = 1;
    for (int i = n; i >= 0; --i) suf[i] = (t - mint(i)) * suf[i + 1];

    mint ans = 0;
    for (int i = 0; i <= n; ++i) {
        mint term = y[i] * pre[i] * suf[i + 1] * invfact[i] * invfact[n - i];
        if ((n - i) & 1) ans -= term;
        else ans += term;
    }
    return ans;
}

// ---------------------------------------------------------------------------
// 係数の復元（FPS を使用）
// ---------------------------------------------------------------------------

// 戻り値 c は f(x) = c[0] + c[1] x + ... + c[n] x^n（長さ n + 1）。
// 時間: O(n log^2 n)、追加メモリ: O(n log n)。
struct Interpolation {
    int m;                  // 点の個数 n + 1
    std::vector<FPS> tree;  // tree[k] = 担当区間の prod (x - x_i)

    explicit Interpolation(const std::vector<mint>& x) : m((int)x.size()), tree(4 * x.size()) {
        assert(m >= 1);
        build(1, 0, m, x);
    }

    // 一般の点: w[i] = y[i] / Q'(x[i]) を多点評価で求める。
    FPS interpolate(const std::vector<mint>& y) const {
        assert((int)y.size() == m);
        std::vector<mint> w(m);
        evaluate(1, 0, m, tree[1].diff(), w);
        for (int i = 0; i < m; ++i) w[i] = y[i] / w[i];
        return combine(1, 0, m, w);
    }

    // w[i] = y[i] / Q'(x[i]) が分かっているとき、sum w[i] Q(x) / (x - x[i]) を求める。
    FPS combine(const std::vector<mint>& w) const { return combine(1, 0, m, w); }

  private:
    void build(int k, int l, int r, const std::vector<mint>& x) {
        if (r - l == 1) {
            tree[k] = {-x[l], 1};
            return;
        }
        int mid = (l + r) / 2;
        build(2 * k, l, mid, x);
        build(2 * k + 1, mid, r, x);
        tree[k] = tree[2 * k] * tree[2 * k + 1];
    }

    // 多点評価: val[i] = g(x[i])（i in [l, r)）
    void evaluate(int k, int l, int r, FPS g, std::vector<mint>& val) const {
        g = g % tree[k];
        if (r - l == 1) {
            val[l] = g.empty() ? mint(0) : g[0];
            return;
        }
        int mid = (l + r) / 2;
        evaluate(2 * k, l, mid, g, val);
        evaluate(2 * k + 1, mid, r, g, val);
    }

    // N_[l,r) = N_左 Q_右 + N_右 Q_左
    FPS combine(int k, int l, int r, const std::vector<mint>& w) const {
        if (r - l == 1) return {w[l]};
        int mid = (l + r) / 2;
        FPS res = combine(2 * k, l, mid, w) * tree[2 * k + 1] + combine(2 * k + 1, mid, r, w) * tree[2 * k];
        res.resize(r - l);
        return res;
    }
};

// y[i] = f(i)（0 <= i <= n）から f の係数を求める。
// 1 / Q'(i) = (-1)^{n-i} / (i! (n-i)!) なので多点評価を省略できる。
// 前提: y は空でなく、n < p。
FPS interpolation_iota(const std::vector<mint>& y) {
    assert(!y.empty());
    int n = (int)y.size() - 1;

    std::vector<mint> x(n + 1), invfact(n + 1);
    for (int i = 0; i <= n; ++i) x[i] = i;
    mint fact = 1;
    for (int i = 1; i <= n; ++i) fact *= i;
    invfact[n] = fact.inv();
    for (int i = n; i >= 1; --i) invfact[i - 1] = invfact[i] * i;

    std::vector<mint> w(n + 1);
    for (int i = 0; i <= n; ++i) {
        w[i] = y[i] * invfact[i] * invfact[n - i];
        if ((n - i) & 1) w[i] = -w[i];
    }
    return Interpolation(x).combine(w);
}

// 使用例:
// std::vector<mint> y = {1, 2, 5};
// mint v = lagrange_interpolation(y, mint(3));  // 10（f(x) = x^2 + 1）
// FPS c = interpolation_iota(y);                // {1, 0, 1}
//
// 等間隔の点 y[i] = f(a + d * i) の 1 点の値:
// a, d, t は mint 型とし、d != 0、n < p を満たすこと。
// mint u = (t - a) * d.inv();
// mint answer = lagrange_interpolation(y, u);
//
// 一般の点の係数:
// std::vector<mint> x = {1, 3, 4}, y2 = {2, 10, 17};
// FPS c2 = Interpolation(x).interpolate(y2);    // {1, 0, 1}
```

## 6. 関連問題

- [ABC208 - F Cumulative Sum](https://atcoder.jp/contests/abc208/tasks/abc208_f)（1 点の値）
