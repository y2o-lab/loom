export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="loom-section__heading"><p className="loom-section__eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></header>;
}
