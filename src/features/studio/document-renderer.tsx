"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { FeatureCard } from "@/components/ui/feature-card";
import { FreeformFrame } from "./freeform-frame";
import type { FreeformItem, StudioDocument } from "./document";

type DocumentRendererProps = {
  document: StudioDocument;
  editing?: boolean;
  selectedId?: string | null;
  onAddToFrame?: (frameId: string) => void;
  onChangeFrameItem?: (frameId: string, itemId: string, placement: FreeformItem["placement"]) => void;
  onSelect?: (itemId: string) => void;
};

export function DocumentRenderer({ document, editing = false, onAddToFrame, onChangeFrameItem, onSelect, selectedId }: DocumentRendererProps) {
  return (
    <main className="loom-page" data-theme={document.root.theme}>
      {document.content.map((node) => {
        if (node.type === "Hero") {
          return (
            <section className="loom-hero" key={node.id}>
              <div className="loom-hero__inner">
                <p className="loom-hero__eyebrow">{node.props.eyebrow}</p>
                <h1>{node.props.title}</h1>
                <p>{node.props.description}</p>
                <ButtonLink href={node.props.ctaHref} tone="primary">{node.props.ctaLabel}</ButtonLink>
              </div>
            </section>
          );
        }

        return (
          <section className="loom-section" id={node.id} key={node.id}>
            <div className="loom-section__inner">
              <header className="loom-section__heading">
                <p className="loom-section__eyebrow">{node.props.eyebrow}</p>
                <h2>{node.props.title}</h2>
                <p>{node.props.description}</p>
              </header>
              {node.layout.type === "Grid" ? (
                <div className={`loom-grid loom-grid--${node.layout.props.columns}`}>
                  {node.layout.items.map((item) => {
                    if (item.type === "FeatureCard") return <FeatureCard key={item.id} {...item.props} />;
                    if (item.type === "Copy") return <p className={`loom-copy ${item.props.emphasis === "muted" ? "loom-copy--muted" : ""}`} key={item.id}>{item.props.text}</p>;
                    return <ButtonLink href={item.props.href} key={item.id} tone={item.props.tone}>{item.props.label}</ButtonLink>;
                  })}
                </div>
              ) : (
                <FreeformFrame
                  editing={editing}
                  frame={node.layout}
                  onAdd={() => onAddToFrame?.(node.layout.id)}
                  onChangeItem={(itemId, placement) => onChangeFrameItem?.(node.layout.id, itemId, placement)}
                  onSelect={onSelect}
                  selectedId={selectedId}
                />
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
