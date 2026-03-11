export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  readOnly?: boolean;
}

const STORAGE_KEY = "md-editor-documents";
const ACTIVE_KEY = "md-editor-active-doc";

export const SAMPLE_DOC_ID = "__sample__";

export const SAMPLE_CONTENT = `# マークダウン記法ガイド

このドキュメントでは、エディタで使えるマークダウンの記法を紹介します。
各行にカーソルを合わせると、元のマークダウン記法が確認できます。

---

## 見出し

見出しは \`#\` の数で、レベル1〜6まで指定できます。

# 見出し1
## 見出し2
### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6

---

## テキストの装飾

**太字**のテキスト（Cmd+B）

*イタリック*のテキスト（Cmd+I）

***太字かつイタリック***のテキスト

~~取り消し線~~のテキスト

---

## リンク

[表示テキスト](https://example.com)の形式でリンクを作成できます（Cmd+K）。

---

## リスト

### 箇条書きリスト

- りんご
- みかん
  - 温州みかん
  - デコポン
- ぶどう

### 番号付きリスト

1. 最初の項目
2. 次の項目
3. 最後の項目

---

## インラインコード

文中に\`console.log("Hello")\`のようにコードを埋め込めます（Cmd+E）。

---

## コードブロック

バッククォート3つで囲むと、コードブロックになります。

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

\`\`\`python
def hello(name):
    print(f"こんにちは、{name}さん！")

hello("世界")
\`\`\`

---

## 引用

> これは引用文です。
> 複数行にまたがることもできます。

> ネストされた引用
> > 二重の引用

---

## テーブル

| 機能 | ショートカット | 説明 |
|------|--------------|------|
| 太字 | Cmd+B | **太字**にする |
| 斜体 | Cmd+I | *イタリック*にする |
| コード | Cmd+E | \`インラインコード\`にする |
| リンク | Cmd+K | [リンク]()を挿入する |

---

## 水平線

3つ以上のハイフン \`---\` で水平線を引けます。

---

## 日本語IMEサポート

日本語入力モード（IME）のままマークダウン記号を入力できます。
全角で入力しても、自動的に半角に変換されます。

| 入力（全角） | 変換（半角） | 用途 |
|------------|------------|------|
| ＃ | # | 見出し |
| ＊ | * | 太字・イタリック |
| － | - | リスト・水平線 |
| ＞ | > | 引用 |
| ｀ | \` | コード |
| ｜ | \\| | テーブル |
| ［ ］ | [ ] | リンク |
| （ ） | ( ) | リンク |
| ～ | ~ | 取り消し線 |

例：IMEオンのまま「＃＃ 見出し」と入力すると、自動で「## 見出し」に変換されます。

---

## ビューモードの使い分け

- **ライブ**: カーソル行はマークダウン記法を表示、他の行はレンダリング表示
- **ソース**: すべての行でマークダウン記法をそのまま表示
- **分割**: 左にエディタ、右にプレビューを並べて表示

上部のツールバーで切り替えてみてください！
`;

export function getSampleDocument(): Document {
  return {
    id: SAMPLE_DOC_ID,
    title: "マークダウン記法ガイド",
    content: SAMPLE_CONTENT,
    createdAt: 0,
    updatedAt: 0,
    readOnly: true,
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDocuments(docs: Document[]): void {
  // サンプルドキュメントはlocalStorageに保存しない
  const filtered = docs.filter((d) => d.id !== SAMPLE_DOC_ID);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function loadActiveDocId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveDocId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function createDocument(title?: string): Document {
  const now = Date.now();
  return {
    id: generateId(),
    title: title || "無題",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function extractTitle(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.slice(2).trim();
    }
    if (trimmed.length > 0 && !trimmed.startsWith("#")) {
      return trimmed.slice(0, 50) || "無題";
    }
  }
  return "無題";
}
