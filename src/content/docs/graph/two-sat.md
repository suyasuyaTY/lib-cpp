---
title: "2-SAT"
sidebar:
  order: 6
---
## 1. 概要

Yes/No で答える選択がいくつもあるとき、与えられた条件をすべて満たす選び方が存在するかを判定し、存在すれば 1 つ構成するアルゴリズム.
変数の個数を $N$、条件の個数を $M$ として $O(N+M)$ で動く.

次のような問題で使う.

- 各人をチーム A かチーム B に分ける
- 各カードの表か裏を選ぶ
- 各スイッチを ON か OFF にする

ただし、制約はどれも「**2 つの選択**についての条件」でなければならない.
例えば「A を選んだら B は選べない」「A と B の少なくとも一方を選ぶ」などである.

## 2. 前提知識

- 強連結成分分解（SCC）とトポロジカル順序
- 論理演算（否定 $\lnot$、論理和 $\lor$、論理積 $\land$、含意 $\Rightarrow$）

### 2.1 2-SAT とは

真偽値をとる変数 $x_0,\dots,x_{N-1}$ を考える.

- **リテラル**: 変数 $x_i$ またはその否定 $\lnot x_i$
- **節**: 2 つのリテラルの論理和 $a\lor b$

節をすべて論理積でつないだ次の形の式を **2-CNF** という.

$$
(a_1\lor b_1)\land(a_2\lor b_2)\land\dots\land(a_M\lor b_M)
$$

2-SAT は、この式を**真にする**変数の割り当てが存在するかを判定する問題である.
すべての節が同時に真になる割り当てを探す、と言い換えてもよい.

1 つの節に 3 つ以上のリテラルを入れてよい 3-SAT は NP 完全である.
制約を「2 つのリテラルの OR」の形にできるかどうかが、2-SAT に帰着できるかどうかの分かれ目になる.

## 3. アルゴリズム

### 3.1 含意グラフ

節 $a\lor b$ は、次の 2 つの含意と同値である.

$$
a\lor b
\iff (\lnot a\Rightarrow b)\land(\lnot b\Rightarrow a)
$$

「$a$ が偽なら $b$ は真でなければならない」「$b$ が偽なら $a$ は真でなければならない」という意味である.

そこで、各リテラルを頂点とする $2N$ 頂点の有向グラフを作る.

- 頂点: $x_0,\lnot x_0,\dots,x_{N-1},\lnot x_{N-1}$
- 辺: 各節 $a\lor b$ につき $\lnot a\to b$ と $\lnot b\to a$ の 2 本

これを**含意グラフ**という.
辺 $u\to v$ は「$u$ が真なら $v$ も真」を表し、含意は推移的なので、**$u$ から $v$ へのパスがあれば $u$ が真のとき $v$ も真**である.

辺は必ず $\lnot a\to b$ と $\lnot b\to a$ の組で張られるため、「$u\to v$ のパスがあれば $\lnot v\to\lnot u$ のパスもある」という対称性がある.

### 3.2 充足可能性の判定

> **定理**
>
> 式が充足可能 $\iff$ どの $i$ についても、$x_i$ と $\lnot x_i$ が同じ強連結成分に属さない.

$(\Rightarrow)$
$x_i$ と $\lnot x_i$ が同じ強連結成分にあると、$x_i\to\lnot x_i$ と $\lnot x_i\to x_i$ のパスが両方ある.
$x_i$ を真にすると $\lnot x_i$ も真になり、$x_i$ を偽にすると（$\lnot x_i$ が真なので）$x_i$ も真になる.
どちらでも矛盾するので、充足不能である.

$(\Leftarrow)$
次の 3.3 で、実際に条件を満たす割り当てを構成する.

### 3.3 解の構成

含意グラフを強連結成分分解し、成分をトポロジカル順序に並べる.
頂点 $v$ が属する成分の順番を $\mathrm{ord}(v)$ と書く.
辺 $u\to v$ があれば $\mathrm{ord}(u)\le\mathrm{ord}(v)$ である（同じ成分なら等号）.

各変数について、**トポロジカル順序で後ろにある方のリテラルを真にする**.

$$
x_i=
\begin{cases}
\text{true} & (\mathrm{ord}(\lnot x_i)<\mathrm{ord}(x_i))\\
\text{false} & (\mathrm{ord}(x_i)<\mathrm{ord}(\lnot x_i))
\end{cases}
$$

3.2 の条件から $\mathrm{ord}(x_i)\ne\mathrm{ord}(\lnot x_i)$ なので、必ずどちらか一方に決まる.
この規則は「真になったリテラル $\ell$ は $\mathrm{ord}(\lnot\ell)<\mathrm{ord}(\ell)$ を満たす」と言い換えられる.

**正しさの証明.**
ある節 $a\lor b$ が偽になったと仮定する.
$a,b$ がともに偽なので $\lnot a,\lnot b$ が真であり、上の言い換えから

$$
\mathrm{ord}(a)<\mathrm{ord}(\lnot a),\qquad \mathrm{ord}(b)<\mathrm{ord}(\lnot b)
$$

一方、この節から張った辺 $\lnot a\to b$, $\lnot b\to a$ により

$$
\mathrm{ord}(\lnot a)\le\mathrm{ord}(b),\qquad \mathrm{ord}(\lnot b)\le\mathrm{ord}(a)
$$

これらをつなげると

$$
\mathrm{ord}(a)<\mathrm{ord}(\lnot a)\le\mathrm{ord}(b)<\mathrm{ord}(\lnot b)\le\mathrm{ord}(a)
$$

となり矛盾する.よって、すべての節が真になる.

### 3.4 計算量

頂点数 $2N$、辺数 $2M$ のグラフの強連結成分分解なので $O(N+M)$.

## 4. 条件の言い換え

よく出る制約を 2-CNF の節に直す.
ド・モルガンの法則 $\lnot(a\land b)=\lnot a\lor\lnot b$ と、含意の言い換え $(a\Rightarrow b)=(\lnot a\lor b)$ を使う.

| 条件 | 節 |
| --- | --- |
| $a$ と $b$ の少なくとも一方を選ぶ | $a\lor b$ |
| $a$ と $b$ を同時には選ばない | $\lnot a\lor\lnot b$ |
| $a$ を選んだら $b$ も選ぶ | $\lnot a\lor b$ |
| $a$ を必ず選ぶ | $a\lor a$ |
| $a$ と $b$ のちょうど一方を選ぶ | $(a\lor b)\land(\lnot a\lor\lnot b)$ |
| $a$ と $b$ を同じにする | $(\lnot a\lor b)\land(a\lor\lnot b)$ |

$a,b$ はリテラルなので、否定が付いたものを代入してもよい.
例えば「$a$ を選ばないなら $b$ を選ぶ」は $\lnot a\Rightarrow b$ なので $a\lor b$ となる.

### 4.1 たくさんのリテラルのうち高々 1 つ

リテラル $\ell_1,\dots,\ell_k$ のうち真になるのを高々 1 つにしたいとき、全ペアに $\lnot\ell_i\lor\lnot\ell_j$ を張ると $O(k^2)$ 本の節が必要になる.

補助変数 $p_1,\dots,p_k$（$p_i$ は「$\ell_1,\dots,\ell_i$ のどれかが真」を表す）を追加すると、$O(k)$ 本で書ける.

| 含意 | 節 | 意味 |
| --- | --- | --- |
| $\ell_i\Rightarrow p_i$ | $\lnot\ell_i\lor p_i$ | $\ell_i$ が真なら $p_i$ も真 |
| $p_{i-1}\Rightarrow p_i$ | $\lnot p_{i-1}\lor p_i$ | 一度真になった $p$ は真のまま |
| $p_{i-1}\Rightarrow\lnot\ell_i$ | $\lnot p_{i-1}\lor\lnot\ell_i$ | 手前に真があれば $\ell_i$ は偽 |

1 行目は $1\le i\le k$、2・3 行目は $2\le i\le k$ について張る.

- 2 つのリテラル $\ell_i,\ell_j\ (i<j)$ が真なら、$\ell_i\Rightarrow p_i\Rightarrow\dots\Rightarrow p_{j-1}\Rightarrow\lnot\ell_j$ となり矛盾する.
- 真が高々 1 つなら、$p_i=\ell_1\lor\dots\lor\ell_i$ と置けばすべての節が満たされる.

よって、元の制約と同値である.

## 5. 問題例

- [ABC210-F Coprime Solitaire](https://atcoder.jp/contests/abc210/tasks/abc210_f)
  - カード $i$ を表にすることを $x_i$ とする.
  - 各素数 $p$ について、「見えている数が $p$ で割り切れる」ことを表すリテラル（$A_i$ が $p$ の倍数なら $x_i$、$B_i$ が $p$ の倍数なら $\lnot x_i$）を集め、真になるのを高々 1 つにする.
  - リテラルの総数が多いので、全ペアではなく 4.1 の方法で節を張る.

## 6. 参考文献

- [AtCoder Library ドキュメント: 2-SAT](https://atcoder.github.io/ac-library/production/document_ja/twosat.html)
