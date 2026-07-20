type FeatureCardProps = {
  description: string;
  icon: string;
  title: string;
};

export function FeatureCard({ description, icon, title }: FeatureCardProps) {
  return (
    <article className="loom-feature-card">
      <div aria-hidden="true" className="loom-feature-card__icon">{icon.slice(0, 2).toUpperCase()}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
