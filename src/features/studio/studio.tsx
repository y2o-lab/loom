"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { componentRegistry } from "./component-registry";
import { createFrameCard, type FreeformFrame, type StudioDocument } from "./document";
import { loadDocument, saveDocument } from "./document-storage";
import { DocumentRenderer } from "./document-renderer";

const emptySubscribe = () => () => {};

function updateFrame(document: StudioDocument, frameId: string, update: (frame: FreeformFrame) => FreeformFrame) {
  return {
    ...document,
    content: document.content.map((node) => {
      if (node.type !== "Section" || node.layout.type !== "FreeformFrame" || node.layout.id !== frameId) return node;
      return { ...node, layout: update(node.layout) };
    }),
  };
}

export function Studio() {
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const initialDocument = useMemo(() => (isHydrated ? loadDocument() : null), [isHydrated]);
  const [document, setDocument] = useState<StudioDocument | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeDocument = document ?? initialDocument;

  const commit = (update: (current: StudioDocument) => StudioDocument) => {
    setDocument((current) => {
      const next = update(current ?? initialDocument!);
      saveDocument(next);
      return next;
    });
  };

  if (!activeDocument) return <div className="loom-loading">Loading studio…</div>;

  const selectedItem = activeDocument.content
    .flatMap((node) => node.type === "Section" && node.layout.type === "FreeformFrame" ? node.layout.items : [])
    .find((item) => item.id === selectedId);

  return (
    <div className="loom-studio-shell">
      <header className="loom-studio-header">
        <div>
          <strong>LOOM / CUSTOM STUDIO</strong>
          <span>Registry-driven page editor</span>
        </div>
        <Link href="/preview">Preview</Link>
      </header>
      <div className="loom-studio-workspace">
        <aside className="loom-studio-panel">
          <p>DOCUMENT RULES</p>
          <h2>Strict by model</h2>
          <ul>
            <li>Page → Hero / Section only</li>
            <li>Section → Grid or Freeform Frame</li>
            <li>Frame → registered canvas components</li>
          </ul>
          <p className="loom-studio-panel__source">REGISTRY</p>
          {Object.values(componentRegistry).map((component) => (
            <div className="loom-studio-registry-item" key={component.label}>
              <strong>{component.label}</strong>
              <span>{component.source}</span>
            </div>
          ))}
        </aside>
        <div className="loom-studio-canvas">
          <DocumentRenderer
            document={activeDocument}
            editing
            onAddToFrame={(frameId) => {
              commit((current) => updateFrame(current, frameId, (layout) => ({
                ...layout,
                items: [...layout.items, createFrameCard(layout.items.length)],
              })));
            }}
            onChangeFrameItem={(frameId, itemId, placement) => {
              commit((current) => updateFrame(current, frameId, (layout) => ({
                ...layout,
                items: layout.items.map((item) => item.id === itemId ? { ...item, placement } : item),
              })));
            }}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        </div>
        <aside className="loom-studio-panel loom-studio-panel--inspector">
          <p>INSPECTOR</p>
          {selectedItem ? (
            <>
              <h2>{selectedItem.props.title}</h2>
              <dl>
                <div><dt>X</dt><dd>{selectedItem.placement.x}px</dd></div>
                <div><dt>Y</dt><dd>{selectedItem.placement.y}px</dd></div>
                <div><dt>Width</dt><dd>{selectedItem.placement.width}px</dd></div>
                <div><dt>Height</dt><dd>{selectedItem.placement.height}px</dd></div>
              </dl>
            </>
          ) : <p className="loom-studio-panel__empty">Frame 内のカードを選択すると、配置情報を表示します。</p>}
        </aside>
      </div>
    </div>
  );
}
