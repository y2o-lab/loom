# Loom Studio 引き継ぎ書

更新日: 2026-07-20

## 1. このプロジェクトが作ろうとしているもの

**Loom Studio** は、既存のReactコンポーネントライブラリを安全に登録し、視覚的にページを組み立てるためのOSSスターターである。

- `/editor` でページを編集する。
- `/preview` で、編集と同じdocument JSONを操作UIなしで表示する。
- 一般的なページ要素はGrid / Flowレイアウトで扱う。
- Figmaのような自由配置は、`FreeformFrame` の内部だけに限定する。
- 編集者は任意のHTML、JavaScript、npmパッケージを入力・実行できない。使用できるUIはregistryに明示登録したものだけである。

初期版の保存先はブラウザの`localStorage`であり、将来はアプリAPIとPostgreSQLに差し替える前提である。

## 2. 現在の到達点

最小コアは実装済みである。

| 項目 | 状態 | 実装箇所 |
| --- | --- | --- |
| ページ編集画面 | 完了 | `src/features/studio/studio.tsx`、`src/app/editor/page.tsx` |
| 公開用プレビュー | 完了 | `src/features/studio/draft-preview.tsx`、`src/app/preview/page.tsx` |
| component registry | 完了 | `src/features/studio/component-registry.tsx` |
| Frame内の追加・ドラッグ・リサイズ | 完了 | `src/features/studio/freeform-frame.tsx` |
| document schema / runtime validation | 完了 | `src/features/studio/document.ts` |
| ローカル保存・復元 | 完了 | `src/features/studio/document-storage.ts` |
| schema単体テスト | 完了 | `src/features/studio/document.test.ts` |
| ドラッグからpreview反映までのE2E | 完了 | `tests/e2e/studio.spec.ts` |

## 3. 技術構成と採用理由

| 領域 | 採用 | 理由 |
| --- | --- | --- |
| アプリ | Next.js 16.2 / React 19.2 / TypeScript | エディタ・プレビュー・将来の認証/保存APIを一つのOSSとして提供できる。 |
| document validation | Valibot 1.4.2 | schemaを型の信頼源にでき、Valibot自体の依存がなく、runtime validationを小さく維持できる。 |
| ドラッグ・リサイズ | ブラウザ標準Pointer Events | `setPointerCapture`でマウス・タッチ・ペンを扱い、エディタ専用依存を持たない。 |
| unit test | Vitest 4.1（開発依存） | document schema、migration、将来の配置計算を高速に検証する。 |
| E2E test | Playwright 1.61（開発依存） | Pointer Events、localStorage、画面遷移を実ブラウザで検証する。 |

### 明示的に採用しないもの

- **Puck**: document modelやページビルダーのライフサイクルを外部実装に依存させない。
- **`react-moveable`**: 更新停止期間が長く、長期保守するOSSの負債になりうるため採用しない。
- `dnd-kit`などのドラッグ専用ライブラリ: 現時点では標準Pointer Eventsで必要な挙動を小さく実装できる。
- Zustand / Redux / Immer: stateがまだ小さいためReact stateで管理する。複雑さが実際に増えるまで追加しない。
- Zodなど別のvalidator: Valibotをschemaの唯一の信頼源とする。

## 4. アーキテクチャ

```text
既存のReact UIライブラリ
        │ build-time import
        ▼
component registry
        │
        ▼
Valibot schemaを正本とするdocument JSON
        │                         │
        ▼                         ▼
/editor                       /preview
Pointer Events                同じregistryで描画
        │
        ▼
localStorage（初期版） → API / PostgreSQL（将来）
```

### document model

許可される構造は次に固定されている。

```text
Page
├── Hero
└── Section
    ├── Grid
    │   ├── FeatureCard
    │   ├── Copy
    │   └── ButtonLink
    └── FreeformFrame
        └── FeatureCard（placementを持つ）
```

`src/features/studio/document.ts` の `studioDocumentSchema` が型と実行時検証の正本である。保存・復元時は必ず `parseStudioDocument` を経由する。

### 編集操作の実装

`FreeformFrame` は以下を行う。

- libraryから許可済みの`FeatureCard`を追加する。
- アイテムをPointer Eventsでドラッグする。
- 右下ハンドルでリサイズする。
- `x` / `y`は8pxグリッドにスナップする。
- 最小サイズとFrame境界への収まりを操作時に保証する。
- 配置変更は親の`Studio`がdocumentへ書き戻し、`localStorage`へ保存する。

## 5. 開発・検証方法

必要環境はmiseで管理するNode.js 22.14.0、pnpm 11.15.0である。初回は以下を実行する。

```bash
mise install
```

その後、依存関係を導入して開発サーバーを起動する。

```bash
pnpm install
pnpm dev
```

- `http://localhost:3000` — 入口
- `http://localhost:3000/editor` — エディタ
- `http://localhost:3000/preview` — 現在の下書きのプレビュー

品質確認は次を実行する。

```bash
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
```

Playwrightを初めて実行する環境では、先にChromiumを取得する。

```bash
pnpm exec playwright install chromium
```

直近では、上記の全コマンドが成功している。

- Vitest: 3件成功（seed documentの受理、version不正の拒否、範囲外配置の拒否）
- Playwright: 1件成功（ドラッグ → 8pxスナップ → localStorage保存 → `/preview`への反映）
- lint / typecheck / production build: 成功

## 6. 次に進める優先順位

1. **adapter APIの公開**
   - 外部UIライブラリのcomponent type、props schema、editor inspector、rendererを一つのadapterとして登録できる公開APIにする。
   - 現在の`component-registry.tsx`を最初の実装例として分離する。

2. **document migration**
   - `version`ごとの純粋関数migrationを作る。
   - 破壊的なschema変更ではversion更新とmigrationを必須にする。
   - Vitestで旧documentから新documentへのmigrationケースを追加する。

3. **公開前の品質ゲート**
   - `href`、見出し階層、画像のalt、overflowを検査する。
   - Playwrightでリサイズ、Frame境界、追加、狭いビューポートのケースを増やす。
   - 必要になった時点でvisual regressionをCIへ追加する。

4. **保存・認証・公開revision**
   - `document-storage.ts`をAPI実装に差し替える。
   - page / revision / publish state / registry versionを永続化する。
   - 認証とロールを導入する。

5. **共同編集（要件化した場合のみ）**
   - CRDTなどの追加依存を検討する。
   - 現段階では導入しない。先にrevision、権限、操作履歴の要件を確定する。

## 7. 守るべき不変条件

- production dependencyはNext.js、React、React DOM、Valibotだけに抑える。テストツールはdevDependencyに限定する。
- editorとpreviewは、必ず同じdocument modelとregistry versionを使う。
- 自由配置を`FreeformFrame`外へ広げない。通常ページはレスポンシブなFlow / Gridを保つ。
- 編集者入力から任意HTML、任意スクリプト、任意npmパッケージを実行しない。
- schemaの破壊的変更はdocument versionとmigrationを同時に追加する。
- 新しい依存は「React/Nextだけでは実現困難で、運用コストより保守性の利益が大きい」場合だけに追加する。

## 8. 注意点・未解決事項

- `localStorage`は単一ブラウザ用であり、共有・権限・revision・公開状態を扱わない。
- 現在のschemaはplacementの数値範囲を検証する。実際のFrame幅はビューポートにより変わるため、Frame内へのclampは編集操作時に行っている。
- 8pxスナップは現在`x` / `y`に適用している。`width` / `height`もスナップするかは、期待するリサイズUXを決めたうえで明示的に実装・テストする。
- `data-testid`はPlaywrightの安定したテストセレクタとして`FreeformFrame`のアイテムにのみ追加している。
- リポジトリ内のプロジェクトファイルは現在すべて未コミットである。最初の共有前に、生成物を除外したうえで意図的な初回コミットを作成する。

## 9. 参照先

- 技術判断の詳細: `docs/tech-selection.md`
- 導入・起動方法: `README.md`
- document schema: `src/features/studio/document.ts`
- 編集操作: `src/features/studio/freeform-frame.tsx`
- テスト設定: `vitest.config.ts`、`playwright.config.ts`

## 2026-10-12: UIライブラリからのページ作成フロー

- `/library`に同じアプリ内のReactコンポーネント一覧を追加した。Hero、SectionHeading、FeatureCard、Copy、ButtonLinkを表示する。
- `/compose`で新しいHeroページの作成、Gridセクション追加、登録部品の追加、Inspectorによる文言・リンク編集、2/3列設定、テーマ選択ができる。
- セクションIDを編集してページ内リンクを設定できる。空白・ページ内の重複IDは拒否する。
- Gridもcomponent registry経由で描画し、Hero・SectionHeadingも共有UIを使う。編集画面とプレビューの描画を共通化した。
- 既存の`/editor`はFrame編集用として残している。`/compose`も既存Frameの配置変更を保存できる。
- 保存先は従来と同じ単一のlocalStorage下書き。「新しいページ」は現在の下書きを置き換える。複数ページ保存、Undo、公開機能は未実装。
- E2Eを1件追加し、ライブラリから作成、部品編集、保存復元、テーマ、プレビュー、ページ内リンクを検証する。既存のドラッグE2Eも維持する。
- `scripts/record-composition.cjs`で独立したブラウザセッションの実操作を録画できる。ローカル開発サーバー、Chromium、ffmpegが必要。生成先は`artifacts/loom-page-composition.mp4`。

## 2026-10-12: レイアウトを組み合わせるフォームビルダー

- 共有UIにGrid / Stack / Row / PanelとHeader、Input、Select、Textarea、Checkbox、Button、Noticeを追加。フォーム編集とプレビューで同じ部品を描画する。
- `/form-components`で部品の見た目を確認し、`/form-builder`で入れ子のレイアウトを構成できる。構成ツリー、追加先表示、Inspector、兄弟部品の順序変更・削除に対応する。
- フォームのdocumentはページモデルと別のversion 1として保存する。既存のページ下書きは変更しない。保存キーは`loom-studio:form:v1`。
- recursive Valibot schemaを使い、検証前に深さ・総部品数を制限する。IDと項目キーの重複、任意の未登録コンポーネントを拒否する。
- `/form-preview`で実入力、必須チェック、メール形式検証、画面内の確認結果表示ができる。外部送信・フォーム回答のDB保存は未実装。
- Gridは640px以下で1列に切り替わる。Rowは折り返す。
- Unitは全7件、E2Eは全3件。フォームの入れ子、保存復元、無効入力、確認結果、スマートフォン幅を検証する。
- `scripts/record-form-composition.cjs`は19部品の参加申込フォームを実際のUI操作で組み立て、再読み込み・入力確認まで録画する。出力先は`artifacts/loom-form-composition.mp4`。`LOOM_RECORD_FAST=1`で高速な通し検証も可能。
