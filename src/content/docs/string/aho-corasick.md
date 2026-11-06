---
title: "Aho-Corasick"
tags: [string-search]
sidebar:
  order: 3
---
## 1. 概要

**複数のパターン文字列をまとめて検索する**ためのオートマトン.
パターンの集合 $\mathcal{P} = \lbrace P_1, \dots, P_n \rbrace$ から Trie を作り、各頂点に「一致に失敗したときの戻り先」（failure link）を付け加えたものである.

- テキストを先頭から 1 文字ずつ読み、状態を遷移させるだけで、どのパターンが出現したかが分かる.
- 遷移を全文字について事前に埋めておくので、1 文字あたり $O(1)$ で遷移できる.
- 状態数はパターン長の和 $+1$ 以下なので、「パターンを含まない文字列の数え上げ」のような **オートマトン上の DP** の状態として使える.

このライブラリは、DP で使いやすいように **互いに部分文字列にならないようにパターンを削減してから** 構築する（[3.4 節](#34-パターンの削減)）.

## 2. 前提知識

- [Trie](../../string/trie/): パターンの接頭辞を頂点とする木.
- 幅優先探索（BFS）

## 3. Aho-Corasick 法

### 3.1. 状態

パターン集合から Trie を作る. Trie の各頂点は、いずれかのパターンの接頭辞（空文字列を含む）と 1 対 1 に対応する.
以下、頂点 $v$ に対応する文字列を $\operatorname{str}(v)$ と書く.

テキスト $T$ を $i$ 文字目まで読んだときの状態を、

> $T[0, i)$ の接尾辞のうち、いずれかのパターンの接頭辞になっている**最長**のもの

に対応する頂点と定める. 空文字列はつねに条件を満たすので、状態は必ず存在する.

### 3.2. failure link

根以外の頂点 $v$ について、$\operatorname{str}(v)$ の**真の**接尾辞のうち、いずれかのパターンの接頭辞になっている最長のものに対応する頂点を $\operatorname{fail}(v)$ とする.
$\operatorname{fail}(v)$ は $v$ より浅いので、根から $v$ へ向かって決めていける.

例: $\mathcal{P} = \lbrace \texttt{he}, \texttt{she}, \texttt{his}, \texttt{hers} \rbrace$ のとき（根は $\varepsilon$）

| $\operatorname{str}(v)$ | h | he | her | hers | hi | his | s | sh | she |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $\operatorname{str}(\operatorname{fail}(v))$ | $\varepsilon$ | $\varepsilon$ | $\varepsilon$ | s | $\varepsilon$ | s | $\varepsilon$ | h | he |

### 3.3. 遷移の構築

状態 $v$ で文字 $c$ を読んだときの遷移先 $\delta(v, c)$ は次のように決まる.

- Trie に子 $v \xrightarrow{c} u$ があれば $\delta(v, c) = u$.
- なければ、$\operatorname{str}(v) + c$ の接尾辞で候補になるものは $\operatorname{str}(\operatorname{fail}(v)) + c$ 以下の長さに限られるので、$\delta(v, c) = \delta(\operatorname{fail}(v), c)$.
- 根で子がなければ $\delta(\mathrm{root}, c) = \mathrm{root}$.

また、Trie の子 $u$（$v \xrightarrow{c} u$）の failure link は

$$
\operatorname{fail}(u) = \delta(\operatorname{fail}(v), c)
$$

で求まる（$v$ が根のときは $\operatorname{fail}(u) = \mathrm{root}$）.

$\operatorname{fail}(v)$ は $v$ より浅いので、**BFS 順**に頂点を処理すれば、$v$ を処理する時点で $\delta(\operatorname{fail}(v), \cdot)$ はすべて埋まっている.
よって、Trie の欠けている辺をすべて埋めた完全な遷移表が得られる.

文字種を $\sigma$、パターン長の和を $L$ とすると、頂点数は $L + 1$ 以下で、構築は $O(L\sigma)$ 時間・空間である.

### 3.4. パターンの削減

一般の Aho-Corasick 法では、状態 $v$ に到達したとき、$\operatorname{str}(v)$ 自身だけでなく、$\operatorname{fail}$ をたどった先で終わるパターンも出現している（上の例では状態 $\texttt{she}$ で $\texttt{he}$ も出現する）. これを扱うには出力リンクなどが必要になる.

そこでこのライブラリは、構築前に**他のパターンの部分文字列になっているパターンを除く**（重複も除く）.

:::note[性質]
どのパターンも他のパターンの部分文字列でないとき、テキストのある位置でパターン $P$ が出現して終わることと、その位置での状態が $P$ の終端頂点であることは同値である.
:::

<details>
<summary>証明</summary>

状態が $P$ の終端頂点なら、$P$ はその位置で終わる接尾辞なので出現している.

逆に $P$ がその位置で終わるとする. $P$ 自身はパターンの接頭辞なので、状態の文字列 $S$ は $|S| \geq |P|$ を満たし、$P$ は $S$ の接尾辞である.
$S$ はあるパターン $Q$ の接頭辞なので、$P$ は $Q$ の部分文字列であり、仮定より $Q = P$.
すると $S$ は $P$ の接頭辞で長さ $|P|$ 以上なので $S = P$. $\square$

</details>

これにより、各状態について「その状態で完成したパターン」を高々 1 つ持つだけで済む.
削除のしかたは用途によって 2 通りある.

| モード | 削除する側 | 理由 |
| --- | --- | --- |
| `avoid_all`（すべて含まない） | 短いパターンを含む**長い**パターン | 短い方を含まなければ、長い方も含まない |
| `require_all`（すべて含む） | 長いパターンに含まれる**短い**パターン | 長い方を含めば、短い方も含む |

- `avoid_all`: `match_id(state) != -1` となる状態を禁止して DP する.
- `require_all`: 含んだパターンの集合を bit で持ち、`mask |= 1 << match_id(state)` として bit DP する.

### 3.5. 削減自体を Aho-Corasick で行う

素朴に全ペアの部分文字列判定をすると、パターン長の和を $L$ として最悪 $O(L^2)$ かかる.
そこで、まず**重複だけを除いた生のパターン**でオートマトンを作り、包含関係を Trie と failure tree の形から判定する.
Trie での親を $\operatorname{par}(v)$ と書く.

$\operatorname{str}(v)$ の部分文字列で $\operatorname{str}(v)$ 自身でないものは、

- 最後の文字を含まない → $\operatorname{str}(\operatorname{par}(v))$ の部分文字列
- 最後の文字を含む（真の接尾辞） → パターンの接頭辞なら、$\operatorname{fail}$ の最長性より $\operatorname{str}(\operatorname{fail}(v))$ の接尾辞

のどちらかである. ここから次の 2 つが従う.

:::note[包含の判定]
1. $\operatorname{str}(v)$ が他の頂点の文字列の真の部分文字列である $\iff$ $v$ が **Trie または failure tree で子を持つ**.
2. $\operatorname{has}(v)$ を「$\operatorname{str}(v)$ がパターンを部分文字列に含む」とすると、BFS 順に

$$
\begin{aligned}
\operatorname{strict}(v) &= \operatorname{has}(\operatorname{par}(v)) \lor \operatorname{has}(\operatorname{fail}(v)) \\
\operatorname{has}(v) &= (v \text{ が終端}) \lor \operatorname{strict}(v)
\end{aligned}
$$

で求まり、$\operatorname{strict}(v)$ は「$\operatorname{str}(v)$ が自身より短いパターンを含む」を表す.
:::

各頂点の文字列はあるパターンの接頭辞なので、パターン $P$ の終端頂点 $t_P$ について

- `require_all`: $t_P$ が Trie または failure tree で子を持てば $P$ を消す.
- `avoid_all`: $\operatorname{strict}(t_P)$ なら $P$ を消す.

とすればよい. 包含関係は推移的なので、削除されるパターンを経由して判定しても結果は変わらない.
削減後のパターンでもう一度オートマトンを作り直すので、全体で $O(L\sigma)$ 時間である.

## 4. 参考資料

- [A. V. Aho, M. J. Corasick, *Efficient string matching: an aid to bibliographic search*, Communications of the ACM 18(6), 1975](https://doi.org/10.1145/360825.360855)（原論文. goto・failure・output 関数による構成）
- [Aho-Corasick algorithm - cp-algorithms](https://cp-algorithms.com/string/aho_corasick.html)（failure link と遷移表を BFS で埋める実装、オートマトン上の DP への応用）

## 5. コード

- `aho_corasick<char_size, base>`: 文字 `ch` を `ch - base` に写し、$0$ 以上 `char_size` 未満の文字として扱う.
- コンストラクタでモード（`reduce_mode::avoid_all` / `reduce_mode::require_all`）を指定する. 既定は `require_all`. `reduce_mode` はテンプレートの外にあるので、`aho_corasick<26, 'a'> ac(reduce_mode::avoid_all);` のように書ける.
- `add(s)`: パターンを追加する.
- `build()`: パターンを削減して構築し、`{削減後のパターン数, 状態数}` を返す. 状態 $0$ が根（初期状態）. $O(L\sigma)$.
- `next(state, c)`: 遷移先を返す. `c` は `int`（変換済み）でも `char` でもよい.
- `match_id(state)`: その状態で完成したパターンの番号（`reduced_patterns` の添字）を返す. なければ $-1$.
- `reduced_patterns` は、残ったパターンを `add` した順に並べたもの.

```cpp title="aho-corasick.cpp"
#include <bits/stdc++.h>
using namespace std;
using pii = pair<int, int>;

enum class reduce_mode {
  avoid_all,   // すべて含まない: 短い語が長い語に含まれるなら、長い語を消す
  require_all  // すべて含む: 短い語が長い語に含まれるなら、短い語を消す
};

template <int char_size, int base>
struct aho_corasick {
  struct node {
    array<int, char_size> nxt;  // 文字 c を追加したときの遷移先
    int parent = 0;             // Trie での親
    int fail = 0;               // 今の状態文字列の suffix のうち、パターンの prefix になっている最長のもの
    int match = -1;             // この状態で完成したパターン

    node() {
      nxt.fill(-1);
    }
  };

  reduce_mode mode;
  vector<string> raw_patterns;
  vector<string> reduced_patterns;
  vector<node> nodes;

  // mode: パターンの削減方法（既定は require_all）
  aho_corasick(reduce_mode mode = reduce_mode::require_all) : mode(mode) {}

  // パターン s を追加する（build 前に呼ぶ）
  // s: 各文字 ch が base <= ch < base + char_size を満たす文字列
  void add(const string& s) {
    raw_patterns.push_back(s);
  }

  // パターン ss をまとめて追加する
  void add(const vector<string>& ss) {
    for (const string& s : ss) {
      add(s);
    }
  }

  // パターンを削減してオートマトンを構築する. O(L σ)（L: パターン長の和, σ: char_size）
  // 返り値: {削減後のパターン数, 状態数}. 状態は 0 以上 状態数 未満で、0 が根（初期状態）
  pii build() {
    reduce_patterns();
    build_automaton(reduced_patterns);

    return {
        (int)reduced_patterns.size(),
        (int)nodes.size(),
    };
  }

  // 状態 state で文字 c を読んだときの遷移先を返す. O(1)
  // c: base を引いた後の値（0 <= c < char_size）
  int next(int state, int c) const {
    return nodes[state].nxt[c];
  }

  // 状態 state で文字 ch を読んだときの遷移先を返す. O(1)
  int next(int state, char ch) const {
    return next(state, char_id(ch));
  }

  // 状態 state で完成したパターンの番号（reduced_patterns の添字）を返す. なければ -1
  int match_id(int state) const {
    return nodes[state].match;
  }

 private:
  vector<int> bfs_order;  // 根以外の頂点の BFS 順

  // 文字 ch を 0 以上 char_size 未満の値に変換する
  static int char_id(char ch) {
    int c = ch - base;
    assert(0 <= c && c < char_size);
    return c;
  }

  // パターン ps（番号は ps の添字）でオートマトンを構築する
  // 返り値: 各パターンの終端頂点
  vector<int> build_automaton(const vector<string>& ps) {
    nodes.assign(1, node());  // root

    vector<int> term;
    for (int i = 0; i < (int)ps.size(); i++) {
      term.push_back(insert(ps[i], i));
    }

    build_transition();
    return term;
  }

  // 生のパターンでオートマトンを作り、Trie と failure tree の形から包含関係を判定する
  void reduce_patterns() {
    vector<int> term = build_automaton(raw_patterns);
    vector<bool> erased(nodes.size(), false);  // 頂点 v で終わるパターンを消すか

    if (mode == reduce_mode::require_all) {
      // str(v) が他の頂点の真の部分文字列 <=> Trie か failure tree で子を持つ
      for (int v : bfs_order) {
        erased[nodes[v].parent] = erased[nodes[v].fail] = true;
      }
    } else {
      // has[v]: str(v) がパターンを含む
      vector<bool> has(nodes.size(), false);
      has[0] = nodes[0].match != -1;

      for (int v : bfs_order) {
        // str(v) が自身より短いパターンを含む
        erased[v] = has[nodes[v].parent] || has[nodes[v].fail];
        has[v] = erased[v] || nodes[v].match != -1;
      }
    }

    reduced_patterns.clear();

    for (int i = 0; i < (int)raw_patterns.size(); i++) {
      // 重複したパターンは最初の 1 つだけ残す
      if (nodes[term[i]].match == i && !erased[term[i]]) {
        reduced_patterns.push_back(raw_patterns[i]);
      }
    }
  }

  // Trie に s を番号 id で挿入する. 同じ文字列が既にあれば番号は上書きしない
  // 返り値: s の終端頂点
  int insert(const string& s, int id) {
    int v = 0;

    for (char ch : s) {
      int c = char_id(ch);

      if (nodes[v].nxt[c] == -1) {
        nodes[v].nxt[c] = nodes.size();
        nodes.emplace_back();
        nodes.back().parent = v;
      }

      v = nodes[v].nxt[c];
    }

    if (nodes[v].match == -1) {
      nodes[v].match = id;
    }
    return v;
  }

  // BFS 順に failure link を求め、すべての遷移を埋める
  void build_transition() {
    bfs_order.clear();
    queue<int> q;

    for (int c = 0; c < char_size; c++) {
      int to = nodes[0].nxt[c];

      if (to == -1) {
        nodes[0].nxt[c] = 0;
      } else {
        nodes[to].fail = 0;
        q.push(to);
      }
    }

    while (!q.empty()) {
      int v = q.front();
      q.pop();
      bfs_order.push_back(v);

      int f = nodes[v].fail;

      for (int c = 0; c < char_size; c++) {
        int to = nodes[v].nxt[c];

        if (to == -1) {
          // 文字 c で直接進めないなら、failure 先の遷移を使う
          nodes[v].nxt[c] = nodes[f].nxt[c];
        } else {
          // 文字 c で直接進めるなら、そのノードの failure link を設定する
          nodes[to].fail = nodes[f].nxt[c];
          q.push(to);
        }
      }
    }
  }
};
```
