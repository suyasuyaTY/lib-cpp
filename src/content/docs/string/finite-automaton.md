---
title: "有限オートマトン"
sidebar:
  order: 1
---
## 1. 概要

**有限オートマトン**は有限個の状態を持ち、文字列を 1 文字ずつ読んで状態を遷移させる計算モデルである.
文字列をすべて読み終えたときの状態が受理状態かどうかで、文字列を受理するかどうかを決める.

- 有限オートマトンは、遷移先が 1 つに決まる **DFA**（決定性有限オートマトン）、複数の遷移先を同時にとれる **NFA**（非決定性有限オートマトン）、文字を読まない遷移も許す **ε-NFA** に分けられる（[3.4 節](#34-有限オートマトンの種類)）.
- NFA は **部分集合構成法** で同じ言語を受理する DFA に変換できる. ただし状態数は最悪で指数的に増える.
- DFA では各文字列に対して遷移の列がちょうど 1 通りに決まるので、DFA の状態を DP の状態にして「受理される文字列」を数え上げられる（オートマトン上の DP）.

## 2. 前提知識

文字列について次の記法を使う.

- $\Sigma$: アルファベット（文字の有限集合）.
- $\Sigma^*$: $\Sigma$ の文字からなる有限長の文字列全体. 空文字列を $\varepsilon$ と書く.
- $wc$: 文字列 $w$ の末尾に文字 $c$ を連結した文字列. $|w|$ は $w$ の長さ.
- $2^Q$: 集合 $Q$ の部分集合全体（冪集合）.

## 3. 有限オートマトン

### 3.1. 形式的な定義

有限オートマトン $M$ は 5 つ組

$$
M = (Q, \Sigma, \delta, q_0, F)
$$

で表す.

| 記号 | 意味 |
| --- | --- |
| $Q$ | 状態の有限集合 |
| $\Sigma$ | アルファベット（入力文字の有限集合） |
| $\delta$ | 状態遷移関数（[3.2 節](#32-状態遷移関数)） |
| $q_0 \in Q$ | 初期状態 |
| $F \subseteq Q$ | 受理状態の集合 |

$M$ は初期状態 $q_0$ から始めて、入力文字列を先頭から 1 文字ずつ読み、$\delta$ にしたがって状態を移す.
読み終えたときの状態が $F$ に属すれば入力を **受理** し、属さなければ **拒否** する.
$M$ が受理する文字列全体を $L(M) \subseteq \Sigma^*$ と書き、$M$ が受理する **言語** と呼ぶ.

### 3.2. 状態遷移関数

状態遷移関数 $\delta$ は、現在の状態 $q$ と読んだ文字 $c$ から次の状態を決める関数である.
DFA と NFA は $\delta$ の値域だけが異なる.

| 種類 | 状態遷移関数 | $\delta(q, c)$ の意味 |
| --- | --- | --- |
| DFA | $\delta : Q \times \Sigma \to Q$ | 次の状態（ちょうど 1 つ） |
| NFA | $\delta : Q \times \Sigma \to 2^Q$ | 次の状態の候補の集合（空集合でもよい） |

$\delta$ は $|Q| \times |\Sigma|$ の表（**状態遷移表**）で書ける. 行が状態、列が文字、セルが遷移先である.

例として、$\Sigma = \lbrace 0, 1 \rbrace$ の文字列を 2 進数として読み、値が 3 の倍数のときに受理する DFA $M_3$ を考える.
読んだ部分の値を 3 で割った余りを状態にすると、$Q = \lbrace 0, 1, 2 \rbrace$、$q_0 = 0$、$F = \lbrace 0 \rbrace$ で、

$$
\delta(q, c) = (2q + c) \bmod 3
$$

となる. $M_3$ の状態遷移表は次のとおり.

| 状態 | $0$ | $1$ |
| --- | --- | --- |
| $\to *\,0$ | $0$ | $1$ |
| $1$ | $2$ | $0$ |
| $2$ | $1$ | $2$ |

（$\to$ は初期状態、$*$ は受理状態を表す.）

### 3.3. 状態遷移図

状態を頂点、遷移を文字のラベル付きの有向辺とした有向グラフを **状態遷移図** という.
状態 $q$ から状態 $r$ への辺にラベル $c$ を付けたものが $r = \delta(q, c)$（NFA では $r \in \delta(q, c)$）を表す.

- 初期状態にはどこからも出ていない矢印を入れる.
- 受理状態は二重丸で描く.
- 同じ 2 状態間で複数の文字が遷移するときは、辺を 1 本にまとめて「$a, b$」のようにラベルを並べる.

$M_3$ の状態遷移図は次のようになる.

<svg viewBox="0 0 480 190" role="img" aria-label="2 進数で 3 の倍数を受理する DFA の状態遷移図" style="display:block;margin:1rem auto;max-width:100%;height:auto;color:var(--sl-color-white)">
  <defs>
    <marker id="fa-arrow-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="90" cy="120" r="24" />
    <circle cx="90" cy="120" r="19" />
    <circle cx="250" cy="120" r="24" />
    <circle cx="410" cy="120" r="24" />
    <path d="M28,120 L64,120" marker-end="url(#fa-arrow-1)" />
    <path d="M78,99 C60,48 120,48 102,99" marker-end="url(#fa-arrow-1)" />
    <path d="M398,99 C380,48 440,48 422,99" marker-end="url(#fa-arrow-1)" />
    <path d="M112,110 Q170,72 226,110" marker-end="url(#fa-arrow-1)" />
    <path d="M228,130 Q170,168 114,130" marker-end="url(#fa-arrow-1)" />
    <path d="M272,110 Q330,72 386,110" marker-end="url(#fa-arrow-1)" />
    <path d="M388,130 Q330,168 274,130" marker-end="url(#fa-arrow-1)" />
  </g>
  <g fill="currentColor" font-size="17" text-anchor="middle" font-family="serif">
    <text x="90" y="126">0</text>
    <text x="250" y="126">1</text>
    <text x="410" y="126">2</text>
    <text x="90" y="52">0</text>
    <text x="410" y="52">1</text>
    <text x="170" y="84">1</text>
    <text x="170" y="172">1</text>
    <text x="330" y="84">0</text>
    <text x="330" y="172">0</text>
  </g>
</svg>

### 3.4. 有限オートマトンの種類

有限オートマトンは、状態遷移関数 $\delta$ の形で次の 3 種類に分けられる.

| 種類 | 状態遷移関数 | 遷移先 | 説明 |
| --- | --- | --- | --- |
| DFA（決定性有限オートマトン） | $\delta : Q \times \Sigma \to Q$ | ちょうど 1 つ | [4 章](#4-dfa決定性有限オートマトン) |
| NFA（非決定性有限オートマトン） | $\delta : Q \times \Sigma \to 2^Q$ | 0 個以上 | [5 章](#5-nfa非決定性有限オートマトン) |
| ε-NFA | $\delta : Q \times (\Sigma \cup \lbrace \varepsilon \rbrace) \to 2^Q$ | 0 個以上. 文字を読まずに遷移してもよい | [5.3 節](#53-ε-遷移) |

DFA は NFA の特別な場合で、NFA は ε-NFA の特別な場合である.
逆に、ε-NFA と NFA は部分集合構成法で同じ言語を受理する DFA に変換できる（[6 章](#6-nfa-から-dfa-への変換部分集合構成法)）. したがって 3 種類の有限オートマトンが受理できる言語の範囲は同じで、**正規言語** と呼ばれる.

## 4. DFA（決定性有限オートマトン）

**DFA** は、状態遷移関数が

$$
\delta : Q \times \Sigma \to Q
$$

である有限オートマトンである. すべての状態 $q$ と文字 $c$ について遷移先 $\delta(q, c)$ がちょうど 1 つ定まる.

拡張遷移関数 $\hat{\delta} : Q \times \Sigma^* \to Q$ を

$$
\begin{aligned}
\hat{\delta}(q, \varepsilon) &= q \\
\hat{\delta}(q, wc) &= \delta(\hat{\delta}(q, w), c)
\end{aligned}
$$

で定めると、DFA $M$ が受理する言語は

$$
L(M) = \lbrace w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F \rbrace
$$

である. 文字列 $w$ を受理するかどうかは、$q_0$ から 1 文字ずつ遷移するだけで $O(|w|)$ 時間で判定できる.

:::note[遷移先が定義されていないとき]
一部の $(q, c)$ について遷移先を定めない（部分関数の）DFA を考えることもある. 遷移先がない時点で拒否するという意味である.
受理状態でない状態 $d$ を新たに加え、遷移先のない $(q, c)$ と $d$ 自身からの遷移をすべて $d$ に向ければ、同じ言語を受理する（全域関数の）DFA になる. $d$ を **死状態**（dead state）という.
:::

:::tip[オートマトン上の DP]
DFA では、長さ $n$ の文字列 $w$ と遷移の列 $\hat{\delta}(q_0, w_1 \cdots w_i)$（$i = 0, \dots, n$）が 1 対 1 に対応する.
そのため、$\mathrm{dp}[i][q]$ を「長さ $i$ の文字列 $w$ のうち $\hat{\delta}(q_0, w) = q$ となるものの個数」とすると、

$$
\mathrm{dp}[i + 1][\delta(q, c)] \mathrel{+}= \mathrm{dp}[i][q] \quad (q \in Q,\ c \in \Sigma)
$$

で更新でき、$\sum_{q \in F} \mathrm{dp}[n][q]$ が長さ $n$ の受理される文字列の個数になる. 計算量は $O(n |Q| |\Sigma|)$.
NFA で同じ DP をすると、1 つの文字列を複数の遷移の列で重複して数えてしまう. NFA の状態で数えたいときは、先に DFA に変換する（6 章）.
:::

## 5. NFA（非決定性有限オートマトン）

### 5.1. 定義

**NFA** は、状態遷移関数が

$$
\delta : Q \times \Sigma \to 2^Q
$$

である有限オートマトンである. $\delta(q, c)$ は、状態 $q$ で文字 $c$ を読んだときに移れる状態の集合で、空集合や 2 個以上の状態からなる集合でもよい.

NFA は「移れる状態のどれかを選んで進む」と考える. ある選び方で入力を読み終えたときに受理状態にいれば、入力を受理する.
同じことを、移れる状態の集合を同時に追跡すると考えて定式化する. 拡張遷移関数 $\hat{\delta} : Q \times \Sigma^* \to 2^Q$ を

$$
\begin{aligned}
\hat{\delta}(q, \varepsilon) &= \lbrace q \rbrace \\
\hat{\delta}(q, wc) &= \bigcup_{p \in \hat{\delta}(q, w)} \delta(p, c)
\end{aligned}
$$

で定めると、NFA $N$ が受理する言語は

$$
L(N) = \lbrace w \in \Sigma^* \mid \hat{\delta}(q_0, w) \cap F \neq \emptyset \rbrace
$$

である. DFA は $\delta(q, c)$ がつねに 1 元集合である NFA とみなせる.

### 5.2. 例

$\Sigma = \lbrace a, b \rbrace$ の文字列のうち、**後ろから 2 文字目が $a$** であるものを受理する NFA $N_2$ を考える.
$Q = \lbrace 0, 1, 2 \rbrace$、$q_0 = 0$、$F = \lbrace 2 \rbrace$ とし、遷移を次のように定める.

| 状態 | $a$ | $b$ |
| --- | --- | --- |
| $\to 0$ | $\lbrace 0, 1 \rbrace$ | $\lbrace 0 \rbrace$ |
| $1$ | $\lbrace 2 \rbrace$ | $\lbrace 2 \rbrace$ |
| $*\,2$ | $\emptyset$ | $\emptyset$ |

<svg viewBox="0 0 480 150" role="img" aria-label="後ろから 2 文字目が a の文字列を受理する NFA の状態遷移図" style="display:block;margin:1rem auto;max-width:100%;height:auto;color:var(--sl-color-white)">
  <defs>
    <marker id="fa-arrow-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="90" cy="100" r="24" />
    <circle cx="250" cy="100" r="24" />
    <circle cx="410" cy="100" r="24" />
    <circle cx="410" cy="100" r="19" />
    <path d="M28,100 L64,100" marker-end="url(#fa-arrow-2)" />
    <path d="M78,79 C60,28 120,28 102,79" marker-end="url(#fa-arrow-2)" />
    <path d="M114,100 L224,100" marker-end="url(#fa-arrow-2)" />
    <path d="M274,100 L384,100" marker-end="url(#fa-arrow-2)" />
  </g>
  <g fill="currentColor" font-size="17" text-anchor="middle" font-family="serif">
    <text x="90" y="106">0</text>
    <text x="250" y="106">1</text>
    <text x="410" y="106">2</text>
    <text x="90" y="32" font-style="italic">a, b</text>
    <text x="170" y="90" font-style="italic">a</text>
    <text x="330" y="90" font-style="italic">a, b</text>
  </g>
</svg>

状態 $0$ で $a$ を読んだとき、$N_2$ は「読んだ $a$ が後ろから 2 文字目である」と推測して状態 $1$ に進むか、推測せずに状態 $0$ にとどまるかを選べる.
推測が正しい選び方が 1 つでもあれば受理する. 例えば $w = abab$ では $\hat{\delta}(0, w) = \lbrace 0, 2 \rbrace$ となり、$2 \in F$ なので受理する.

同様に、後ろから $k$ 文字目が $a$ の文字列は状態数 $k + 1$ の NFA $N_k$ で受理できる.

### 5.3. ε 遷移

文字を読まずに状態を移る **ε 遷移** を許した NFA（ε-NFA）を考えることもある. 状態遷移関数は $\delta : Q \times (\Sigma \cup \lbrace \varepsilon \rbrace) \to 2^Q$ となる.
状態集合 $S$ から ε 遷移だけを 0 回以上たどって到達できる状態全体を $S$ の **ε 閉包** $E(S)$ と書くと、ε-NFA の拡張遷移関数は

$$
\begin{aligned}
\hat{\delta}(q, \varepsilon) &= E(\lbrace q \rbrace) \\
\hat{\delta}(q, wc) &= E\left( \bigcup_{p \in \hat{\delta}(q, w)} \delta(p, c) \right)
\end{aligned}
$$

となる. 正規表現から NFA を組み立てるとき（Thompson の構成）に ε 遷移を使うと、連結・選択・繰り返しをそれぞれ ε 遷移でつなぐだけで書ける.

## 6. NFA から DFA への変換（部分集合構成法）

### 6.1. 構成

NFA の拡張遷移関数 $\hat{\delta}(q_0, w)$ は状態の **集合** だった. そこで、NFA の状態集合を 1 つの状態とみなせば DFA になる.

NFA $N = (Q, \Sigma, \delta, q_0, F)$ に対し、DFA $D = (Q', \Sigma, \delta', q_0', F')$ を次のように定める.

$$
\begin{aligned}
Q' &= 2^Q \\
\delta'(S, c) &= \bigcup_{p \in S} \delta(p, c) \\
q_0' &= \lbrace q_0 \rbrace \\
F' &= \lbrace S \in Q' \mid S \cap F \neq \emptyset \rbrace
\end{aligned}
$$

:::note[定理（Rabin–Scott）]
$L(D) = L(N)$.
:::

<details>
<summary>証明</summary>

DFA $D$ の拡張遷移関数を $\hat{\delta}'$ と書く. すべての $w \in \Sigma^*$ について $\hat{\delta}'(q_0', w) = \hat{\delta}(q_0, w)$ が成り立つことを $|w|$ に関する帰納法で示す.

- $w = \varepsilon$ のとき、$\hat{\delta}'(q_0', \varepsilon) = q_0' = \lbrace q_0 \rbrace = \hat{\delta}(q_0, \varepsilon)$.
- $w = vc$ で $\hat{\delta}'(q_0', v) = \hat{\delta}(q_0, v)$ が成り立つとき、

$$
\hat{\delta}'(q_0', vc) = \delta'(\hat{\delta}'(q_0', v), c) = \bigcup_{p \in \hat{\delta}(q_0, v)} \delta(p, c) = \hat{\delta}(q_0, vc).
$$

したがって

$$
w \in L(D) \iff \hat{\delta}'(q_0', w) \in F' \iff \hat{\delta}(q_0, w) \cap F \neq \emptyset \iff w \in L(N). \quad \square
$$

</details>

ε-NFA のときは、$q_0' = E(\lbrace q_0 \rbrace)$、$\delta'(S, c) = E\left(\bigcup_{p \in S} \delta(p, c)\right)$ とすれば同様に成り立つ.

### 6.2. すべての部分集合を作る

$n = |Q|$ とし、$Q = \lbrace 0, 1, \dots, n - 1 \rbrace$ の部分集合を $n$ ビットの整数で表す（状態 $p$ を含むとき $p$ ビット目が $1$）.
$Q' = 2^Q$ のすべての状態 $S$（$0 \le S < 2^n$）について $\delta'(S, c)$ を求める.

$\delta'(S, c)$ を定義どおりに $S$ の各要素 $p$ について和集合をとって求めると、1 つの $S$ あたり $O(n)$ かかる.
そこで、空でない $S$ の最上位ビットを $p = \max S$ とし、$S$ から $p$ を除いた集合 $R = S \setminus \lbrace p \rbrace$ を使う. $\delta'$ は和集合で定義されているので、

$$
\delta'(S, c) = \delta'(R, c) \cup \delta(p, c)
$$

が成り立つ. $R < S$ なので、$S$ を小さい順に処理すれば、$S$ を処理する時点で $\delta'(R, c)$ は求まっている.
ビット表現では、$\delta'(S, c)$ は「DFA の遷移先 $\delta'(R, c)$」と「NFA の遷移先 $\delta(p, c)$」の bitwise OR になる.

```
next[0][c] = 0                                   // 空集合からは空集合へ
next[S][c] = next[S ^ (1 << p)][c] | step[p][c]   // p = S の最上位ビット
```

$\mathrm{step}[p][c]$ は $\delta(p, c)$ のビット表現である. 受理状態かどうかも、$S \cap F \neq \emptyset$ かどうかを $S$ と $F$ のビット表現の bitwise AND で判定できる.

1 つの $(S, c)$ あたり $O(1)$ なので、全体で $O(2^n |\Sigma|)$ 時間・空間である. $n$ が 20 程度までなら使える.

ε-NFA のときは、$\mathrm{step}[p][c]$ を $E(\delta(p, c))$ のビット表現にし、初期状態を $E(\lbrace q_0 \rbrace)$ とすればよい.

### 6.3. 到達可能な部分集合だけを作る

6.2 節の方法では、初期状態 $q_0'$ から到達できない部分集合も状態として作る.
$q_0'$ から到達できる部分集合だけを作れば、受理する言語は変わらず、状態数を減らせる.
$q_0'$ から BFS（または DFS）で $\delta'$ をたどり、新しく現れた部分集合に番号を振っていく.

部分集合を 6.2 節と同じくビットで表すと、$\delta'(S, c)$ は $S$ に含まれる $p$ について $\mathrm{step}[p][c]$ の bitwise OR をとれば求まる.
作られる DFA の状態数を $|Q'|$ とすると、全体で $O(|Q'|\,|\Sigma|\,n)$ 時間である（部分集合の検索をハッシュで $O(1)$ とみなす）.
$n$ が大きくても到達できる部分集合が少なければ使え、64 ビット整数で表せる $n \le 64$ まで扱える.

5.2 節の NFA $N_2$ を変換すると、到達できる部分集合は次の 4 つになる.

| 状態 | $a$ | $b$ |
| --- | --- | --- |
| $\to \lbrace 0 \rbrace$ | $\lbrace 0, 1 \rbrace$ | $\lbrace 0 \rbrace$ |
| $\lbrace 0, 1 \rbrace$ | $\lbrace 0, 1, 2 \rbrace$ | $\lbrace 0, 2 \rbrace$ |
| $*\,\lbrace 0, 1, 2 \rbrace$ | $\lbrace 0, 1, 2 \rbrace$ | $\lbrace 0, 2 \rbrace$ |
| $*\,\lbrace 0, 2 \rbrace$ | $\lbrace 0, 1 \rbrace$ | $\lbrace 0 \rbrace$ |

DFA の各状態は、読み終えた部分の末尾 2 文字で決まる. $\lbrace 0, 1 \rbrace$ は末尾 $ba$（または $a$ 1 文字）、$\lbrace 0, 1, 2 \rbrace$ は末尾 $aa$、$\lbrace 0, 2 \rbrace$ は末尾 $ab$、$\lbrace 0 \rbrace$ は末尾 $bb$（または $a$ を含まない長さ 1 以下の文字列）に対応する.

## 7. 参考資料

- [M. O. Rabin, D. Scott, *Finite Automata and Their Decision Problems*, IBM Journal of Research and Development 3(2), 1959](https://doi.org/10.1147/rd.32.0114)（NFA の導入と部分集合構成法の原論文）
- [J. E. Hopcroft, R. Motwani, J. D. Ullman, *Introduction to Automata Theory, Languages, and Computation*, 3rd ed., Pearson, 2006](https://www.pearson.com/en-us/subject-catalog/p/introduction-to-automata-theory-languages-and-computation/P200000003517)（5 つ組による定義、拡張遷移関数、部分集合構成法と状態数の下界の例）
- [M. Sipser, *Introduction to the Theory of Computation*, 3rd ed., Cengage, 2012](https://math.mit.edu/~sipser/book.html)（DFA・NFA・ε 遷移の定義と NFA から DFA への変換）
- [Powerset construction - Wikipedia](https://en.wikipedia.org/wiki/Powerset_construction)（到達可能な部分集合だけを作る構成と状態数の指数的増加の例）

## 8. コード

文字は $0$ 以上 $\sigma$ 未満の整数で表す（`'a'` 始まりの文字列なら `c - 'a'` に変換して渡す）.

### 8.1. DFA（4 章）

- `dfa d(sigma)`: 文字の種類数 `sigma` の空の DFA を作る.
- `add_state(is_accept)`: 状態を追加して番号を返す. 遷移先は $-1$（未設定）で初期化される.
- `set_next(q, c, r)`: $\delta(q, c) = r$ とする.
- `start`: 初期状態（既定は $0$）. `next[q][c]`: 遷移先. `accept[q]`: 受理状態か.
- `run(w)`: $\hat{\delta}(q_0, w)$ を返す. `accepts(w)`: $w \in L(M)$ か. どちらも $O(|w|)$.

```cpp title="dfa.cpp"
struct dfa {
  int sigma;                 // 文字の種類数. 文字は 0 以上 sigma 未満の整数
  int start = 0;             // 初期状態
  vector<vector<int>> next;  // next[q][c]: 状態 q で文字 c を読んだときの遷移先
  vector<bool> accept;       // accept[q]: q が受理状態か

  explicit dfa(int sigma) : sigma(sigma) {}

  // 状態を追加して番号を返す. 遷移先は -1（未設定）で初期化する
  int add_state(bool is_accept = false) {
    next.emplace_back(sigma, -1);
    accept.push_back(is_accept);
    return (int)next.size() - 1;
  }

  // δ(q, c) = r とする
  void set_next(int q, int c, int r) {
    next[q][c] = r;
  }

  // 状態数
  int size() const {
    return (int)next.size();
  }

  // 初期状態から文字列 w を読んだ後の状態 δ^(q0, w) を返す. O(|w|)
  int run(const vector<int>& w) const {
    int q = start;
    for (int c : w) {
      q = next[q][c];
      assert(q != -1);
    }
    return q;
  }

  // w を受理するか. O(|w|)
  bool accepts(const vector<int>& w) const {
    return accept[run(w)];
  }
};
```

使用例（3.2 節の $M_3$）:

```cpp
dfa m(2);
for (int q = 0; q < 3; q++) m.add_state(q == 0);
for (int q = 0; q < 3; q++)
  for (int c = 0; c < 2; c++) m.set_next(q, c, (2 * q + c) % 3);
m.accepts({1, 1, 0});  // 6 = 110_(2) なので true
```

### 8.2. NFA と部分集合構成法（5 章・6 章）

8.1 節の `dfa` を使う.

- `nfa N(n, sigma)`: 状態数 `n`（$64$ 以下）、文字の種類数 `sigma` の NFA を作る. 遷移はない状態で始まる.
- `add_edge(q, c, r)`: $r$ を $\delta(q, c)$ に加える.
- `add_epsilon(q, r)`: $q$ から $r$ への ε 遷移を加える.
- `set_accept(q)`: $q$ を受理状態にする. `start`: 初期状態（既定は $0$）.
- `to_dfa_all()`: 6.2 節の方法で、$2^n$ 個の部分集合すべてを状態とする DFA を返す. DFA の状態 $S$ は NFA の状態集合 $S$（ビット集合）を表し、DFA の初期状態は `start` の ε 閉包になる. $O(2^n \sigma)$ 時間・空間. $n \le 25$.
- `to_dfa()`: 6.3 節の方法で、到達できる部分集合だけを状態とする DFA に変換し、`{DFA, subsets}` を返す. DFA の状態 $k$ は NFA の状態集合 `subsets[k]`（ビット集合）に対応し、DFA の初期状態は $0$ 番になる. 空集合に到達するときは、空集合も死状態として含まれる. $O(|Q'|\,\sigma\,n)$.

```cpp title="nfa.cpp"
using ull = unsigned long long;

struct nfa {
  int n, sigma;                    // 状態数（64 以下）, 文字の種類数
  int start = 0;                   // 初期状態
  vector<vector<vector<int>>> to;  // to[q][c]: δ(q, c) の要素
  vector<vector<int>> eps;         // eps[q]: q から ε 遷移で移れる状態
  vector<bool> accept;             // accept[q]: q が受理状態か

  nfa(int n, int sigma)
      : n(n), sigma(sigma), to(n, vector<vector<int>>(sigma)), eps(n), accept(n, false) {
    assert(n <= 64);
  }

  // r を δ(q, c) に加える
  void add_edge(int q, int c, int r) {
    to[q][c].push_back(r);
  }

  // q から r への ε 遷移を加える
  void add_epsilon(int q, int r) {
    eps[q].push_back(r);
  }

  void set_accept(int q, bool is_accept = true) {
    accept[q] = is_accept;
  }

  // 部分集合構成法で、2^n 個の部分集合すべてを状態とする DFA を作る（6.2 節）
  // DFA の状態 S（0 <= S < 2^n）は NFA の状態集合 S（bit 集合）に対応する
  // O(2^n σ) 時間・空間. n は 20 程度まで
  dfa to_dfa_all() {
    assert(n <= 25);
    prepare();
    int full = 1 << n;

    dfa d(sigma);
    d.next.assign(full, vector<int>(sigma, 0));  // 空集合からの遷移先は空集合
    d.accept.assign(full, false);

    for (int S = 1; S < full; S++) {
      int p = __lg(S);         // S の最上位ビット
      int R = S ^ (1 << p);    // S から p を除いた集合. R < S なので計算済み
      for (int c = 0; c < sigma; c++) {
        // δ'(S, c) = δ'(R, c) ∪ δ(p, c)
        d.next[S][c] = d.next[R][c] | (int)step[p][c];
      }
      d.accept[S] = (S & accept_mask) != 0;
    }
    d.start = (int)cl[start];
    return d;
  }

  // 部分集合構成法で DFA に変換する. 初期状態から到達できる部分集合だけを作る（6.3 節）
  // 返り値: {DFA, subsets}. DFA の状態 k は NFA の状態集合 subsets[k]（bit 集合）に対応する
  // 空集合に到達するときは、空集合も（受理しない）状態として含まれる
  // O(|Q'| σ n)（|Q'|: DFA の状態数）
  pair<dfa, vector<ull>> to_dfa() {
    prepare();

    dfa d(sigma);
    vector<ull> subsets;
    unordered_map<ull, int> id;

    // 部分集合 S に対応する DFA の状態番号を返す（なければ作る）
    auto get_id = [&](ull S) -> int {
      auto it = id.find(S);
      if (it != id.end()) {
        return it->second;
      }
      int k = d.add_state((S & accept_mask) != 0);
      id[S] = k;
      subsets.push_back(S);
      return k;
    };

    d.start = get_id(cl[start]);

    // subsets は作った順（BFS 順）に並ぶので、末尾まで順に処理する
    for (int k = 0; k < d.size(); k++) {
      ull S = subsets[k];
      for (int c = 0; c < sigma; c++) {
        ull T = 0;
        for (ull x = S; x; x &= x - 1) {
          T |= step[__builtin_ctzll(x)][c];
        }
        int t = get_id(T);
        d.set_next(k, c, t);
      }
    }
    return {d, subsets};
  }

 private:
  vector<ull> cl;            // cl[q]: q の ε 閉包
  vector<vector<ull>> step;  // step[q][c]: δ(q, c) の各要素の ε 閉包の和集合
  ull accept_mask = 0;       // 受理状態の集合

  // cl, step, accept_mask を求める. O(n (n + ε 遷移の数) + n σ + 遷移の数)
  void prepare() {
    cl.assign(n, 0);
    for (int s = 0; s < n; s++) {
      ull vis = 1ULL << s;
      vector<int> st = {s};
      while (!st.empty()) {
        int q = st.back();
        st.pop_back();
        for (int r : eps[q]) {
          if (!(vis >> r & 1)) {
            vis |= 1ULL << r;
            st.push_back(r);
          }
        }
      }
      cl[s] = vis;
    }

    step.assign(n, vector<ull>(sigma, 0));
    accept_mask = 0;
    for (int q = 0; q < n; q++) {
      for (int c = 0; c < sigma; c++) {
        for (int r : to[q][c]) {
          step[q][c] |= cl[r];
        }
      }
      if (accept[q]) {
        accept_mask |= 1ULL << q;
      }
    }
  }
};
```

使用例（5.2 節の $N_2$. $a = 0$、$b = 1$）:

```cpp
nfa N(3, 2);
N.add_edge(0, 0, 0), N.add_edge(0, 1, 0), N.add_edge(0, 0, 1);
N.add_edge(1, 0, 2), N.add_edge(1, 1, 2);
N.set_accept(2);
auto [d, subsets] = N.to_dfa();  // d.size() == 4
d.accepts({0, 1, 0, 1});         // abab なので true

dfa e = N.to_dfa_all();          // e.size() == 8, e.start == 1（{0} を表す）
e.accepts({0, 1, 0, 1});         // true
```
