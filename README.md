# Loom Studio

既存の React コンポーネントライブラリを安全に登録し、視覚的にページを組み立てるためのスターターです。外部のページエディタライブラリには依存せず、React とブラウザ標準の Pointer Events だけで編集体験を構成します。documentの実行時検証には、依存を持たない Valibot を使用します。

## Start

必要なNode.jsとpnpmはmiseで管理します。miseを有効化したシェルで、最初にプロジェクトのツールを導入してください。

```bash
mise install
```

その後、依存関係を導入して開発サーバーを起動します。

```bash
pnpm install
pnpm dev
```

- `http://localhost:3000` — プロジェクトの入口
- `http://localhost:3000/editor` — ドラッグ&ドロップ編集画面
- `http://localhost:3000/library` — 同じアプリ内のUIコンポーネントライブラリ
- `http://localhost:3000/compose` — ライブラリからページを組み立てる画面
- `http://localhost:3000/preview` — 現在のローカル下書きをレンダリング

このスターターの保存先はブラウザの `localStorage` です。チーム利用・本番公開時は `src/features/studio/document-storage.ts` を API / DB 実装に差し替えてください。

## Register an existing UI library

ブラウザで任意の npm パッケージを動的に読み込む方式は採用しません。レビュー可能な adapter としてビルド時に import することで、安全性・再現性・公開ページとの一致を保ちます。

1. UI ライブラリをアプリに追加します。
2. `src/features/studio/component-registry.tsx` で対象コンポーネントを import します。
3. `src/features/studio/document.ts` の Valibot schema と明示的な document node を追加し、許可する親子関係とpropsを定義します。
4. `pnpm typecheck && pnpm build` で編集画面と公開レンダラーを同じ document model で検証します。

`ButtonLink` と `FeatureCard` は、その adapter の最小例です。`@/components/ui` の import を既存の `@acme/ui` や社内ライブラリ等へ置き換えてください。

詳しい判断と拡張方針は [docs/tech-selection.md](docs/tech-selection.md) を参照してください。

## Quality checks

```bash
pnpm test       # Valibot schema と document model の単体テスト
pnpm test:e2e   # Chromium上のドラッグ・保存・プレビューのE2Eテスト
```

初回のみPlaywrightのChromiumを取得します。

```bash
pnpm exec playwright install chromium
```

## UIライブラリからページを作る

`/library`で、同じリポジトリの`src/components/ui`にあるHero、SectionHeading、FeatureCard、Copy、ButtonLinkを確認できます。エディタとプレビューも同じReactコンポーネントを描画します。

1. ライブラリの「この部品でページをつくる」から`/compose`を開きます。
2. 「新しいページ」でHeroから開始し、右のInspectorで文言とリンクを編集して保存します。保存先は単一のローカル下書きで、現在の下書きが置き換わります。
3. Gridセクションを追加し、見出し・説明・列数・セクションIDを設定します。セクションIDは`#features`などのリンク先に使えます。
4. 左のライブラリからFeature card、Copy、Button linkを追加し、Inspectorで内容を編集します。
5. テーマを選び、Previewで表示を確認します。変更はブラウザに保存され、再読み込み後も復元されます。

「新しいページ」はHeroを含む最小ページを作ります。ページ編集にはまだUndoや複数ページ保存はありません。Gridの追加先は、選択したGridセクション（または選択部品の親Grid）です。Gridを選択していない場合は最初のGridになります。

### 操作フローの録画

開発サーバーを起動した状態で、PlaywrightのChromiumと`ffmpeg`が利用できれば以下を実行できます。

```bash
node scripts/record-composition.cjs
```

ライブラリ確認、Hero編集、3枚の特徴カード、本文とCTA、テーマ変更、再読み込み、プレビューまでを実際のUI操作で録画し、`artifacts/loom-page-composition.mp4`を生成します。録画用ブラウザは独立したセッションを使用します。

## レイアウトと部品を組み合わせてフォームを作る

- `/form-components` — Grid、Stack、Row、Panelとフォーム部品の共通ライブラリ
- `/form-builder` — 入れ子のレイアウトに部品を追加するフォーム編集画面
- `/form-preview` — 作ったフォームの入力・必須チェック・内容確認

構成ツリーで配置先のレイアウトを選び、左のライブラリから部品を追加します。Input、Select、Textarea、Checkbox、Buttonに加え、Header、Heading、Notice、Copy、Dividerが使えます。Inspectorでラベル、プレースホルダー、必須設定、入力形式、選択肢、列数、間隔を編集できます。兄弟部品の並べ替えと削除にも対応しています。

フォームは独立した`loom-studio:form:v1`下書きに保存され、ページの下書きとは別に復元します。プレビューではブラウザ標準の必須・メール形式検証を使い、入力内容を画面内で確認できます。外部への送信APIは接続していません。

フォームdocumentはValibotで検証し、項目キーとIDの重複、未登録の部品、過剰な入れ子を拒否します。最大80部品、深さ6、レイアウトごとに24部品です。

開発サーバー、Playwright Chromium、ffmpegが利用できる状態で、以下を実行するとサンプルの組み立てから実入力までを録画します。

```bash
node scripts/record-form-composition.cjs
```

出力は`artifacts/loom-form-composition.mp4`です。同じフローを録画せず高速に検証する場合は`LOOM_RECORD_FAST=1 node scripts/record-form-composition.cjs`を使えます。録画・検証用ブラウザは独立したセッションです。
