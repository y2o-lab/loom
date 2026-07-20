import { ButtonLink } from "@/components/ui/button-link";
import { FeatureCard } from "@/components/ui/feature-card";
import type { FreeformItem } from "./document";

export const componentRegistry = {
  FeatureCard: {
    label: "Feature card",
    source: "@/components/ui/feature-card",
    canvas: true,
    render: (item: FreeformItem) => <FeatureCard {...item.props} />,
  },
  Copy: {
    label: "Copy",
    source: "application component",
    canvas: false,
    render: ({ text, emphasis }: { text: string; emphasis: "default" | "muted" }) => (
      <p className={`loom-copy ${emphasis === "muted" ? "loom-copy--muted" : ""}`}>{text}</p>
    ),
  },
  ButtonLink: {
    label: "Button link",
    source: "@/components/ui/button-link",
    canvas: false,
    render: ({ label, href, tone }: { label: string; href: string; tone: "primary" | "quiet" }) => (
      <ButtonLink href={href} tone={tone}>{label}</ButtonLink>
    ),
  },
} as const;
