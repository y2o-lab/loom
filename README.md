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
