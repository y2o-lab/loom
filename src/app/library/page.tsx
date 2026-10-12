import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { FeatureCard } from "@/components/ui/feature-card";
import { Copy } from "@/components/ui/copy";
import { Hero } from "@/components/ui/hero";
import { SectionHeading } from "@/components/ui/section-heading";
export default function LibraryPage() {
 return <main className="loom-library-page"><nav className="loom-preview-nav"><span>LOOM / UI LIBRARY</span><Link href="/form-components">フォーム・レイアウト部品 →</Link><Link href="/compose">この部品でページをつくる →</Link></nav>
 <div className="loom-library-intro"><p className="loom-eyebrow">LOCAL COMPONENTS</p><h1>ひとつのアプリ、共通のUI。</h1><p>同じリポジトリの src/components/ui を、ライブラリ・編集画面・プレビューで共有しています。</p></div>
 <div className="loom-library-gallery"><section><header><h2>FeatureCard</h2><code>src/components/ui/feature-card.tsx</code></header><FeatureCard icon="UI" title="一貫したデザイン" description="アイコン、見出し、説明を組み合わせた再利用可能なカード。GridにもFrameにも配置できます。"/></section>
 <section><header><h2>ButtonLink</h2><code>src/components/ui/button-link.tsx</code></header><div className="loom-library-buttons"><ButtonLink href="/compose" tone="primary">ページをつくる</ButtonLink><ButtonLink href="/compose" tone="quiet">詳しく見る</ButtonLink></div></section>
 <section><header><h2>Copy</h2><code>src/components/ui/copy.tsx</code></header><Copy text="サービスの説明やメッセージを伝えるテキストコンポーネントです。" emphasis="default"/><Copy text="補足情報には muted スタイルを使えます。" emphasis="muted"/></section>
 <section className="loom-library-wide"><header><h2>Hero</h2><code>src/components/ui/hero.tsx</code></header><Hero eyebrow="LOOM DESIGN SYSTEM" title="アイデアを、ページに。" description="登録済みの部品を選び、内容を編集して、サービスのページを組み立てます。" ctaLabel="はじめる" ctaHref="/compose"/></section>
 <section className="loom-library-wide"><header><h2>SectionHeading + Grid</h2><code>src/components/ui/section-heading.tsx</code></header><SectionHeading eyebrow="FEATURES" title="組み合わせて使う" description="同じカードをGridで並べ、見出しと説明を添えてひとつのセクションに。"/><div className="loom-grid loom-grid--3">{["選ぶ","編集する","プレビュー"].map((title,index)=><FeatureCard key={title} icon={`0${index+1}`} title={title} description="共通のReactコンポーネントをそのまま利用します。"/>)}</div></section></div></main>;
}
