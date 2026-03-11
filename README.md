# Markdown Editor

Obsidian にインスパイアされた、ライブプレビュー付きマークダウンエディタです。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![CodeMirror](https://img.shields.io/badge/CodeMirror-6-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## 特徴

### ライブプレビュー

Obsidian と同じ **Live Preview** 方式を採用しています。

- **カーソルがある行** → マークダウン記法をそのまま表示
- **カーソルがない行** → レンダリングされた見た目で表示

`#`、`**`、`*`、`` ` ``、`[text](url)` などの構文記号がカーソル移動に応じて表示/非表示に切り替わります。

### 3つのビューモード

| モード | 説明 |
|--------|------|
| **ライブ** | ライブプレビュー（デフォルト） |
| **ソース** | マークダウン記法をすべてそのまま表示 |
| **分割** | 左にエディタ、右にプレビューを並べて表示（スクロール同期） |

### キーボードショートカット

| ショートカット | 操作 |
|----------------|------|
| `Cmd+B` | **太字**トグル |
| `Cmd+I` | *イタリック*トグル |
| `Cmd+E` | `インラインコード`トグル |
| `Cmd+K` | リンク挿入 |

### ドキュメント管理

- 複数ドキュメントの作成・切替・削除
- ブラウザの localStorage に自動保存（500ms デバウンス）
- 内容の先頭行からタイトルを自動抽出
- 削除できないサンプルドキュメント（マークダウン記法ガイド）を内蔵

### その他

- ダークモード / ライトモード切替
- 日本語 IME 対応
- レスポンシブ対応（小画面では分割時に縦並び）
- GFM（GitHub Flavored Markdown）対応：テーブル、取り消し線など
- コードブロックのシンタックスハイライト

## 技術スタック

| カテゴリ | ライブラリ |
|----------|-----------|
| フレームワーク | [Next.js 16](https://nextjs.org/)（App Router） |
| エディタエンジン | [CodeMirror 6](https://codemirror.net/) |
| プレビュー | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm + rehype-highlight |
| スタイリング | CSS 変数 + [Tailwind CSS 4](https://tailwindcss.com/) |
| 言語 | TypeScript 5 |

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## プロジェクト構成

```
app/
  layout.tsx           ← ルートレイアウト（メタデータ、ダークモード）
  page.tsx             ← Editor コンポーネントをレンダリング
  globals.css          ← テーマ変数、CodeMirror カスタム CSS

components/
  Editor.tsx           ← メインオーケストレーター（状態管理、スクロール同期）
  CodeMirrorEditor.tsx ← CodeMirror 6 ラッパー
  MarkdownPreview.tsx  ← react-markdown ベースのプレビューペイン
  Toolbar.tsx          ← ビューモード切替、テーマ切替
  Sidebar.tsx          ← ドキュメント一覧、新規作成、削除

lib/
  documents.ts         ← ドキュメントモデル、localStorage 永続化
  codemirror/
    setup.ts           ← エクステンション構成
    theme.ts           ← ダーク/ライトテーマ、シンタックスハイライト
    live-preview.ts    ← ライブプレビュー ViewPlugin
    keybindings.ts     ← フォーマットショートカット
```

## ライブプレビューの仕組み

CodeMirror 6 の `ViewPlugin` + `Decoration.mark` で実装しています。

1. `syntaxTree(state).iterate()` でマークダウンの構文木を走査
2. カーソルがある行のノードはスキップ（raw 表示を維持）
3. カーソルがない行のノードに対して：
   - 構文記号（`#`, `**`, `` ` `` など）→ `cm-hide-syntax` クラスで CSS 非表示
   - テキスト部分 → `cm-rendered-bold` 等のクラスでスタイル適用

`Decoration.replace`（DOM 削除）ではなく `Decoration.mark`（CSS 非表示）を使用することで、日本語 IME との互換性を確保しています。

## ライセンス

MIT
