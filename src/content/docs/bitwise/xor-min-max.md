---
title: "XOR の最小化・最大化"
tags: [xor]
sidebar:
  order: 1
---
## 1. 概要

XOR に関する最小値・最大値を求める問題の考え方をまとめる. $\oplus$ は bit ごとの XOR を表す.

XOR 自体は bit ごとに計算できるが、最適化では「各 bit の選択を独立に決められるか」が重要になる.
目的関数と選べる値の制約に応じて、**上位 bit からの貪欲法**、**binary trie**、**bit での分割統治**、**bit ごとの寄与**、**XOR 基底**を使い分ける.

| やりたいこと | 方法 | 計算量 |
| --- | --- | --- |
| $\min_i (x \oplus A_i)$、$\max_i (x \oplus A_i)$ | binary trie | 1 回 $O(B)$ |
| $\lbrace x \oplus A_i \rbrace$ の $k$ 番目に小さい値 | binary trie | 1 回 $O(B)$ |
| 多くの $x$ についての集計（最小値の総和など） | trie 上の分割統治 | $O(NB)$ など |
| $\sum_i (x \oplus A_i)$ の最小化・最大化 | bit ごとの寄与 | $O(NB)$ |
| $A$ の部分集合の XOR の最大値・最小値 | XOR 基底 | 構築 $O(NB)$、1 回 $O(B)$ |

ここで $B$ は値の bit 数（$0 \le A_i < 2^B$）である.

binary trie の操作ごとの計算量は次の通り.

| 操作 | 計算量 |
| --- | --- |
| 追加・削除（`insert` / `erase`） | $O(B)$ |
| 個数（`count`） | $O(B)$ |
| XOR の最小値・最大値（`min_xor` / `max_xor`） | $O(B)$ |
| XOR した値の $k$ 番目（`kth_xor`） | $O(B)$ |
| XOR した値が $y$ 未満の個数（`count_less_xor`） | $O(B)$ |

## 2. 前提知識

- 非負整数の 2 進表記.
- [掃き出し法](../../linear-algebra/gaussian-elimination/)（XOR 基底は $\mathbb{F}_2$ 上の掃き出し法である. $\mathbb{F}_2$ のベクトルを多倍長で扱う `noshi_basis.cpp` は [掃き出し法 4 章](../../linear-algebra/gaussian-elimination/) にある）.

## 3. 基本的な考え方

### 3.1. 上位 bit から決める

<a id="claim-3-1"></a>

:::note[主張 3.1]
非負整数 $u \ne v$ の大小は、上位から見て初めて異なる bit で決まる.
:::

**証明**: 初めて異なる bit を $b$ とし、$u$ の bit $b$ が $1$、$v$ の bit $b$ が $0$ とする. bit $b$ より上は等しく、bit $b$ より下の差は高々 $2^b - 1$ なので、

$$
u - v \ge 2^b - (2^b - 1) = 1 > 0
$$

である. $\square$

したがって XOR の値そのものを最小化・最大化するときは、上位 bit を優先して決めてよい.

- 最小化では、XOR のその bit を $0$ にできるか考える.
- 最大化では、XOR のその bit を $1$ にできるか考える.
- それまでに決めた上位 bit と、問題の制約を満たす候補が残るかを確認する.

### 3.2. 候補集合から選ぶ: binary trie

固定した $x$ に対して $\min_i (x \oplus A_i)$ や $\max_i (x \oplus A_i)$ を求めるときは、候補を上位 bit から絞り込む.

- 最小値: $x$ と同じ bit を持つ候補があれば、その側へ進む（XOR のその bit が $0$）.
- 最大値: $x$ と異なる bit を持つ候補があれば、その側へ進む（XOR のその bit が $1$）.
- 優先する側が空なら、もう一方へ進む.

[主張 3.1](#claim-3-1) より、この貪欲法で最適値が得られる.

候補集合は **binary trie**（二分トライ木）で管理する. 各値を上位 bit から $B$ 文字の $0/1$ 列とみなしてトライ木に入れ、各ノードに「その部分木に含まれる値の個数」を持たせる.
深さ $d$ のノードは「上位 $d$ bit がある値に固定された候補の集合」を表す.
1 つの値の追加・削除は根から葉までの $B$ 個のノードの個数を $\pm 1$ するだけなので $O(B)$、探索も $O(B)$ である.

部分木の個数を持っているので、順序統計も扱える.

- **$k$ 番目**: $\lbrace x \oplus A_i \rbrace$ を昇順に並べたときの $k$ 番目は、各ノードで「XOR の bit が $0$ になる側」（$x$ と同じ bit の子）の個数 $c$ と $k$ を比べ、$k < c$ ならその子へ、そうでなければ $k \leftarrow k - c$ として反対の子へ進めばよい. 最小値は $k = 0$、最大値は $k = N - 1$ の場合である.
- **$y$ 未満の個数**: $x \oplus A_i < y$ となる $i$ の個数は、$y$ の bit が $1$ の位置で「XOR の bit が $0$ になる側」の部分木を丸ごと数え、XOR の bit が $y$ と一致する側へ進めばよい.

### 3.3. 多くの値をまとめて扱う: bit で分割

候補集合や $x$ の範囲を、上位 bit が $0$ の側と $1$ の側に分ける. その bit の寄与を確定させ、下位 bit について再帰的に処理する.
binary trie のノードは「上位 bit が固定された候補の集合」なので、trie の上で再帰すると自然に書ける.

再帰の各段では、ノード $v$（候補の集合）の子の有無で場合分けする.

- 子が両方ある: 上位 bit の選び方によって行き先が分かれる. 両方の結果を求めて組み合わせる（$\min$ をとる、足すなど）.
- 子が片方しかない: どの選び方でも同じ子へ進むので、その bit の寄与は場合分けなしに決まる.

区間 $[0, M)$ の各 $x$ に対する最小値の総和を求めるときなどは、上位 bit が同じ $x$ をまとめて、同じ分岐を通るものを一度に数えることで、全列挙を避けられる.
trie の各ノードを $O(1)$ 回しか訪れないように書けば、全体で $O(NB)$ である.

### 3.4. XOR の和を最適化する: bit ごとの寄与

$\sum_i (x \oplus A_i)$ を最小化・最大化する場合は、各 bit が和に与える寄与を考える. $A_i$ の $b$ bit 目が $1$ である個数を $c_b$ とすると、その bit の寄与は次の通り.

- $x$ の $b$ bit 目を $0$ にする: $c_b 2^b$
- $x$ の $b$ bit 目を $1$ にする: $(N - c_b) 2^b$

$x$ の各 bit を自由に選べるなら、寄与を比較して独立に決められる.
$x \le K$ などの制約がある場合は、上限との大小関係を状態に持つ桁 DP などで、選択の整合性を保つ.

### 3.5. 部分集合の XOR: XOR 基底

$A$ の部分集合の XOR として作れる値の集合は、$A_1, \dots, A_N$ を $\mathbb{F}_2^B$ のベクトルとみなしたときの張る空間 $V$ である.
$V$ の基底を**最上位 bit（ピボット）が相異なる**形で持つ（掃き出し法の階段形）と、最大値・最小値を貪欲に求められる.

基底の構築は、新しい値 $x$ を既存の基底で掃き出して、$0$ にならなければ基底に加えるだけである.
基底ベクトル $b$ について「$x$ に $b$ のピボットが立っていれば $x \leftarrow x \oplus b$」は、$\min(x, x \oplus b)$ と書ける（[掃き出し法 4.2 節](../../linear-algebra/gaussian-elimination/)）.

<a id="claim-3-2"></a>

:::note[主張 3.2]
基底 $b_1, \dots, b_r$ をピボットの降順に並べ、$y = x$ から始めて $i = 1, \dots, r$ の順に $y \leftarrow \max(y, y \oplus b_i)$ とする.
最後の $y$ は $\max_{v \in V} (x \oplus v)$ である.
同様に $\min$ をとっていくと $\min_{v \in V} (x \oplus v)$ が求まる.
:::

**証明**: $x \oplus v$（$v \in V$）は $x \oplus \bigoplus_{i \in I} b_i$ の形にちょうど 1 通りに書ける. $b_i$ を使うかどうかを $i = 1, 2, \dots$ の順に決めていく.
$b_i$ のピボットを $p_i$ とすると、$b_{i+1}, \dots, b_r$ はすべて $p_i$ 未満の bit しか持たないので、$p_i$ より上の bit と $p_i$ 自体の bit は、$b_1, \dots, b_i$ の選び方だけで決まる.
$b_1, \dots, b_{i-1}$ の選び方を固定すると、$p_i$ より上の bit はすでに確定しており、$b_i$ を使うかどうかで $p_i$ の bit が変わる.
[主張 3.1](#claim-3-1) より、最大化では $p_i$ の bit を $1$ にする方を選べばよく、それは $y$ と $y \oplus b_i$ の大きい方である. 最小化も同様である. $\square$

最小値の方は並べ替えなくてもよい. 後から入れた基底ベクトルは、挿入時に掃き出したので、先に入れた基底ベクトルのピボットの bit が $0$ である.
よって挿入順に $y \leftarrow \min(y, y \oplus b_i)$ とすると、$y$ のピボット $p_i$ の bit が $0$ になった後、それより後の操作で $1$ に戻ることはない（[コード](#5-コード)の `reduce`）.
最後の $y$ はすべてのピボットの bit が $0$ である. $x \oplus V$ の元でそうなるものはただ 1 つで、他の元はそれに $V$ の非零元（最上位 bit はピボット）を XOR したものなので、主張 3.1 よりそれより大きい.
$\min_{v \in V} (x \oplus v) = 0 \iff x \in V$ なので、所属判定にも使える.

XOR 基底は線形マトロイドなので、「重みの大きい順に、基底に入るものを採用する」貪欲法で、XOR で $0$ を作れない部分集合の重みの最大値が求まる（[マトロイド](../../graph/matroid/)）.

## 4. 参考資料

- [非負整数値を扱う Trie について - kazuma8128's blog](https://kazuma8128.hatenablog.com/entry/2018/05/06/022654)（binary trie の構造と、XOR の最小値・最大値、XOR した値の $k$ 番目などの操作）
- [掃き出し法](../../linear-algebra/gaussian-elimination/)（$\mathbb{F}_2$ 上の基底を階段形で持つこと、$\min(x, x \oplus b)$ によるピボットの判定）

## 5. コード

### 5.1. binary trie（3.2 節）

`binary_trie<B>`: $[0, 2^B)$ の非負整数の多重集合 $S$ を管理する. 値は `unsigned long long` で扱う（$B \le 63$）.

- `binary_trie<B>()`: 空の集合で初期化する.
- `size()`: $|S|$ を返す. $O(1)$.
- `insert(x)`: $x$ を 1 個追加する. $O(B)$.
- `erase(x)`: $x$ を 1 個削除する. $x \in S$ であること. $O(B)$.
- `count(x)`: $S$ に含まれる $x$ の個数を返す. $O(B)$.
- `min_xor(x)`: $\min_{a \in S} (a \oplus x)$ を返す. $S$ が空でないこと. $O(B)$.
- `max_xor(x)`: $\max_{a \in S} (a \oplus x)$ を返す. $S$ が空でないこと. $O(B)$.
- `kth_xor(x, k)`: $\lbrace a \oplus x : a \in S \rbrace$（重複込み）を昇順に並べたときの $k$ 番目（0-indexed）を返す. $0 \le k <$ `size()`. $O(B)$.
- `count_less_xor(x, y)`: $a \oplus x < y$ となる $a \in S$ の個数（重複込み）を返す. $O(B)$.

```cpp title="binary_trie.cpp"
// [0, 2^B) の非負整数の多重集合を管理する binary trie
template <int B = 30>
struct binary_trie {
  using u64 = unsigned long long;

  binary_trie() : nodes(1) {}

  int size() const { return nodes[0].cnt; }

  // x を 1 個追加する. O(B)
  void insert(u64 x) { add(x, 1); }

  // x を 1 個削除する. x が含まれていること. O(B)
  void erase(u64 x) {
    assert(count(x) > 0);
    add(x, -1);
  }

  // x の個数を返す. O(B)
  int count(u64 x) const {
    assert(x < (u64(1) << B));
    int v = 0;
    for (int i = B - 1; i >= 0; i--) {
      v = nodes[v].ch[x >> i & 1];
      if (v == -1) return 0;
    }
    return nodes[v].cnt;
  }

  // min_{a ∈ S} (a xor x). 空でないこと. O(B)
  u64 min_xor(u64 x) const { return kth_xor(x, 0); }

  // max_{a ∈ S} (a xor x). 空でないこと. O(B)
  u64 max_xor(u64 x) const { return kth_xor(x, size() - 1); }

  // { a xor x : a ∈ S } を昇順に並べたときの k 番目（0-indexed）. O(B)
  u64 kth_xor(u64 x, int k) const {
    assert(x < (u64(1) << B));
    assert(0 <= k && k < size());
    int v = 0;
    u64 res = 0;
    for (int i = B - 1; i >= 0; i--) {
      int b = x >> i & 1;
      // xor した結果の i bit 目が 0 になる側を先に見る
      int c = cnt(nodes[v].ch[b]);
      if (k < c) {
        v = nodes[v].ch[b];
      } else {
        k -= c;
        v = nodes[v].ch[b ^ 1];
        res |= u64(1) << i;
      }
    }
    return res;
  }

  // #{ a ∈ S : (a xor x) < y }. O(B)
  int count_less_xor(u64 x, u64 y) const {
    assert(x < (u64(1) << B));
    if (y >= (u64(1) << B)) return size();
    int v = 0, res = 0;
    for (int i = B - 1; i >= 0 && v != -1; i--) {
      int b = x >> i & 1;
      if (y >> i & 1) {
        res += cnt(nodes[v].ch[b]);  // xor の i bit 目が 0 なら y 未満で確定
        v = nodes[v].ch[b ^ 1];
      } else {
        v = nodes[v].ch[b];
      }
    }
    return res;
  }

 private:
  struct node {
    int ch[2] = {-1, -1};
    int cnt = 0;
  };
  vector<node> nodes;

  int cnt(int v) const { return v == -1 ? 0 : nodes[v].cnt; }

  void add(u64 x, int d) {
    assert(x < (u64(1) << B));
    int v = 0;
    nodes[v].cnt += d;
    for (int i = B - 1; i >= 0; i--) {
      int b = x >> i & 1;
      if (nodes[v].ch[b] == -1) {
        nodes[v].ch[b] = (int)nodes.size();
        nodes.emplace_back();
      }
      v = nodes[v].ch[b];
      nodes[v].cnt += d;
    }
  }
};
```

### 5.2. XOR 基底（3.5 節）

`xor_basis<B>`: $[0, 2^B)$ の値が張る $\mathbb{F}_2^B$ の部分空間 $V$ を管理する.

- `insert(x)`: $x$ を追加する. 基底が増えたら true を返す. $O(B)$.
- `reduce(x)`: $x$ を基底で掃き出した値を返す. これは $\min_{v \in V} (x \oplus v)$ に等しい. $O(B)$.
- `contains(x)`: $x \in V$ かを返す. $O(B)$.
- `min_xor(x)`: $\min_{v \in V} (x \oplus v)$ を返す. $O(B)$.
- `max_xor(x)`: $\max_{v \in V} (x \oplus v)$ を返す. `max_xor(0)` が部分集合の XOR の最大値. $O(B \log B)$.
- `rank()`: $\dim V$ を返す. $O(1)$.

```cpp title="xor_basis.cpp"
// XOR 基底（[0, 2^B) の値が張る F_2^B の部分空間）
template <int B = 60>
struct xor_basis {
  using u64 = unsigned long long;

  // x を追加する. 基底が増えたら true. O(B)
  bool insert(u64 x) {
    assert(x < (u64(1) << B));
    x = reduce(x);
    if (x == 0) return false;
    basis.push_back(x);
    return true;
  }

  // x を基底で掃き出した値 = min_{v ∈ V} (x xor v). O(B)
  u64 reduce(u64 x) const {
    for (u64 b : basis) x = min(x, x ^ b);
    return x;
  }

  // x ∈ V か. O(B)
  bool contains(u64 x) const { return reduce(x) == 0; }

  // min_{v ∈ V} (x xor v). O(B)
  u64 min_xor(u64 x) const { return reduce(x); }

  // max_{v ∈ V} (x xor v). O(B log B)
  u64 max_xor(u64 x = 0) const {
    vector<u64> b = basis;
    sort(b.rbegin(), b.rend());  // ピボットの降順
    for (u64 v : b) x = max(x, x ^ v);
    return x;
  }

  int rank() const { return (int)basis.size(); }

 private:
  vector<u64> basis;  // 後から入れたものほど、先に入れたもののピボットを持たない
};
```
