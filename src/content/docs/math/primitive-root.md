---
title: "原始根"
tags: [number-theory, modular]
sidebar:
  order: 9
---
## 1. 概要

素数を法とする原始根についてのまとめ。

$p$ を素数とするとき, $\mathbb{F}_{p}$ の $0$ でない元全体 $\mathbb{F}_{p}^{\times} = \lbrace 1, 2, \ldots, p-1 \rbrace$ は, ある元 $g$ (原始根) を使って

$$
\mathbb{F}_{p}^{\times} = \lbrace g^{0}, g^{1}, g^{2}, \ldots, g^{p-2} \rbrace
$$

と等比数列の形で並べることができる。

## 2. 知識

以下, $p$ は素数とし, 計算はすべて $\bmod p$ で考える。

### 2.1. 位数

> **定義 (位数)**
>
> $a \in \mathbb{F}_{p}^{\times}$ とする。$a^{m} = 1$ を満たす正整数 $m$ のうち最小のものを $a$ の **位数** といい, $\mathrm{ord}(a)$ と書く。
>
> Fermat の小定理 $a^{p-1} = 1$ より位数は必ず存在し, さらに位数は $p-1$ の約数となる。

より一般に, 次が成り立つ。

> **補題 1**
>
> $d = \mathrm{ord}(a)$ とする。整数 $n \geq 0$ について, $a^{n} = 1 \iff d \mid n$ 。

<details>
<summary>証明</summary>

$n$ を $d$ で割って $n = qd + r \ (0 \leq r < d)$ とする。$a^{d} = 1$ より

$$
a^{n} = (a^{d})^{q} \cdot a^{r} = a^{r}
$$

である。

- $d \mid n$ なら $r = 0$ なので $a^{n} = a^{0} = 1$ 。
- $a^{n} = 1$ なら $a^{r} = 1$ 。$r \geq 1$ だと $d$ より小さい正整数 $r$ で $a^{r} = 1$ となり, $d$ の最小性に反する。よって $r = 0$, すなわち $d \mid n$ 。

特に Fermat の小定理より $a^{p-1} = 1$ なので, $n = p-1$ とすれば $\mathrm{ord}(a) \mid p-1$ が従う。 $\square$

</details>

$a$ のべき乗全体の集合を

$$
\langle a \rangle = \lbrace a^{n} \mid n \geq 0 \rbrace
$$

と書く。

> **補題 2**
>
> $d = \mathrm{ord}(a)$ とすると, $\langle a \rangle = \lbrace a^{0}, a^{1}, \ldots, a^{d-1} \rbrace$ であり, これらは相異なる。特に $\langle a \rangle$ の要素数はちょうど $d$ 。

<details>
<summary>証明</summary>

補題 1 の証明と同様に $a^{n} = a^{n \bmod d}$ なので, $\langle a \rangle = \lbrace a^{0}, \ldots, a^{d-1} \rbrace$ 。

$0 \leq i < j < d$ で $a^{i} = a^{j}$ と仮定すると, 両辺に $a^{-i}$ を掛けて $a^{j-i} = 1$ 。ところが $0 < j - i < d$ なので $d$ の最小性に反する。よってこれら $d$ 個は相異なる。 $\square$

</details>

### 2.2. 原始根

> **定義 (原始根)**
>
> $g \in \mathbb{F}_{p}^{\times}$ の位数が $p-1$ であるとき, $g$ を **原始根** という。

補題 2 より, $g$ が原始根であることは $\langle g \rangle = \mathbb{F}_{p}^{\times}$ (つまり $g$ のべき乗で $0$ 以外のすべての元が作れる) ことと同値である。

## 3. 性質

この章では, 「位数」だけを見れば「べき乗で作れる集合 $\langle a \rangle$」が決まってしまう, という性質を示す。
鍵となるのは次の補題である。

> **補題 3 (根の個数)**
>
> $d \geq 1$ とする。$\mathbb{F}_{p}$ 上で方程式 $x^{d} = 1$ の解は高々 $d$ 個。

<details>
<summary>証明</summary>

$\mathbb{F}_{p}$ は体なので, $0$ でない $n$ 次多項式の根は高々 $n$ 個である
(根 $\alpha$ があれば $f(x) = (x - \alpha) h(x)$ と因数分解でき, 体では積が $0$ なら一方が $0$ なので, 残りの根は $h$ の根となる。これを次数について帰納法で繰り返せばよい)。

$x^{d} - 1$ は $d$ 次多項式なので, 根は高々 $d$ 個。 $\square$

</details>

これと補題 2 を組み合わせると, 次がわかる。

> **補題 4**
>
> $\mathrm{ord}(a) = d$ ならば, $\langle a \rangle$ は方程式 $x^{d} = 1$ の解全体と一致する。

<details>
<summary>証明</summary>

$\langle a \rangle$ の任意の元 $a^{n}$ は $(a^{n})^{d} = (a^{d})^{n} = 1$ を満たすので, $x^{d} = 1$ の解である。

補題 2 より $\langle a \rangle$ には相異なる元がちょうど $d$ 個あり, 補題 3 より解は高々 $d$ 個しかない。
よって $\langle a \rangle$ が解のすべてである。 $\square$

</details>

つまり $\langle a \rangle$ は「$x^{d} = 1$ を満たす元全体」という, $a$ によらず $d$ だけで決まる集合になっている。以下の 2 つの性質はここから直ちに従う。

### 3.1. 位数が同じなら, べき乗で作れる集合も同じ

> **性質 1**
>
> $\mathrm{ord}(a) = \mathrm{ord}(b)$ ならば $\langle a \rangle = \langle b \rangle$ 。

たとえば $p = 7$ のとき, $2$ と $4$ はどちらも位数 $3$ であり,

$$
\langle 2 \rangle = \lbrace 1, 2, 4 \rbrace, \quad \langle 4 \rangle = \lbrace 1, 4, 2 \rbrace
$$

と並ぶ順番は違っても集合としては一致する。

<details>
<summary>証明</summary>

$d = \mathrm{ord}(a) = \mathrm{ord}(b)$ とする。補題 4 より, $\langle a \rangle$ も $\langle b \rangle$ も「$x^{d} = 1$ の解全体」と一致する。よって $\langle a \rangle = \langle b \rangle$ 。 $\square$

</details>

### 3.2. 位数が約数なら, べき乗で作れる集合は含まれる

> **性質 2**
>
> $\mathrm{ord}(b)$ が $\mathrm{ord}(a)$ の約数ならば $\langle b \rangle \subseteq \langle a \rangle$ 。

たとえば $p = 7$ のとき, $3$ は原始根 (位数 $6$), $6$ は位数 $2$ であり, $2 \mid 6$ なので

$$
\langle 6 \rangle = \lbrace 1, 6 \rbrace \subseteq \langle 3 \rangle = \lbrace 1, 3, 2, 6, 4, 5 \rbrace
$$

となる。性質 1 は, この性質を両方向に使った特別な場合とみなせる。

<details>
<summary>証明</summary>

$d = \mathrm{ord}(a)$, $e = \mathrm{ord}(b)$ とし, $e \mid d$ とする。

$b^{d} = (b^{e})^{d/e} = 1$ なので, $b$ は方程式 $x^{d} = 1$ の解である。補題 4 よりその解全体は $\langle a \rangle$ なので $b \in \langle a \rangle$ 。

$\langle a \rangle$ は掛け算で閉じている ($a^{i} \cdot a^{j} = a^{i+j}$) ので, $b$ のべき乗もすべて $\langle a \rangle$ に入る。よって $\langle b \rangle \subseteq \langle a \rangle$ 。 $\square$

</details>

## 参考文献

- https://info.atcoder.jp/entry/algorithm_lectures/primitive_root
