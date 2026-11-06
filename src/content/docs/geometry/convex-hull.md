---
title: "凸包（Monotone Chain）"
tags: [convexity]
sidebar:
  order: 2
---
## 1. 概要

平面上の点集合 $P$ の**凸包**とは、$P$ をすべて含む最小の凸多角形である.
Andrew の **Monotone Chain** 法は、点を $x$ 座標でソートしてから、下側の境界（下側凸包）と上側の境界（上側凸包）をスタックで別々に求め、つなぎ合わせて凸包を作る.

- 計算量はソートがボトルネックで $O(N\log N)$. ソート済みなら $O(N)$.
- 外積の符号だけで判定するので、座標が整数なら誤差なく計算できる.
- 下側凸包・上側凸包だけを単独で使うことも多い（下に凸な関数の最小値を取る点の集合など）.

## 2. 前提知識

### 2.1. 外積の符号で曲がる向きを判定する

3 点 $A,B,C$ について

$$
\operatorname{cross}(A,B,C)=(B_x-A_x)(C_y-A_y)-(B_y-A_y)(C_x-A_x)
$$

とする. これは $\overrightarrow{AB}$ と $\overrightarrow{AC}$ の外積で、符号によって $A\to B\to C$ の曲がり方が分かる.

| $\operatorname{cross}(A,B,C)$ | $A\to B\to C$ |
| --- | --- |
| $>0$ | 左に曲がる（反時計回り） |
| $=0$ | 一直線上 |
| $<0$ | 右に曲がる（時計回り） |

## 3. Monotone Chain 法

### 3.1. スタックで下側凸包・上側凸包を求める

点を $(x,y)$ の辞書順にソートし、重複を取り除く. 先頭の点（最も左下）と末尾の点（最も右上）は必ず凸包の頂点で、凸包の境界はこの 2 点で下側と上側の 2 本の折れ線に分かれる.

**下側凸包**は、左から右へ進むとき常に左に曲がる（下に凸な）折れ線である. 点をソート順に見ていき、スタックで次のように求める.

1. 新しい点 $p$ について、スタックの上から 2 点を $a,b$（$b$ が一番上）とする.
2. $\operatorname{cross}(a,b,p)\le 0$（右に曲がる、または一直線上）なら、$b$ は下側凸包の頂点にならないので取り除き、1. に戻る.
3. 取り除けなくなったら $p$ を積む.

各点はスタックに高々 1 回積まれ高々 1 回取り除かれるので、ソート後は $O(N)$ で動く.

**上側凸包**は、判定の不等号を逆にして $\operatorname{cross}(a,b,p)\ge 0$ のときに取り除けばよい（$y$ 座標の符号を反転して下側凸包を求めるのと同じ）.

### 3.2. 正当性

ここでは簡単のため、$x$ 座標がすべて異なり、どの 3 点も一直線上にないとする. そうでない場合の扱いは 4 章で述べる.

#### 外積の符号と傾きの関係

$x_a<x_b<x_c$ のとき、辺 $ab$ の傾きを $s(a,b)=\dfrac{y_b-y_a}{x_b-x_a}$ と書くと

$$
\operatorname{cross}(a,b,c)=(x_b-x_a)(y_c-y_b)-(y_b-y_a)(x_c-x_b)=(x_b-x_a)(x_c-x_b)\bigl(s(b,c)-s(a,b)\bigr)
$$

となる（1 つ目の等号は $\overrightarrow{AC}=\overrightarrow{AB}+\overrightarrow{BC}$ を代入して整理する）. $(x_b-x_a)(x_c-x_b)>0$ なので

$$
\operatorname{cross}(a,b,c)>0\iff s(a,b)<s(b,c)
$$

つまり「左に曲がる」と「傾きが増える」は同じことである.

#### 下側凸包の言い換え

点を左から結んだ折れ線 $v_0,v_1,\dots,v_k$ が下側凸包であることは、次の 2 つが成り立つことと同値である.

- **凸性**: 辺の傾き $s(v_0,v_1)<s(v_1,v_2)<\dots<s(v_{k-1},v_k)$ が単調増加する.
- **全点が上にある**: すべての点が折れ線の上側（または折れ線上）にある.

#### スタックが常に下側凸包であること

アルゴリズムは次の不変条件を保つ.

> ソート順で最初の $k$ 点を処理し終えたとき、スタックはその $k$ 点の下側凸包になっている.

新しい点 $p$ を追加するとき、$p$ は $x$ 座標が最大なので新しい下側凸包の右端になる. 残りは、古い下側凸包のどこまでを残すかである.

**取り除いた点は二度と頂点にならない.**
$\operatorname{cross}(a,b,p)<0$ なら $s(a,b)>s(b,p)$ なので、$b$ は線分 $ap$ より上にある. 下側凸包の頂点は、ある直線より下に他の点がない点なので、線分 $ap$ より上にある $b$ は、$p$ 以降にどんな点を追加しても下側凸包の頂点にはならない. よって $b$ をスタックから捨ててよい.

**取り除けなくなったら $p$ を積めばよい.**
取り除く操作が止まったときのスタックの上 2 点を $a,b$ とすると $s(a,b)<s(b,p)$ である. スタックの中は凸性から傾きが増えているので、$p$ を積んでも傾きは単調増加のままになり、凸性が保たれる.

全点が上にあることも確かめる. $x\le x_b$ の範囲の点は、古い下側凸包（$b$ までは変わっていない）の上にある. $x_b\le x\le x_p$ の範囲の点は、古い下側凸包の $b$ より右の部分 $b,c_1,\dots,c_m$ の上にある. この $c_1,\dots,c_m$ はちょうど今回取り除いた点で、それぞれ「1 つ前の点と $p$ を結ぶ線分」より上にあった. 右から順に（$c_m$ から）見ていくと、折れ線 $c_{i-1},c_i,\dots,c_m,p$ は線分 $c_{i-1}p$ より上にあることが帰納的に分かり、最後に古い折れ線 $b,c_1,\dots,c_m,p$ が線分 $bp$ より上にあることが分かる. よってこの範囲の点も線分 $bp$ の上にある.

以上より、$p$ を積んだスタックは $k+1$ 点の下側凸包になり、不変条件が保たれる.

### 3.3. 下側凸包と上側凸包をつなぐ

下側凸包 $L=(l_0,\dots,l_{s-1})$ と上側凸包 $U=(u_0,\dots,u_{t-1})$ は、どちらも始点が最も左下の点、終点が最も右上の点で一致する.
そこで

$$
l_0,l_1,\dots,l_{s-1},u_{t-2},u_{t-3},\dots,u_1
$$

と並べると、最も左下の点から始まる反時計回りの凸包になる.

## 4. 特殊な点の配置への対応

### 4.1. 辺上の点を残すかどうか

凸包の辺上にある点（頂点ではない点）を残すかは問題によって異なる.

- 頂点だけ欲しい: 一直線上（外積 $=0$）でも取り除く. 不等号を $\le 0$ / $\ge 0$ にする.
- 辺上の点も欲しい: 一直線上なら残す. 不等号を $<0$ / $>0$ にする.

コードでは `erase_collinear` で切り替える.

### 4.2. y 軸に平行な辺がある場合

$x$ 座標が同じ点が複数あると、凸包の左端・右端に $y$ 軸に平行な辺ができることがある.
辞書順でソートしているので、$x$ 座標が最大の点が複数あるとき、下側凸包の終点はその中で最も上の点になる. 同様に、上側凸包の始点は $x$ 座標が最小の点の中で最も下の点になる. したがって

- 右端の $y$ 軸に平行な辺は下側凸包に含まれる.
- 左端の $y$ 軸に平行な辺は上側凸包に含まれる.

下側凸包・上側凸包を単独で使うとき（例えば各 $x$ での最小値を求めるとき）は、端に $y$ 軸に平行な辺が入っていることに注意する.

### 4.3. 全点が一直線上にある場合

全点が一直線上にあると、下側凸包と上側凸包は同じ列になる. 3.3. の方法でつなぐと点が重複して数えられるので、この場合は片方だけを返す.

- 頂点だけ: 両端の 2 点（全点が同じなら 1 点）.
- 辺上の点も残す: 全点をソート順に並べたもの.

## 5. 参考資料

- [A. M. Andrew, *Another efficient algorithm for convex hulls in two dimensions*, Information Processing Letters 9(5), 1979](https://doi.org/10.1016/0020-0190(79)90072-3)（Monotone Chain 法の原論文）
- [Algorithm Implementation/Geometry/Convex hull/Monotone chain - Wikibooks](https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain)（下側・上側凸包のつなぎ方と実装）
- [Convex Hull construction - cp-algorithms](https://cp-algorithms.com/geometry/convex-hull.html)（同一直線上の点を残す場合の扱い）
- [Static Convex Hull - Library Checker](https://judge.yosupo.jp/problem/static_convex_hull)（重複点・一直線上の点を含む検証用問題）

## 6. コード

- `lower_hull` / `upper_hull`: 下側凸包・上側凸包を $x$ 昇順（同じ $x$ では $y$ 昇順）で返す.
- `convex_hull`: 凸包を最も左下の点から反時計回りで返す.
- `erase_collinear = false` にすると辺上の点も残す.

```cpp title="convex_hull.cpp"
template <class T>
struct Point {
  T x, y;

  Point(T x = 0, T y = 0) : x(x), y(y) {}

  bool operator<(const Point &rhs) const {
    if (x != rhs.x) return x < rhs.x;
    return y < rhs.y;
  }

  bool operator==(const Point &rhs) const {
    return x == rhs.x && y == rhs.y;
  }
};

// AB と AC の外積. 正なら A→B→C は反時計回り
template <class T>
T cross_product(const Point<T> &A, const Point<T> &B, const Point<T> &C) {
  return (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
}

// 下側凸包 (x 昇順, 同じ x では y 昇順に並ぶ)
// erase_collinear = true なら、同一直線上の中間点を消す
template <class T>
vector<Point<T>> lower_hull(vector<Point<T>> P, bool erase_collinear = true) {
  sort(P.begin(), P.end());
  P.erase(unique(P.begin(), P.end()), P.end());

  vector<Point<T>> res;
  for (const auto &p : P) {
    while ((int)res.size() >= 2) {
      T cr = cross_product(res[res.size() - 2], res.back(), p);
      if (erase_collinear ? cr <= 0 : cr < 0) {
        res.pop_back();
      } else {
        break;
      }
    }
    res.push_back(p);
  }
  return res;
}

// 上側凸包 (x 昇順, 同じ x では y 昇順に並ぶ)
// erase_collinear = true なら、同一直線上の中間点を消す
template <class T>
vector<Point<T>> upper_hull(vector<Point<T>> P, bool erase_collinear = true) {
  sort(P.begin(), P.end());
  P.erase(unique(P.begin(), P.end()), P.end());

  vector<Point<T>> res;
  for (const auto &p : P) {
    while ((int)res.size() >= 2) {
      T cr = cross_product(res[res.size() - 2], res.back(), p);
      if (erase_collinear ? cr >= 0 : cr > 0) {
        res.pop_back();
      } else {
        break;
      }
    }
    res.push_back(p);
  }
  return res;
}

// 凸包. 最も左下の点から反時計回りに並べて返す
// erase_collinear = true なら、辺上の点を消す
template <class T>
vector<Point<T>> convex_hull(const vector<Point<T>> &P, bool erase_collinear = true) {
  auto lower = lower_hull(P, erase_collinear);
  auto upper = upper_hull(P, erase_collinear);

  // 全点が一直線上にあるとき, lower と upper は同じ列になる
  if (lower == upper) return lower;

  // lower の終点と upper の始点は重複するので除く
  vector<Point<T>> res = lower;
  for (int i = (int)upper.size() - 2; i >= 1; i--) res.push_back(upper[i]);
  return res;
}
```
