---
title: "外積と向きの判定"
tags: [precision]
sidebar:
  order: 1
---
## 1. 概要

平面幾何の判定の多くは、2 つのベクトルの**外積**の符号に帰着できる.
外積を使う基本的な判定として、次の 3 つをまとめる.

- 3 点 $A,B,C$ について、$A\to B\to C$ が反時計回りか時計回りか一直線上か（ccw）.
- 多角形の符号付き面積と、頂点の並びが反時計回りか時計回りか.
- 多角形のどちら側が内部か、点が多角形の内部・境界・外部のどこにあるか.

座標が整数なら、どの判定も加減算と乗算だけで行えるので誤差が出ない.

## 2. 前提知識

- 平面ベクトルの成分表示と内積.

## 3. 外積

### 3.1. 定義

平面ベクトル $\boldsymbol a=(a_x,a_y)$, $\boldsymbol b=(b_x,b_y)$ の**外積**を

$$
\boldsymbol a\times\boldsymbol b=a_xb_y-a_yb_x
$$

と定める. 3 次元の外積の $z$ 成分にあたる値で、平面ではスカラーとして扱う.
次の性質が成り立つ.

- 反対称: $\boldsymbol b\times\boldsymbol a=-(\boldsymbol a\times\boldsymbol b)$. 特に $\boldsymbol a\times\boldsymbol a=0$.
- 双線形: $(\boldsymbol a+\boldsymbol a')\times\boldsymbol b=\boldsymbol a\times\boldsymbol b+\boldsymbol a'\times\boldsymbol b$, $(k\boldsymbol a)\times\boldsymbol b=k(\boldsymbol a\times\boldsymbol b)$（$\boldsymbol b$ についても同様）.

### 3.2. 図形的な意味

$\boldsymbol a$ から $\boldsymbol b$ へ反時計回りに測った角を $\theta$ とすると

$$
\boldsymbol a\cdot\boldsymbol b=|\boldsymbol a||\boldsymbol b|\cos\theta,\qquad
\boldsymbol a\times\boldsymbol b=|\boldsymbol a||\boldsymbol b|\sin\theta
$$

となる. 外積の式から次の 2 つが分かる.

- 外積の符号から向きが分かる. $\boldsymbol a\times\boldsymbol b>0$ のとき $\boldsymbol b$ は $\boldsymbol a$ の左側（反時計回りに $0<\theta<\pi$ 回した側）にあり、$\boldsymbol a\times\boldsymbol b<0$ のとき右側にある. $\boldsymbol a\times\boldsymbol b=0$ のとき $\boldsymbol a$ と $\boldsymbol b$ は平行（どちらかが零ベクトルの場合を含む）.
- 外積の絶対値から面積が分かる. $|\boldsymbol a\times\boldsymbol b|$ は $\boldsymbol a$ と $\boldsymbol b$ が張る平行四辺形の面積で、$|\boldsymbol a\times\boldsymbol b|/2$ が $\boldsymbol a$ と $\boldsymbol b$ が張る三角形の面積である. 符号まで含めた $\boldsymbol a\times\boldsymbol b$ を**符号付き面積**という.

<details><summary>証明</summary>

$\boldsymbol a=|\boldsymbol a|(\cos\alpha,\sin\alpha)$, $\boldsymbol b=|\boldsymbol b|(\cos\beta,\sin\beta)$ と書くと $\theta=\beta-\alpha$ で

$$
\boldsymbol a\times\boldsymbol b=|\boldsymbol a||\boldsymbol b|(\cos\alpha\sin\beta-\sin\alpha\cos\beta)=|\boldsymbol a||\boldsymbol b|\sin(\beta-\alpha)
$$

となる. 内積も同様に加法定理から $|\boldsymbol a||\boldsymbol b|\cos(\beta-\alpha)$ になる.
平行四辺形の面積は（底辺 $|\boldsymbol a|$）×（高さ $|\boldsymbol b||\sin\theta|$）なので $|\boldsymbol a\times\boldsymbol b|$ に等しい.

</details>

### 3.3. 値の大きさ

座標の絶対値が $M$ 以下の整数のとき、差ベクトルの成分は絶対値 $2M$ 以下なので、3 点から作る外積の絶対値は $2\cdot(2M)^2=8M^2$ 以下である.
$M=10^9$ なら $8\times10^{18}<2^{63}\approx9.22\times10^{18}$ なので `long long` に収まる. ただし外積どうしをさらに掛ける計算（線分の交点など）は `__int128` が必要になる.

## 4. 3 点の向き（ccw）

### 4.1. 外積の符号による判定

3 点 $A,B,C$ について、$\overrightarrow{AB}\times\overrightarrow{AC}$ の符号で $A\to B\to C$ の曲がり方が分かる.

| $\overrightarrow{AB}\times\overrightarrow{AC}$ | $A\to B\to C$ | $C$ の位置 |
| --- | --- | --- |
| $>0$ | 左に曲がる（反時計回り） | 有向直線 $AB$ の左側 |
| $=0$ | 一直線上 | 直線 $AB$ 上 |
| $<0$ | 右に曲がる（時計回り） | 有向直線 $AB$ の右側 |

$\overrightarrow{AB}\times\overrightarrow{AC}$ は三角形 $ABC$ の符号付き面積の 2 倍でもあり、$A,B,C$ が反時計回りに並ぶとき正になる.
また、$A,B,C$ を巡回的に入れ替えても値は変わらず、2 点を入れ替えると符号が反転する.

### 4.2. 一直線上の場合の細分

$\overrightarrow{AB}\times\overrightarrow{AC}=0$ のとき、$C$ が直線 $AB$ 上のどこにあるかを内積と長さで区別すると、線分の交差判定などで場合分けが楽になる.
$\boldsymbol b=\overrightarrow{AB}$, $\boldsymbol c=\overrightarrow{AC}$ とおき、$A\ne B$ とする.

| 条件 | $C$ の位置 | 戻り値 |
| --- | --- | --- |
| $\boldsymbol b\times\boldsymbol c>0$ | 左側（反時計回り） | $+1$ |
| $\boldsymbol b\times\boldsymbol c<0$ | 右側（時計回り） | $-1$ |
| $\boldsymbol b\times\boldsymbol c=0$, $\boldsymbol b\cdot\boldsymbol c<0$ | $C\to A\to B$ の順に並ぶ（$A$ の後ろ） | $+2$ |
| $\boldsymbol b\times\boldsymbol c=0$, $\lvert\boldsymbol b\rvert<\lvert\boldsymbol c\rvert$ | $A\to B\to C$ の順に並ぶ（$B$ の先） | $-2$ |
| それ以外 | 線分 $AB$ 上（端点を含む） | $0$ |

表の戻り値を $\operatorname{ccw}(A,B,C)$ と書く. 戻り値の付け方は AOJ CGL_1_C や Spaghetti Source の `ccw` と同じである.
$\operatorname{ccw}$ を使うと、線分 $AB$ と線分 $CD$ が（端点を含めて）共有点をもつ条件は

$$
\operatorname{ccw}(A,B,C)\cdot\operatorname{ccw}(A,B,D)\le0\ \text{かつ}\ \operatorname{ccw}(C,D,A)\cdot\operatorname{ccw}(C,D,B)\le0
$$

と書ける.

## 5. 多角形の面積と向き

### 5.1. 靴紐公式

多角形の頂点を境界に沿って $P_0,P_1,\dots,P_{n-1}$ とし、$P_n=P_0$ とする. 自己交差しない多角形（単純多角形）の面積 $S$ は

$$
2S=\left|\sum_{i=0}^{n-1}P_i\times P_{i+1}\right|
$$

で求められる（**靴紐公式**, shoelace formula）. ここで $P_i\times P_{i+1}$ は位置ベクトルどうしの外積 $x_iy_{i+1}-y_ix_{i+1}$ である.
座標が整数なら $2S$ は整数になるので、$S$ ではなく $2S$ を整数で持つと誤差が出ない.

絶対値を外した和 $D=\sum_{i=0}^{n-1}P_i\times P_{i+1}$ を多角形の**符号付き面積の 2 倍**という.

<details><summary>証明</summary>

原点を $O$ とすると、$P_i\times P_{i+1}$ は三角形 $OP_iP_{i+1}$ の符号付き面積の 2 倍である.
平面上の点 $Q$（$O$ と多角形の辺の上にない点）を 1 つ固定し、三角形 $OP_iP_{i+1}$ が $Q$ を含むとき、三角形 $OP_iP_{i+1}$ の向きに応じて $+1$ か $-1$ を数える.
$O$ から $Q$ を通る半直線を考えると、三角形 $OP_iP_{i+1}$ が $Q$ を含むことと、辺 $P_iP_{i+1}$ がその半直線の $Q$ より先の部分と交わることは同値である. 交わる向きが反時計回りなら $+1$、時計回りなら $-1$ になる.
したがって、全三角形について足した値は、多角形の境界が $Q$ のまわりを反時計回りに回る回数（**回転数**, winding number）に等しい.
単純多角形の回転数は、頂点が反時計回りに並ぶとき内部の点で $1$、時計回りのとき $-1$、外部の点で $0$ である.
よって $D$ は、反時計回りのとき $2S$、時計回りのとき $-2S$ になる.

</details>

原点からの位置ベクトルではなく $P_0$ からの相対ベクトルで $\sum_{i=1}^{n-2}\overrightarrow{P_0P_i}\times\overrightarrow{P_0P_{i+1}}$ と計算しても同じ値になる（$P_0$ を原点に平行移動しただけ）. 各項の大きさが 3.3. の範囲に収まるので、$P_0$ からの相対ベクトルで計算する方がオーバーフローしにくい.

### 5.2. 頂点の並びの向き

5.1. の証明から、単純多角形について次が成り立つ.

| $D$ | 頂点の並び |
| --- | --- |
| $>0$ | 反時計回り |
| $<0$ | 時計回り |

時計回りで与えられた多角形は、頂点列を反転すれば反時計回りにできる.

凸多角形なら、連続する 3 頂点 $P_{i-1},P_i,P_{i+1}$ の ccw がすべて同じ符号になり、すべて正なら反時計回り、すべて負なら時計回りである. 凸でない多角形では ccw の符号が頂点ごとに変わるので、向きは $D$ の符号で判定する.

## 6. 多角形の内部と外部

### 6.1. どちら側が内部か

単純多角形の頂点が反時計回りに並んでいるとき、各辺 $P_iP_{i+1}$ を $P_i$ から $P_{i+1}$ へ向かう有向線分と見ると、**内部はつねに進行方向の左側**にある. 時計回りなら右側にある.

凸多角形では、点 $Q$ が内部（境界を含む）にあることは、すべての辺について $Q$ が有向線分の左側（または辺を延長した直線上）にあることと同値である.
すなわち反時計回りの凸多角形について

$$
Q\ \text{が凸多角形に含まれる}\iff \text{すべての }i\text{ で }\overrightarrow{P_iP_{i+1}}\times\overrightarrow{P_iQ}\ge0
$$

である. 凸でない多角形では、ある辺の右側にあっても内部にあることがあるので、すべての辺の左側にあるという条件は使えない. 6.2. の方法を使う.

### 6.2. 点と多角形の包含判定（交差数）

凸とは限らない単純多角形 $P_0,\dots,P_{n-1}$ と点 $Q$ について、$Q$ が内部・境界・外部のどれにあるかを判定する.

$Q$ から $x$ 軸の正の向きに半直線 $R$ を伸ばし、多角形の辺と $R$ が交わる回数を数える. 交わる回数が奇数なら $Q$ は内部、偶数なら外部にある（**交差数**, crossing number）.
境界を外から内へ横切るたびに内外が入れ替わり、$R$ の十分遠くは外部だからである.

$R$ が頂点を通る場合や、辺が $R$ に重なる場合に二重に数えないように、各辺 $P_iP_{i+1}$ について $\boldsymbol a=P_i-Q$, $\boldsymbol b=P_{i+1}-Q$ とし、$a_y\le b_y$ となるように必要なら $\boldsymbol a,\boldsymbol b$ を入れ替えてから次のように判定する.

1. $\boldsymbol a\times\boldsymbol b=0$ かつ $\boldsymbol a\cdot\boldsymbol b\le0$ なら、$Q$ は辺 $P_iP_{i+1}$ 上にある. 境界と答えて終了する.
2. $a_y\le0<b_y$ かつ $\boldsymbol a\times\boldsymbol b>0$ なら、辺 $P_iP_{i+1}$ は $R$ と交わるので、交差の回数に 1 を足す.

2. の $a_y\le0<b_y$ は、辺の $y$ 座標の範囲を下端を含み上端を含まない半開区間として扱う条件である. 頂点 $P_j$ が $R$ 上にあるとき、$P_j$ を共有する 2 辺のうち、$R$ を実際に横切る場合だけちょうど 1 回数えられる. 水平な辺は $a_y=b_y$ なので数えない.
$\boldsymbol a\times\boldsymbol b>0$ は、下から上へ向かう有向線分 $\boldsymbol a\to\boldsymbol b$ の左側に $Q$（原点）があること、すなわち辺と直線 $y=Q_y$ の交点が $Q$ の右にあることを表す.

計算量は $O(n)$ で、頂点の並びの向きによらず使える.
凸多角形に対する多数のクエリには、二分探索で $O(\log n)$ にする方法もある（参考資料の cp-algorithms を参照）.

## 7. 参考資料

- [Oriented area of a triangle - cp-algorithms](https://cp-algorithms.com/geometry/oriented-triangle-area.html)（外積と符号付き面積）
- [Finding area of simple polygon in O(N) - cp-algorithms](https://cp-algorithms.com/geometry/area-of-simple-polygon.html)（靴紐公式）
- [Shoelace formula - Wikipedia](https://en.wikipedia.org/wiki/Shoelace_formula)（靴紐公式と符号付き面積）
- [Point in polygon - Wikipedia](https://en.wikipedia.org/wiki/Point_in_polygon)（交差数と回転数による包含判定）
- [ABC251 解説 - AtCoder](https://atcoder.jp/contests/abc251/editorial/3961)（凸多角形の包含条件）
- [Point location in convex polygon - cp-algorithms](https://cp-algorithms.com/geometry/point-in-convex-polygon.html)（凸多角形の $O(\log n)$ 包含判定）
- [AOJ CGL_1_C Counter-Clockwise](https://onlinejudge.u-aizu.ac.jp/problems/CGL_1_C)（ccw の戻り値の付け方と検証）
- [AOJ CGL_3_A Area](https://onlinejudge.u-aizu.ac.jp/problems/CGL_3_A)（多角形の面積の検証）
- [AOJ CGL_3_C Polygon-Point Containment](https://onlinejudge.u-aizu.ac.jp/problems/CGL_3_C)（包含判定の検証）

## 8. コード

### 8.1. 点と外積・ccw（3 章・4 章）

- `Point<T>`: 加減算・スカラー倍・比較をもつ点（ベクトル）.
- `dot(a, b)` / `cross(a, b)`: 内積と外積.
- `cross(A, B, C)`: $\overrightarrow{AB}\times\overrightarrow{AC}$. 正なら $A\to B\to C$ は反時計回り.
- `ccw(A, B, C)`: 4.2. の表の戻り値（$+1$: 反時計回り, $-1$: 時計回り, $+2$: $C\to A\to B$, $-2$: $A\to B\to C$, $0$: $C$ が線分 $AB$ 上）.

```cpp title="point.cpp"
template <class T>
struct Point {
  T x, y;

  Point(T x = 0, T y = 0) : x(x), y(y) {}

  Point operator+(const Point &p) const { return Point(x + p.x, y + p.y); }
  Point operator-(const Point &p) const { return Point(x - p.x, y - p.y); }
  Point operator*(T k) const { return Point(x * k, y * k); }

  bool operator<(const Point &p) const {
    if (x != p.x) return x < p.x;
    return y < p.y;
  }
  bool operator==(const Point &p) const { return x == p.x && y == p.y; }
};

template <class T>
T dot(const Point<T> &a, const Point<T> &b) { return a.x * b.x + a.y * b.y; }

template <class T>
T cross(const Point<T> &a, const Point<T> &b) { return a.x * b.y - a.y * b.x; }

// 長さの 2 乗
template <class T>
T norm(const Point<T> &a) { return dot(a, a); }

// AB と AC の外積. 正なら A→B→C は反時計回り
template <class T>
T cross(const Point<T> &A, const Point<T> &B, const Point<T> &C) {
  return cross(B - A, C - A);
}

// +1: 反時計回り, -1: 時計回り,
// +2: C→A→B の順に一直線上, -2: A→B→C の順に一直線上, 0: C が線分 AB 上
template <class T>
int ccw(const Point<T> &A, const Point<T> &B, const Point<T> &C) {
  Point<T> b = B - A, c = C - A;
  T cr = cross(b, c);
  if (cr > 0) return +1;
  if (cr < 0) return -1;
  if (dot(b, c) < 0) return +2;
  if (norm(b) < norm(c)) return -2;
  return 0;
}

// 線分 AB と線分 CD が共有点をもつか (端点を含む)
template <class T>
bool segments_intersect(const Point<T> &A, const Point<T> &B, const Point<T> &C, const Point<T> &D) {
  return ccw(A, B, C) * ccw(A, B, D) <= 0 && ccw(C, D, A) * ccw(C, D, B) <= 0;
}
```

### 8.2. 多角形の面積と向き（5 章）

- `area2(P)`: 符号付き面積の 2 倍 $D$. 反時計回りなら正、時計回りなら負. 面積は `abs(area2(P)) / 2`.
- `is_ccw(P)`: 頂点が反時計回りに並んでいるか.

```cpp title="polygon_area.cpp"
// 符号付き面積の 2 倍. 反時計回りなら正
template <class T>
T area2(const vector<Point<T>> &P) {
  int n = P.size();
  T res = 0;
  for (int i = 1; i + 1 < n; i++) res += cross(P[0], P[i], P[i + 1]);
  return res;
}

template <class T>
bool is_ccw(const vector<Point<T>> &P) { return area2(P) > 0; }
```

### 8.3. 点と多角形の包含判定（6 章）

- `contains(P, Q)`: 単純多角形 $P$ に対する点 $Q$ の位置を `OUT` / `ON` / `IN` で返す. $P$ の向きはどちらでもよい.

```cpp title="polygon_contains.cpp"
enum { OUT = 0, ON = 1, IN = 2 };

// 点 Q が単純多角形 P の外部・境界・内部のどこにあるか
template <class T>
int contains(const vector<Point<T>> &P, const Point<T> &Q) {
  int n = P.size();
  bool in = false;
  for (int i = 0; i < n; i++) {
    Point<T> a = P[i] - Q, b = P[(i + 1) % n] - Q;
    if (cross(a, b) == 0 && dot(a, b) <= 0) return ON;
    if (a.y > b.y) swap(a, b);
    if (a.y <= 0 && 0 < b.y && cross(a, b) > 0) in = !in;
  }
  return in ? IN : OUT;
}
```
