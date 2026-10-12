export function Copy({ text, emphasis }: { text: string; emphasis: "default" | "muted" }) {
  return <p className={`loom-copy ${emphasis === "muted" ? "loom-copy--muted" : ""}`}>{text}</p>;
}
