"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { loadDocument } from "./document-storage";
import { DocumentRenderer } from "./document-renderer";

const emptySubscribe = () => () => {};

export function DraftPreview() {
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const document = useMemo(() => (isHydrated ? loadDocument() : null), [isHydrated]);

  if (!document) return <div className="loom-loading">Loading preview…</div>;

  return (
    <div className="loom-preview-shell">
      <nav className="loom-preview-nav">
        <span>LOOM / PREVIEW</span>
        <Link href="/editor">編集に戻る</Link>
      </nav>
      <DocumentRenderer document={document} />
    </div>
  );
}
