# 技術選定: Loom Studio（最小依存・Puck非採用）

更新日: 2026-07-19

## 決定

| 領域 | 採用 | 理由 |
| --- | --- | --- |
| アプリ基盤 | Next.js 16.2 + React 19.2 + TypeScript | 編集画面、公開レンダラー、認証・保存APIを一つのOSSとして提供できる。Next.js / Reactは本ツールのホスト・埋め込みの両方に必要な最小基盤。 |
| 編集操作 | ブラウザ標準 Pointer Events | `setPointerCapture` を使い、マウス・タッチ・ペンの移動とリサイズを一つの小さな実装で扱う。ドラッグ専用ライブラリの更新停止や依存の連鎖を避ける。 |
| スナップ・制約 | 自前の8pxグリッドと境界clamp | `x/y/width/height` を保存前にスナップし、Frameの親境界・最小サイズへ丸める。挙動がdocument modelと同じリポジトリにあり、変更理由を追跡できる。 |
| ページ構造 | 明示的なJSON document model | `Page → Hero / Section`、`Section → Grid / FreeformFrame`、`FreeformFrame → 登録済みcanvas部品` の階層をTypeScript型とruntime validatorで固定する。任意HTMLや任意コンポーネント階層を保存しない。 |
| runtime validation | Valibot 1.4.2 | document schemaを型の信頼源にする。MIT・依存なしで、型推論とtree-shakingを備えるため、OSSの公開境界・保存データ検証を小さく保守できる。 |
| テスト | Vitest + Playwright（開発依存） | Vitestでschema・migration・配置計算を高速に検証し、PlaywrightでPointer Events、localStorage、previewまでを実ブラウザで検証する。実行時バンドルには含めない。 |
| UIライブラリ統合 | 明示的なcomponent registry | 既存アプリのコンポーネントをビルド時にimportし、使用を許可するnode typeへ対応付ける。編集者が任意のnpm packageやURLを実行する経路を持たない。 |
| 保存 | 初期版: `localStorage`、本番: アプリAPI + PostgreSQL | 初期化後すぐ編集・プレビューを確認できる。公開revision、権限、共同編集はAPI実装へ差し替える。 |

## なぜページビルダー依存を置かないか

本プロジェクトは公開OSSとして長期保守する前提です。編集機能の核は、特定のページビルダーの内部データ構造やリリースサイクルに依存させません。

- 自由配置は `FreeformFrame` に閉じ、Pointer Eventsで `x/y/width/height` を直接更新する。
- 一般的なページは Grid / Flow レイアウトに残し、レスポンシブ性を保つ。
- 保存と公開は自前document modelだけを正本にするため、エディタ実装の交換や埋め込み先の変更が可能になる。
- 追加するUIは registry に明示登録したものだけで、アプリのデザインシステムを二重管理しない。

## 初期実装の構成

```text
existing React UI library
        │  build-time import
        ▼
component registry ──────────────┐
                                  ▼
typed + runtime-validated document JSON
                     │                 │
                     ▼                 ▼
             editor (/editor)    renderer (/preview)
             Pointer Events       same registry
```

`/editor`ではFrame内の登録済みFeature cardを追加し、ドラッグと右下のハンドルでリサイズできる。保存値は8pxグリッドにスナップし、Frame外へ出ないように制限される。`/preview`は同じJSONを編集用操作なしで描画する。

## 拡張方針

1. **完了: 最小コア** — Valibotによるdocument model、registry、Frame内の自由配置、runtime validation、ローカル保存、プレビュー。
2. **次: adapter APIの公開** — 外部UIライブラリ用に、component type・props validator・editor inspector・rendererを一つのadapterとして登録できる公開APIにする。
3. **次: document migration** — document versionごとの純粋関数migrationを追加し、公開済みページの互換性を守る。
4. **次: 共同利用** — page / revision / publish state / registry versionをPostgreSQLに保存し、認証とロールを追加する。
5. **進行中: 品質ゲート** — Vitestでschemaを、Playwrightでドラッグ・保存・プレビューを検証する。次にalt / href / heading hierarchy / overflow とvisual regressionをCIへ追加する。

## OSSとしての不変条件

- production dependencyは Next.js / React / React DOM と Valibot のみに抑える。テストツールはdevDependencyに限定する。
- editorとrendererは同じdocument modelとregistry versionを使う。
- document schemaの破壊的変更にはversionとmigrationを必須にする。
- 自由配置はFrame内だけに限定し、通常のページ要素へ絶対配置を広げない。
- 任意のnpm package・スクリプト・HTMLを編集者入力から実行しない。
