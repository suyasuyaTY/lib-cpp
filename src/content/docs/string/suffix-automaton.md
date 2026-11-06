---
title: "Suffix Automaton"
tags: [string-search]
sidebar:
  order: 1
---
## 概要

文字列 $S$ の部分文字列を、文字をラベルとする有向グラフで表すデータ構造。root から文字列 $T$ を順に読んで遷移できることと、$T$ が $S$ の部分文字列であることが同値になる。

- 同じ位置で終わる部分文字列を1つの状態にまとめる。
- 末尾に1文字ずつ追加して構築できる。
- アルファベットの種類数が定数なら、長さ $N$ の文字列を $O(N)$ 時間・空間で構築できる。
- 部分文字列の存在判定や、異なる部分文字列の個数を求める問題などに使える。

[実験ページ：各状態の文字列・len・link と、clone による遷移の変化](../../labs/suffix-automaton.html)

## アルゴリズム

### 状態と endpos

非空の部分文字列 $T$ が $S$ の中で終わる位置の集合を $\operatorname{endpos}(T)$ とする。位置は 1 始まりとする。

例えば、$S = \texttt{ababa}$ では、

$$
\operatorname{endpos}(\texttt{ba}) = \operatorname{endpos}(\texttt{aba}) = \{3,5\}
$$

となり、`ba` と `aba` は同じ状態に入る。終点集合が等しければ、次に同じ文字を付けたときの終点集合も等しいため、文字の遷移を共有できる。

各状態には、以下を保持する。

| データ | 意味 |
| --- | --- |
| `len[v]` | 状態 `v` が表す文字列の最大長 |
| `link[v]` | 最長の文字列の先頭を削り、初めて別の状態になる接尾辞の状態 |
| `next[v][c]` | 状態 `v` の文字列の右に文字 `c` を付けたときの状態。存在しなければ `-1` |
| `last` | 現在の文字列全体を含む状態 |

root は空文字列を表す特別な状態で、`len = 0`、`link = -1` とする。`next` は文字を読む遷移、`link` は文字を読まずに接尾辞を短くする移動であり、役割が異なる。各状態から `link` を親に向けて張ると、root を根とする木になる。

### 同じ状態に入る長さの範囲

同じ終点集合を持つ2つの文字列では、短い方は長い方の接尾辞になる。先頭を削ると、元の終点は残り、新しい終点が増えることはあっても減らない。

例えば、

$$
\operatorname{endpos}(\texttt{abc})
\subseteq \operatorname{endpos}(\texttt{bc})
\subseteq \operatorname{endpos}(\texttt{c})
$$

なので、両端の集合が等しければ、途中の集合も等しい。したがって、同じ状態に入る文字列の長さには穴がなく、root 以外の状態 `v` の範囲は

$$
\operatorname{len}(\operatorname{link}(v)) + 1
\le |T| \le \operatorname{len}(v)
$$

となる。区間になるのは文字列の長さであり、終点の集合自体は連続していなくてもよい。

各長さの文字列は1つずつなので、異なる非空部分文字列の個数は

$$
\sum_{v \ne \mathrm{root}}
\left(\operatorname{len}(v) - \operatorname{len}(\operatorname{link}(v))\right)
$$

で求められる。

### 末尾に1文字追加する

文字 `c` を追加して新しく生じる区間は、新しい末尾で終わる接尾辞だけである。追加前に存在しなかった接尾辞は、全て新しい終点だけを持つので、1つの状態 `cur` にまとめる。

1. `cur` を作り、`len[cur] = len[last] + 1` とする。
2. `p = last` から `link` をたどる。`c` の遷移がない間は `next[p][c] = cur` を追加する。同じ状態に入っている接尾辞はまとめて扱える。
3. root を越えて `p == -1` になったら、非空の既出接尾辞はないので `link[cur] = 0` とする。
4. 既存の遷移を見つけたら、`q = next[p][c]`、$L = \operatorname{len}(p) + 1$ とする。$L$ は、新しい文字列の接尾辞のうち、追加前から存在したものの最大長になる。
   - $L = \operatorname{len}(q)$：`q` の最長までが新しい末尾で終わるので、`link[cur] = q` とする。
   - $L < \operatorname{len}(q)$：`q` の短い側だけ終点が増えるので、`clone` を作って分割する。
5. `last = cur` とする。

既存の遷移を見つけたところで最初のループを止められるのは、それより短い接尾辞も既に存在するため。

### clone による状態の分割

`ab` に `b` を追加する場合、元は同じ状態 `q` に入っていた `b` と `ab` の終点集合が異なるようになる。

| 文字列 | `ab` での endpos | `abb` での endpos | 分割後の状態 |
| --- | --- | --- | --- |
| `b` | $\{2\}$ | $\{2,3\}$ | `clone` |
| `ab` | $\{2\}$ | $\{2\}$ | `q` |

新しい文字列の接尾辞になった短い側を `clone` に移し、長い側を `q` に残す。文字列の一覧を直接移すのではなく、到達する経路と `link` を変更して分割する。

1. `q` をコピーして `clone` を作り、`len[clone] = L` とする。元の `next` と `link` は引き継ぐ。
2. `p` から `link` をたどり、`next[p][c] == q` の間、その行き先を `clone` に変更する。
3. `link[q] = clone` とする。長い側の次に短い接尾辞グループは、分割した短い側になる。
4. `link[cur] = clone` とする。新しく現れた接尾辞の次に短い既出グループも、短い側になる。

上の例では、root から `b` を読む遷移を `clone` に変更し、`ab` を読む経路は `q` に残す。`cur` は `bb` と `abb` を表し、`q` と `cur` の `link` はともに `b` を表す `clone` に向かう。

`next` をコピーできるのは、分割前からあった終点では右に続く文字列が共通で、新しく加わった終点は末尾なので、その先の文字がまだないため。

## 計算量

文字列の長さを $N$、検索する文字列の長さを $M$ とする。以下は、アルファベットの種類数が定数で、遷移を配列で保持する場合。

| 操作 | 計算量 |
| --- | --- |
| 全体の構築 | $O(N)$ |
| 1文字追加 | 償却 $O(1)$、1回の最悪は $O(N)$ |
| 使用空間 | $O(N)$ |
| 部分文字列の存在判定 | $O(M)$ |
| 異なる部分文字列の個数 | 構築後に $O(N)$ |

1文字の追加で作る状態は `cur` と高々1つの `clone` なので、状態数は $O(N)$。構築時間は、suffix link の走査と遷移の追加・付け替えを全体で償却解析すると $O(N)$ になる。各 `while` が毎回定数回で終わるという意味ではない。

## 実装

英小文字 `a`〜`z` を対象とし、`vector`・`array`・`string` を使用する。状態の文字列一覧や endpos は保持せず、`len`・`link`・`next` のみを保持する。

- `extend(c)`：現在の文字列の末尾に `c` を追加する。
- `build(s)`：`s` の各文字を順に追加する。再初期化はしないので、別の文字列を構築するときは新しいインスタンスを作る。
- 部分文字列を検索するときは、root から `next` をたどり、途中に `-1` があれば存在しない。

```cpp
struct suffix_automaton {
    struct state {
        int len;
        int link;
        array<int, 26> next;

        state() : len(0), link(-1) {
            next.fill(-1);
        }
    };

    vector<state> st;
    int last;

    suffix_automaton() {
        st.emplace_back(); // root = 0
        last = 0;
    }

    void extend(char ch) {
        int c = ch - 'a';

        // 今回初めて現れる接尾辞をまとめる状態
        int cur = st.size();
        st.emplace_back();

        st[cur].len = st[last].len + 1;

        int p = last;

        // 古い接尾辞のグループをたどり、未出現の遷移を追加
        while (p != -1 && st[p].next[c] == -1) {
            st[p].next[c] = cur;
            p = st[p].link;
        }

        // 非空の既出接尾辞がない
        if (p == -1) {
            st[cur].link = 0;
        }

        else {
            int q = st[p].next[c];

            // q の最長までが新しい末尾で終わる
            if (st[p].len + 1 == st[q].len) {
                st[cur].link = q;
            }

            // q の短い側だけ終点が増えるので分割
            else {
                int clone = st.size();

                // 続きの遷移と元の suffix link を引き継ぐ
                st.push_back(st[q]);

                // clone が表す短い側の最大長
                st[clone].len = st[p].len + 1;

                // 短い文字列を読む経路だけ clone に向ける
                while (p != -1 && st[p].next[c] == q) {
                    st[p].next[c] = clone;
                    p = st[p].link;
                }

                // 長い側と新しい接尾辞の link を短い側へ向ける
                st[q].link = clone;
                st[cur].link = clone;
            }
        }

        // 現在の文字列全体を含む状態
        last = cur;
    }

    void build(const string& s) {
        for (char c : s) {
            extend(c);
        }
    }
};
```
