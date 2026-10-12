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
        <div className="loom-library-buttons"><Link href="/compose">ページ編集に戻る</Link><Link href="/editor">Frame編集に戻る</Link></div>
      </nav>
      <DocumentRenderer document={document} />
    </div>
  );
}
