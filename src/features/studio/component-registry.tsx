import { ButtonLink } from "@/components/ui/button-link";
import { FeatureCard } from "@/components/ui/feature-card";
import { Copy } from "@/components/ui/copy";
import type { FeatureCardItem, CopyItem, ButtonLinkItem, Grid } from "./document";

export const componentRegistry = {
  FeatureCard: { label: "Feature card", source: "@/components/ui/feature-card", canvas: true,
    render: (item: FeatureCardItem) => <FeatureCard {...item.props} /> },
  Copy: { label: "Copy", source: "@/components/ui/copy", canvas: false,
    render: (item: CopyItem) => <Copy {...item.props} /> },
  ButtonLink: { label: "Button link", source: "@/components/ui/button-link", canvas: false,
    render: (item: ButtonLinkItem) => <ButtonLink href={item.props.href} tone={item.props.tone}>{item.props.label}</ButtonLink> },
} as const;

export function renderGridItem(item: Grid["items"][number]) {
  switch (item.type) {
    case "FeatureCard": return componentRegistry.FeatureCard.render(item);
    case "Copy": return componentRegistry.Copy.render(item);
    case "ButtonLink": return componentRegistry.ButtonLink.render(item);
  }
}
