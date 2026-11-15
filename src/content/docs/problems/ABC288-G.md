---
title: ABC288 G - 3^N Minesweeper
problem: https://atcoder.jp/contests/abc288/tasks/abc288_g
uses: [bitwise/subset-transform]
tags: []
---
[問題](https://atcoder.jp/contests/abc288/tasks/abc288_g)

## 問題

マス $0, 1, \dots, 3^N - 1$ の各マスに爆弾が $0$ 個か $1$ 個ある.
マス $x$ とマス $y$ は、3 進表記の各桁 $i = 0, \dots, N - 1$ で $|x_i - y_i| \le 1$ のとき**近い**という（$x_i, y_i$ は $x, y$ の 3 進表記の $i$ 桁目）. 各マスは自分自身と近い.

各マス $x$ について、$x$ と近いマスにある爆弾の個数の合計 $A_x$ が与えられる. マス $y$ の爆弾の個数 $B_y$ を 1 つ求めよ.

制約は $1 \le N \le 12$. 条件を満たす $B$ が存在することは保証される.

## 1. 行列で表す

$A_x = \sum_{y : x \text{ と } y \text{ は近い}} B_y$ なので、$3^N \times 3^N$ 行列 $M_N$ を

$$
(M_N)_{x, y} =
\begin{cases}
1 & (x \text{ と } y \text{ は近い}) \\
0 & (\text{otherwise})
\end{cases}
$$

で定めると、$A = M_N B$ と書ける. 行が出力 $x$、列が入力 $y$ である.

たとえば $N = 1$ では、マス $0, 1$ は近く、マス $1, 2$ は近く、マス $0, 2$ は近くないので、

$$
\begin{pmatrix} A_0 \\ A_1 \\ A_2 \end{pmatrix}
=
\underbrace{\begin{pmatrix}
1 & 1 & 0 \\
1 & 1 & 1 \\
0 & 1 & 1
\end{pmatrix}}_{K}
\begin{pmatrix} B_0 \\ B_1 \\ B_2 \end{pmatrix}
$$

である. 入力例 1 の $B = (0, 0, 1)$ を代入すると $A = (0, 1, 1)$ になる.

「$x$ と $y$ が近い」は**桁ごとの条件 $|x_i - y_i| \le 1$ の AND** なので、$M_N$ は最上位の桁で行と列を分けると $M_{N-1}$ のブロックに分かれる.
[部分集合のゼータ変換の行列 $Z_n$](../../bitwise/subset-transform/#claim-3-1) が bit ごとの条件 $s_i \le t_i$ の AND から $Z_{n-1}$ のブロックに分かれたのと同じ形である.

<a id="claim-1-1"></a>

:::note[主張 1.1]
$M_0 = \begin{pmatrix} 1 \end{pmatrix}$ であり、$N \ge 1$ について

$$
M_N =
\begin{pmatrix}
M_{N-1} & M_{N-1} & O \\
M_{N-1} & M_{N-1} & M_{N-1} \\
O & M_{N-1} & M_{N-1}
\end{pmatrix}
$$

が成り立つ（行・列とも、最上位の桁が $0, 1, 2$ の添え字の順に並べる）. つまり $M_N$ の $(a, b)$ ブロックは $K_{a, b} M_{N-1}$ である.
:::

<details>
<summary>証明</summary>

$x = (\alpha, x')$, $y = (\beta, y')$ と最上位の桁 $\alpha, \beta$ とそれ以外 $x', y'$ に分ける.
$x$ と $y$ が近いのは、$|\alpha - \beta| \le 1$ かつ $x'$ と $y'$ が近いときである.
$|\alpha - \beta| \le 1$ は $K_{\alpha, \beta} = 1$ と同じなので、$(\alpha, \beta)$ ブロックは、$K_{\alpha, \beta} = 0$ のとき $O$、$K_{\alpha, \beta} = 1$ のとき $M_{N-1}$ になる. $\square$

</details>

> $A = M_N B$ から $B$ を求めよ.

## 2. 逆行列への帰着

$K$ の行列式は $-1$ なので $K$ は逆行列をもち、

$$
K^{-1} =
\begin{pmatrix}
0 & 1 & -1 \\
1 & -1 & 1 \\
-1 & 1 & 0
\end{pmatrix}
$$

である. $M_N^{-1}$ は、[主張 1.1](#claim-1-1) のブロックの並びを $K$ から $K^{-1}$ に置き換えた形になる.

<a id="claim-2-1"></a>

:::note[主張 2.1]
$M_N$ は逆行列をもち、$M_N^{-1}$ の $(a, b)$ ブロックは $(K^{-1})_{a, b} M_{N-1}^{-1}$ である.
:::

<details>
<summary>証明</summary>

$N$ についての帰納法で示す. $N = 0$ は明らか. $M_{N-1}^{-1}$ が存在すると仮定する.
$M_N$ と、$(a, b)$ ブロックが $(K^{-1})_{a, b} M_{N-1}^{-1}$ の行列 $W$ の積 $M_N W$ の $(a, c)$ ブロックは

$$
\sum_{b = 0}^{2} K_{a, b} M_{N-1} \cdot (K^{-1})_{b, c} M_{N-1}^{-1}
= \Bigl( \sum_{b = 0}^{2} K_{a, b} (K^{-1})_{b, c} \Bigr) I
= [a = c] \, I
$$

なので、$M_N W = I$ である. よって $W = M_N^{-1}$. $\square$

</details>

$M_N$ が逆行列をもつので、$A = M_N B$ を満たす $B$ は $B = M_N^{-1} A$ だけである. 条件を満たす $B$ が存在することは保証されているので、$M_N^{-1} A$ を出力すればよい.

> $M_N^{-1} A$ を計算せよ.

## 3. 分割統治で計算する

$M_N^{-1} A$ を定義どおりに計算すると $O(9^N)$ かかる. $M_N^{-1}$ のブロックの形を使うと、[部分集合のゼータ変換の主張 3.2](../../bitwise/subset-transform/#claim-3-2) と同じ分割統治で速くなる.

<a id="claim-3-1"></a>

:::note[主張 3.1]
長さ $3^N$ のベクトル $A$ に対して、$M_N^{-1} A$ は $O(N 3^N)$ で計算できる.
:::

<details>
<summary>証明</summary>

$A$ を、最上位の桁が $b$ の添え字の部分 $A^{(b)}$（$b = 0, 1, 2$）に分ける. [主張 2.1](#claim-2-1) より、$M_N^{-1} A$ の最上位の桁が $a$ の部分は

$$
(M_N^{-1} A)^{(a)} = \sum_{b = 0}^{2} (K^{-1})_{a, b} \, M_{N-1}^{-1} A^{(b)}
$$

である. よって $g_b = M_{N-1}^{-1} A^{(b)}$（$b = 0, 1, 2$）を再帰的に計算した後、各位置 $j$（$0 \le j < 3^{N-1}$）で長さ $3$ のベクトル $(g_0[j], g_1[j], g_2[j])$ に $K^{-1}$ を掛ければよい.
計算量を $C(N)$ とすると $C(N) = 3 C(N - 1) + O(3^N)$ なので、$C(N) = O(N 3^N)$ である. $\square$

</details>

行列で書くと、[主張 3.1](#claim-3-1) の計算は、2 つの行列

$$
L =
\begin{pmatrix}
O & I & -I \\
I & -I & I \\
-I & I & O
\end{pmatrix},
\qquad
D =
\begin{pmatrix}
M_{N-1}^{-1} & O & O \\
O & M_{N-1}^{-1} & O \\
O & O & M_{N-1}^{-1}
\end{pmatrix}
$$

の積 $M_N^{-1} = L D$ に分けることに当たる. $D$ を掛けることが $A^{(0)}, A^{(1)}, A^{(2)}$ をそれぞれ再帰的に変換することに、$L$ を掛けることが $g_0, g_1, g_2$ の各位置 $j$ で $K^{-1}$ を掛けることに対応する.

[主張 3.1](#claim-3-1) の再帰は、そのまま再帰関数で書ける. 長さ $3^k$ の区間 $[l, r)$ に $M_k^{-1}$ を掛ける関数 `f(f, l, r)` は、$w = (r - l) / 3$ として $[l, l + w)$, $[l + w, l + 2w)$, $[l + 2w, r)$ をそれぞれ再帰的に変換した後（$g_0, g_1, g_2$ を求める）、各 $j \in [l, l + w)$ で $(a_j, a_{j + w}, a_{j + 2w})$ に $K^{-1}$ を掛ける. 再帰の深さは $N$ なので、再帰をループに展開しなくても問題ない.

## 提出コード

```cpp title="main.cpp"
int main() {
  int N;
  cin >> N;
  int M = 1;
  for (int i = 0; i < N; i++) M *= 3;
  vector<long long> a(M);
  for (auto& x : a) cin >> x;
  const long long Kinv[3][3] = {{0, 1, -1}, {1, -1, 1}, {-1, 1, 0}};

  // a[l, r) に M_k^{-1} を掛ける（r - l = 3^k）
  auto f = [&](auto& f, int l, int r) -> void {
    if (r - l == 1) return;
    int w = (r - l) / 3;
    f(f, l, l + w);          // g_0 = M_{k-1}^{-1} A^(0)
    f(f, l + w, l + 2 * w);  // g_1 = M_{k-1}^{-1} A^(1)
    f(f, l + 2 * w, r);      // g_2 = M_{k-1}^{-1} A^(2)
    for (int j = l; j < l + w; j++) {
      long long g[3] = {a[j], a[j + w], a[j + 2 * w]};
      for (int c = 0; c < 3; c++)
        a[j + c * w] = Kinv[c][0] * g[0] + Kinv[c][1] * g[1] + Kinv[c][2] * g[2];
    }
  };
  f(f, 0, M);

  for (int i = 0; i < M; i++) cout << a[i] << " \n"[i + 1 == M];
}
```
