---
title: "確率と期待値"
tags: [probability]
sidebar:
  order: 16
---
## 1. 概要

離散的な確率変数について、同時分布・周辺分布・条件付き分布・独立性・期待値の定義と関係をまとめる.
最後に、期待値 DP の土台になる**全期待値の法則**を扱う.

| 概念 | 数式 | 意味 |
| --- | --- | --- |
| 同時分布 | $P(X = x, Y = y)$ | 2 つの値が同時に起こる確率 |
| 周辺分布 | $P(X = x) = \sum_y P(X = x, Y = y)$ | 一方だけに注目する |
| 条件付き分布 | $P(Y = y \mid X = x)$ | 一方の値が分かった後の分布 |
| 独立性 | $P(X = x, Y = y) = P(X = x) P(Y = y)$ | 相手の情報で確率が変わらない |
| 期待値 | $\mathbb{E}[X] = \sum_x x P(X = x)$ | 確率で重み付けした平均 |
| 全期待値の法則 | $\mathbb{E}[X] = \sum_y P(Y = y) \mathbb{E}[X \mid Y = y]$ | 場合分けして期待値を求める |

## 2. 前提知識

- **確率変数**: 試行の結果に応じて値が決まる変数. ここでは取りうる値が有限個（または可算個）の離散的なものだけを考える.
- 確率は $0 \le P(\cdot) \le 1$ で、起こりうる値すべてについての和は $1$ になる.

## 3. 確率分布

### 3.1. 同時分布

2 つの確率変数 $X, Y$ について、$X = x$ と $Y = y$ が**同時に**起こる確率

$$
P(X = x, Y = y)
$$

を $(x, y)$ の関数とみたものを $X, Y$ の同時分布という.
$x$ を行、$y$ を列にした表だと考えるとよい. 表の全マスの和は $1$ である.

### 3.2. 周辺分布

同時分布から一方の変数だけの分布を取り出したものを周辺分布という.
$Y$ のとりうる値すべてについて足し合わせる（表の行和をとる）と、$X$ の分布が得られる.

$$
P(X = x) = \sum_y P(X = x, Y = y)
$$

$Y = y$ の場合たちは互いに重ならず、すべて合わせると全体になるので、確率を足してよい.

### 3.3. 条件付き分布

$P(X = x) > 0$ のとき、$X = x$ と分かったもとでの $Y$ の分布を

$$
P(Y = y \mid X = x) = \frac{P(X = x, Y = y)}{P(X = x)}
$$

で定める. 表の $x$ の行だけを取り出し、行和が $1$ になるように割り直したものである.
分母を払うと、**乗法定理**

$$
P(X = x, Y = y) = P(X = x) \, P(Y = y \mid X = x)
$$

が得られる. 「まず $X$ が決まり、次に $X$ に応じて $Y$ が決まる」という 2 段階の試行の確率は、各段階の確率の積になる.

これを周辺分布の式に代入すると、**全確率の法則**

$$
P(Y = y) = \sum_x P(X = x) \, P(Y = y \mid X = x)
$$

が得られる.

### 3.4. 独立性

すべての $x, y$ について

$$
P(X = x, Y = y) = P(X = x) \, P(Y = y)
$$

が成り立つとき、$X$ と $Y$ は**独立**であるという.
$P(X = x) > 0$ なら、これは $P(Y = y \mid X = x) = P(Y = y)$ と同じであり、$X$ の値を知っても $Y$ の分布が変わらないことを表す.

## 4. 期待値

### 4.1. 定義

$X$ の期待値は、値を確率で重み付けした平均

$$
\mathbb{E}[X] = \sum_x x \, P(X = x)
$$

である. 関数 $g$ について、$g(X)$ の期待値は $\mathbb{E}[g(X)] = \sum_x g(x) \, P(X = x)$ で求まる（$g(X)$ の分布を求め直さなくてよい）.

### 4.2. 期待値の線形性

任意の確率変数 $X, Y$ と定数 $a, b$ について

$$
\mathbb{E}[aX + bY] = a \, \mathbb{E}[X] + b \, \mathbb{E}[Y]
$$

が成り立つ. **$X$ と $Y$ が独立でなくても成り立つ**のが重要である.

証明は、同時分布で書いて周辺化するだけである.

$$
\begin{aligned}
\mathbb{E}[X + Y]
&= \sum_{x, y} (x + y) P(X = x, Y = y) \\
&= \sum_x x \sum_y P(X = x, Y = y) + \sum_y y \sum_x P(X = x, Y = y) \\
&= \sum_x x \, P(X = x) + \sum_y y \, P(Y = y) \\
&= \mathbb{E}[X] + \mathbb{E}[Y]
\end{aligned}
$$

:::tip[指示変数で分解する]
「条件を満たすものの個数」の期待値は、各対象 $i$ について条件を満たせば $1$、満たさなければ $0$ をとる変数 $I_i$ を使って

$$
\mathbb{E}\left[\sum_i I_i\right] = \sum_i \mathbb{E}[I_i] = \sum_i P(\text{$i$ が条件を満たす})
$$

と、各対象の確率の和に直せる.
例えば一様ランダムな順列 $\sigma$ の不動点（$\sigma(i) = i$）の個数の期待値は、各 $i$ で $P(\sigma(i) = i) = 1/N$ なので $N \cdot 1/N = 1$ である.
:::

### 4.3. 独立なときの積

$X$ と $Y$ が独立なら

$$
\mathbb{E}[XY] = \mathbb{E}[X] \, \mathbb{E}[Y]
$$

が成り立つ. 同時分布が積に分かれるので、和も積に分かれる.

$$
\begin{aligned}
\mathbb{E}[XY]
&= \sum_{x, y} xy \, P(X = x) P(Y = y) \\
&= \left(\sum_x x P(X = x)\right) \left(\sum_y y P(Y = y)\right) \\
&= \mathbb{E}[X] \, \mathbb{E}[Y]
\end{aligned}
$$

線形性と違い、独立でないと一般には成り立たない（例: $X = Y$ が $\pm 1$ を等確率でとるとき、$\mathbb{E}[XY] = 1$ だが $\mathbb{E}[X]\mathbb{E}[Y] = 0$）.

## 5. 全期待値の法則

### 5.1. 条件付き期待値

$Y = y$ と分かったもとでの $X$ の期待値を、条件付き分布で重み付けした平均

$$
\mathbb{E}[X \mid Y = y] = \sum_x x \, P(X = x \mid Y = y)
$$

で定める.

### 5.2. 全期待値の法則

:::note[全期待値の法則（Law of Total Expectation）]
$$
\mathbb{E}[X] = \sum_y P(Y = y) \, \mathbb{E}[X \mid Y = y]
$$
:::

$Y$ の値で場合分けし、各場合の期待値を、その場合が起こる確率で重み付けして足せば、全体の期待値になる.
全確率の法則の「確率」を「期待値」に置き換えたものである.

**証明**: 条件付き期待値の定義と乗法定理を使い、和の順番を入れ替えて周辺化する.

$$
\begin{aligned}
\sum_y P(Y = y) \, \mathbb{E}[X \mid Y = y]
&= \sum_y \sum_x x \, P(Y = y) P(X = x \mid Y = y) \\
&= \sum_x x \sum_y P(X = x, Y = y) \\
&= \sum_x x \, P(X = x) \\
&= \mathbb{E}[X]
\end{aligned}
$$

### 5.3. 例: 成功するまでの回数

成功確率 $p$（$0 < p \le 1$）の試行を、成功するまで繰り返す. 試行回数 $T$ の期待値を求める.

1 回目の結果 $Y$ で場合分けする.

- 成功（確率 $p$）: その時点で終わるので、$\mathbb{E}[T \mid \text{成功}] = 1$.
- 失敗（確率 $1 - p$）: 1 回使って、最初と同じ状況に戻るので、$\mathbb{E}[T \mid \text{失敗}] = 1 + \mathbb{E}[T]$.

全期待値の法則より

$$
\mathbb{E}[T] = p \cdot 1 + (1 - p)(1 + \mathbb{E}[T])
$$

となり、これを解くと $\mathbb{E}[T] = 1/p$ である.

このように「最初の 1 手で場合分けし、残りの期待値を状態の期待値として書く」のが**期待値 DP** の基本形である.
状態 $s$ からゴールまでの期待値を $E_s$ とすると、遷移先 $t$ への確率 $P(t \mid s)$ と遷移のコスト $c$ を使って

$$
E_s = \sum_t P(t \mid s) \, (c + E_t)
$$

と書ける. 上の例のように自分自身へ戻る遷移があるときは、$E_s$ を含む項を左辺に移して解く.

## 6. 参考資料

- [Marginal distribution - Wikipedia](https://en.wikipedia.org/wiki/Marginal_distribution)（同時分布・周辺分布・条件付き分布の関係）
- [Law of total probability - Wikipedia](https://en.wikipedia.org/wiki/Law_of_total_probability)（全確率の法則）
- [Expected value - Wikipedia](https://en.wikipedia.org/wiki/Expected_value)（期待値の定義、線形性、独立なときの積）
- [条件付き期待値 - Wikipedia](https://ja.wikipedia.org/wiki/%E6%9D%A1%E4%BB%B6%E4%BB%98%E3%81%8D%E6%9C%9F%E5%BE%85%E5%80%A4)（条件付き期待値の定義）
- [Law of total expectation - Wikipedia](https://en.wikipedia.org/wiki/Law_of_total_expectation)（全期待値の法則とその証明）
