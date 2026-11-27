---
title: "Wavelet Matrix"
tags: [range-query, static]
sidebar:
  order: 10
---
## 1. 概要

更新のない非負整数列 $A = (A_0, \dots, A_{N-1})$（各 $A_i < 2^H$）に対して、区間 $[l, r)$ が与えられるたびに、多重集合 $\lbrace A_l, A_{l+1}, \dots, A_{r-1} \rbrace$ を入れた **Binary Trie を探索できる**データ構造.
例えば次のクエリに答えられる.

| 操作 | 計算量 |
| --- | --- |
| 構築 | $O(NH)$ |
| 区間の $k$ 番目に小さい値（`kth_smallest` / `kth_largest`） | $O(H)$ |
| 区間で値が $[a, b)$ に入る要素の個数（`range_freq`） | $O(H)$ |
| 区間で $x$ 未満の最大値・$x$ 以上の最小値（`prev_value` / `next_value`） | $O(H)$ |

空間は 0/1 列 $H$ 本ぶんで、$NH$ ビットとその $1/64$ 程度の補助配列である.
値が大きいときは座標圧縮して $H = \lceil \log_2 N \rceil$ にすればよい.
各段に累積和やセグメント木を載せると、区間内の値の総和や二次元の矩形クエリにも応用できる（6 章）.

## 2. 前提知識

- [Trie](../../string/trie/)（Binary Trie は、整数を上位ビットから 0/1 の文字列とみて Trie に入れたもの）
- **rank**: 0/1 列 $b$ について、$\mathrm{rank}(i) = b_0 + b_1 + \cdots + b_{i-1}$（$[0, i)$ にある 1 の個数）.

## 3. Binary Trie

### 3.1. 構造

$0$ 以上 $2^H$ 未満の整数の多重集合を、2 進表記の上位ビットから順に分類していく高さ $H$ の二分木で表す.
高さ $h$ のノードは値の区間 $[i \cdot 2^h, (i+1) \cdot 2^h)$ に対応し、ビット $h-1$ が $0$ の値は左の子、$1$ の値は右の子に進む. 葉（高さ $0$）は値 1 つに対応する.
どのノードがどの値の範囲を表すかは根からの経路で分かるので、ノードには要素数などの集約値だけを持てばよい.

### 3.2. $k$ 番目に小さい値（0-indexed）

葉でないノードで、そのノードの多重集合の $k$ 番目に小さい値を求める.

1. 左の子の要素数 $x$ を求める.
2. $k < x$ なら、左の子に進んで $k$ 番目を求める.
3. $x \le k$ なら、右の子に進んで $(k - x)$ 番目を求める.

左の子の値はすべて右の子の値より小さいので正しい.

### 3.3. $a$ 未満の要素の個数

「$a$ 以上 $b$ 未満の個数」は「$b$ 未満の個数」から「$a$ 未満の個数」を引けばよいので、「$a$ 未満の個数」を求める.
値の区間 $[s, t)$ のノードにいるとき、境界 $m = (s + t)/2$ と比べて

1. $a \le m$ なら、右の子の値はすべて $a$ 以上なので、左の子に進む.
2. $m < a$ なら、左の子の値はすべて $a$ 未満なので、左の子の要素数を答えに足して右の子に進む.

$a$ の 2 進表記で見ると、ビット $h-1$ が $0$ なら左、$1$ なら（左の要素数を足して）右に進むことになる.

## 4. Wavelet Tree

区間 $[l, r)$ ごとに Binary Trie を作り直すわけにはいかないので、**全体の** Binary Trie の各ノードに、そのノードに入る要素を**元の列での添字順**に並べた列を持たせる.
すると、区間 $[l, r)$ の要素だけを入れた Binary Trie の各ノードは、全体の Trie の同じノードの列のうちの連続する区間になる.

あとは、あるノードでの区間 $[l, r)$ が、左右の子の列でどの区間になるかが分かればよい.
ノードの列の各要素について、左の子に行くなら $0$、右の子に行くなら $1$ とした 0/1 列 $b$ を持つと、

- 左の子での区間: $[l - \mathrm{rank}(l), \ r - \mathrm{rank}(r))$
- 右の子での区間: $[\mathrm{rank}(l), \ \mathrm{rank}(r))$

である（添字順を保ったまま左右に振り分けるので、$[0, l)$ にある $0$ の個数が左の子での開始位置になる）.
これで、3 章の探索を区間 $[l, r)$ に制限して行える. 子の要素数は区間の長さで分かる.

## 5. Wavelet Matrix

### 5.1. ノードを段ごとに並べる

Wavelet Tree はノードごとに 0/1 列を持つので、実装が面倒になる. そこで、同じ高さのノードの列をつなげて 1 本の列にする.
ただし、つなげる順番を次のように変える.

- 高さ $h$ の段の列は、高さ $h+1$ の段の列から、**左の子に行く要素をすべて前に、右の子に行く要素をすべて後ろに**、それぞれ順序を保って並べたものとする.

こうしても、各ノードの要素は段の列の中で連続する区間をなし、ノード内では元の添字順のままである.
高さ $h+1$ の段の列の各要素について、ビット $h$ を並べた 0/1 列を $b^{(h)}$ とする. $b^{(h)}$ の $0$ の個数を $z_h$ とおく.

### 5.2. 子の区間

<a id="claim-5-1"></a>

:::note[主張 5.1]
高さ $h+1$ の段の列で区間 $[l, r)$ をなすノードについて、左の子・右の子は高さ $h$ の段の列で

$$
\begin{aligned}
\text{左の子}&: [\, l - \mathrm{rank}^{(h)}(l), \ r - \mathrm{rank}^{(h)}(r) \,) \\
\text{右の子}&: [\, z_h + \mathrm{rank}^{(h)}(l), \ z_h + \mathrm{rank}^{(h)}(r) \,)
\end{aligned}
$$

となる. ここで $\mathrm{rank}^{(h)}$ は $b^{(h)}$ の rank である.
:::

<details>
<summary>証明</summary>

高さ $h$ の段の列では、$b^{(h)}$ が $0$ の要素が元の順に $[0, z_h)$ に、$1$ の要素が元の順に $[z_h, N)$ に並ぶ.
高さ $h+1$ の段で位置 $i$ にあった要素は、$b^{(h)}_i = 0$ なら位置 $i - \mathrm{rank}^{(h)}(i)$（自分より前の $0$ の個数）に、$b^{(h)}_i = 1$ なら位置 $z_h + \mathrm{rank}^{(h)}(i)$ に移る.
$[l, r)$ の要素のうち $0$ のものは前の $0$ の個数が $l - \mathrm{rank}^{(h)}(l)$ から $r - \mathrm{rank}^{(h)}(r)$ 未満までの連続する位置に移り、$1$ のものも同様である. $\square$

</details>

よって、$H$ 本の 0/1 列 $b^{(H-1)}, \dots, b^{(0)}$ と $z_h$ だけで、Binary Trie の探索を区間 $[l, r)$ に制限して行える.
探索は根（高さ $H$、区間 $[l, r)$）から始め、3.2 節・3.3 節と同じ手順で、左右の子の区間を主張 5.1 で求めながら降りていく.
`kth_smallest` で右の子に進むときは、答えのビット $h$ を $1$ にする.

`prev_value(l, r, x)`（$x$ 未満の最大値）は、$x$ 未満の個数 $c$ を数えて $c - 1$ 番目に小さい値を、`next_value(l, r, x)`（$x$ 以上の最小値）は、$x$ 未満の個数 $c$ を数えて $c$ 番目に小さい値を返せばよい.

### 5.3. rank の計算

0/1 列を 64 bit 整数の配列 $w_0, w_1, \dots$ に詰め、各 $j$ について $\mathrm{rank}(64j)$ を前計算しておく.
$i = 64q + s$（$0 \le s < 64$）とすると

$$
\mathrm{rank}(i) = \mathrm{rank}(64q) + \mathrm{popcount}\left(w_q \mathbin{\&} (2^s - 1)\right)
$$

で $O(1)$ で求まる.

```cpp
// i = 64q + s として、[0, 64q) の 1 の個数 + bits[q] の下位 s ビットの 1 の個数
int rank(int i) const {
  return cnt[i / 64] + popcount(bits[i / 64] & ((uint64_t(1) << (i % 64)) - 1));
}
```

各段の構築は $O(N)$、探索は各段で rank を $O(1)$ 回呼ぶので、構築 $O(NH)$、クエリ $O(H)$ である.

## 6. 発展: 各段に情報を載せる

Wavelet Matrix の探索では、区間 $[l, r)$ と値の範囲 $[a, b)$ に入る要素の集合が、$O(H)$ 個のノード（各段の列の区間）の和に分かれる.
そこで、各段の列に沿って別のデータ構造を載せると、個数以外の集約もできる.

- **区間内の値の総和**: 各段で、並べ替えた後の列の値の累積和を持つ. $a$ 未満の個数を数えるときに左の子の要素数を足す代わりに、左の子の区間の値の和を足せば、$[l, r)$ で値が $a$ 未満の要素の和が $O(H)$ で求まる. 足すものを $A_i$ と別の重み $X_i$（可換群の元）にしてもよい.
- **最大値**: 差を取れない演算は、各段の列にセグメント木（静的ならスパーステーブルなど）を載せ、$O(H)$ 個のノードの区間で取ればよい. セグメント木なら重み $X_i$ の一点更新にも対応できる.
- **二次元の矩形クエリ**: 点 $(x_i, y_i)$ を $x$ 座標でソートして $y$ 座標を座標圧縮した列にすると、「$x$ が $[x_l, x_r)$、$y$ が $[y_l, y_r)$ の点の個数・重みの和」は、ソート順の区間 $[l, r)$ での `range_freq` になる.
- **全体に XOR した列**: 全要素に $x$ を XOR した列の $k$ 番目は、$x$ のビット $h$ が $1$ の段で左右の子を入れ替えて探索すればよい.

## 7. 参考資料

- [Wavelet Matrix（基礎） - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/wavelet_matrix_basic)（Binary Trie → Wavelet Tree → Wavelet Matrix の流れ、子の区間の求め方、`get_subtree_range` の実装、BitVector による rank）
- [Wavelet Matrix（発展） - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/wavelet_matrix_advanced)（XOR した列、総和・最大値などの集約、二次元の矩形クエリへの応用）

## 8. コード

- `wavelet_matrix<T>`: $0$ 以上 $2^h$ 未満の整数（型 `T`）の列を管理する.
- `wavelet_matrix(a, h)`: 列 `a` で構築する. $O(nh)$.
- `kth_smallest(l, r, k)`: $A_l, \dots, A_{r-1}$ のうち $k$ 番目（0-indexed）に小さい値を返す. $0 \le k < r - l$. $O(h)$.
- `kth_largest(l, r, k)`: $k$ 番目（0-indexed）に大きい値を返す. $O(h)$.
- `range_freq(l, r, upper)`: $l \le i < r$ かつ $A_i < \mathrm{upper}$ となる $i$ の個数を返す. $O(h)$.
- `range_freq(l, r, lower, upper)`: $l \le i < r$ かつ $\mathrm{lower} \le A_i < \mathrm{upper}$ となる $i$ の個数を返す. $O(h)$.
- `prev_value(l, r, upper)`: $A_l, \dots, A_{r-1}$ のうち $\mathrm{upper}$ 未満の最大値を返す. なければ $-1$. $O(h)$.
- `next_value(l, r, lower)`: $A_l, \dots, A_{r-1}$ のうち $\mathrm{lower}$ 以上の最小値を返す. なければ $-1$. $O(h)$.

```cpp title="wavelet_matrix.cpp"
// 長さ n の 0/1 列. rank(i) = [0, i) にある 1 の個数を O(1) で返す
struct bit_vector {
  bit_vector(int n = 0) : bits(n / 64 + 1), cnt(n / 64 + 2) {}

  void set(int i) { bits[i / 64] |= uint64_t(1) << (i % 64); }

  void build() {
    for (size_t j = 0; j < bits.size(); j++) cnt[j + 1] = cnt[j] + popcount(bits[j]);
  }

  // i = 64q + s として、[0, 64q) の 1 の個数 + bits[q] の下位 s ビットの 1 の個数
  int rank(int i) const {
    return cnt[i / 64] + popcount(bits[i / 64] & ((uint64_t(1) << (i % 64)) - 1));
  }

 private:
  vector<uint64_t> bits;
  vector<int> cnt;
};

// 0 以上 2^h 未満の整数の列を管理する
template <class T>
struct wavelet_matrix {
  // 列 a で構築する. O(nh)
  wavelet_matrix(vector<T> a, int h) : n(a.size()), h(h), dat(h), zeros(h) {
    for (int k = h - 1; k >= 0; k--) {
      // 高さ k + 1 の段 → 高さ k の段: ビット k が 0 なら左、1 なら右へ
      bit_vector bv(n);
      vector<T> left, right;
      for (int i = 0; i < n; i++) {
        assert(0 <= a[i] && (h >= numeric_limits<T>::digits || a[i] >> h == 0));
        if (a[i] >> k & 1) {
          bv.set(i);
          right.push_back(a[i]);
        } else {
          left.push_back(a[i]);
        }
      }
      bv.build();
      dat[k] = bv;
      zeros[k] = left.size();
      // 左に行った要素を前に、右に行った要素を後ろに（それぞれ順序は保つ）
      copy(right.begin(), right.end(), copy(left.begin(), left.end(), a.begin()));
    }
  }

  // a[l, r) の中で k 番目 (0-indexed) に小さい値. O(h)
  T kth_smallest(int l, int r, int k) const {
    assert(0 <= l && l < r && r <= n && 0 <= k && k < r - l);
    T res = 0;
    for (int d = h - 1; d >= 0; d--) {
      auto [l0, r0, l1, r1] = child(d, l, r);
      if (k < r0 - l0) {
        l = l0, r = r0;
      } else {
        k -= r0 - l0;
        res |= T(1) << d;
        l = l1, r = r1;
      }
    }
    return res;
  }

  // a[l, r) の中で k 番目 (0-indexed) に大きい値. O(h)
  T kth_largest(int l, int r, int k) const {
    assert(0 <= l && l < r && r <= n && 0 <= k && k < r - l);
    return kth_smallest(l, r, r - l - k - 1);
  }

  // l <= i < r かつ a[i] < upper を満たす i の個数. O(h)
  int range_freq(int l, int r, T upper) const {
    assert(0 <= l && l <= r && r <= n);
    if (upper <= 0) return 0;
    if (h < numeric_limits<T>::digits && upper >> h) return r - l;  // upper >= 2^h
    int res = 0;
    for (int d = h - 1; d >= 0; d--) {
      auto [l0, r0, l1, r1] = child(d, l, r);
      if (upper >> d & 1) {
        res += r0 - l0;  // ビット d が 0 の要素はすべて upper 未満
        l = l1, r = r1;
      } else {
        l = l0, r = r0;
      }
    }
    return res;
  }

  // l <= i < r かつ lower <= a[i] < upper を満たす i の個数. O(h)
  int range_freq(int l, int r, T lower, T upper) const {
    if (lower >= upper) return 0;
    return range_freq(l, r, upper) - range_freq(l, r, lower);
  }

  // a[l, r) の中で upper 未満の最大値. なければ -1. O(h)
  T prev_value(int l, int r, T upper) const {
    int cnt = range_freq(l, r, upper);
    return cnt == 0 ? T(-1) : kth_smallest(l, r, cnt - 1);
  }

  // a[l, r) の中で lower 以上の最小値. なければ -1. O(h)
  T next_value(int l, int r, T lower) const {
    int cnt = range_freq(l, r, lower);
    return cnt == r - l ? T(-1) : kth_smallest(l, r, cnt);
  }

 private:
  int n, h;
  vector<bit_vector> dat;  // dat[k]: 高さ k + 1 の段の各要素のビット k
  vector<int> zeros;       // zeros[k]: dat[k] の 0 の個数

  // 高さ d + 1 の段の区間 [l, r) が、高さ d の段の左の子 [l0, r0)・右の子 [l1, r1) に移る
  tuple<int, int, int, int> child(int d, int l, int r) const {
    int a1 = dat[d].rank(l), b1 = dat[d].rank(r);
    return {l - a1, r - b1, zeros[d] + a1, zeros[d] + b1};
  }
};
```

使用例:

```cpp
wavelet_matrix<int> wm(a, 30);          // 0 <= a[i] < 2^30
int med = wm.kth_smallest(l, r, (r - l) / 2);
int cnt = wm.range_freq(l, r, lo, hi);  // a[l, r) のうち lo 以上 hi 未満の個数
```
