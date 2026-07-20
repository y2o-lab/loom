import Link from "next/link";

const principles = [
  ["Own your components", "既存の UI ライブラリを import し、見た目と振る舞いの正本を保ちます。"],
  ["Guard the layout", "Section / Grid / Stack と slot の許可リストで、ページ構造を壊させません。"],
  ["Publish the same document", "エディタが保存する JSON を、同じ設定でそのまま公開ページへ描画します。"],
];

export default function Home() {
  return (
    <main className="loom-home">
      <section className="loom-home__hero">
        <p className="loom-eyebrow">LOOM STUDIO / INITIALIZED</p>
        <h1>既存コンポーネントで、<br />自由と秩序を両立する。</h1>
        <p className="loom-home__lead">
          React とブラウザ標準APIだけで、アプリに組み込めるページビルダーを初期化しました。
          UI は実装済みの React コンポーネントから作り、構造は document model で守ります。
        </p>
        <div className="loom-home__actions">
          <Link className="loom-button loom-button--primary" href="/editor">編集画面を開く</Link>
          <Link className="loom-button loom-button--secondary" href="/preview">公開プレビューを見る</Link>
        </div>
      </section>

      <section className="loom-principles" aria-label="設計原則">
        {principles.map(([title, body], index) => (
          <article className="loom-principle" key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
