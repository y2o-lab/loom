type ButtonLinkProps = {
  children: string;
  href: string;
  tone: "primary" | "quiet";
};

export function ButtonLink({ children, href, tone }: ButtonLinkProps) {
  return (
    <a className={`loom-button loom-button--${tone === "primary" ? "primary" : "secondary"}`} href={href}>
      {children}
    </a>
  );
}
