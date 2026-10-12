import type { ReactNode } from "react";

type LayoutProps = { children: ReactNode; gap?: "compact" | "normal" | "relaxed" };
export function Grid({ children, gap = "normal", columns = 2 }: LayoutProps & { columns?: 1 | 2 | 3 }) {
  return <div className="loom-layout-grid" data-gap={gap} data-columns={columns}>{children}</div>;
}
export function Stack({ children, gap = "normal" }: LayoutProps) {
  return <div className="loom-layout-stack" data-gap={gap}>{children}</div>;
}
export function Row({ children, gap = "normal" }: LayoutProps) {
  return <div className="loom-layout-row" data-gap={gap}>{children}</div>;
}
export function Panel({ children, gap = "normal", label }: LayoutProps & { label: string }) {
  return <section className="loom-layout-panel" aria-label={label}><h2>{label}</h2><Stack gap={gap}>{children}</Stack></section>;
}
