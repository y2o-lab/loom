import { ButtonLink } from "./button-link";

export type HeroProps = { eyebrow: string; title: string; description: string; ctaLabel: string; ctaHref: string };

export function Hero({ eyebrow, title, description, ctaLabel, ctaHref }: HeroProps) {
  return <section className="loom-hero"><div className="loom-hero__inner">
    <p className="loom-hero__eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>
    <ButtonLink href={ctaHref} tone="primary">{ctaLabel}</ButtonLink>
  </div></section>;
}
