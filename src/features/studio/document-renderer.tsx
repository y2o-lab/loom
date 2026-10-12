"use client";

import { Hero } from "@/components/ui/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { renderGridItem } from "./component-registry";
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
  return <main className="loom-page" data-theme={document.root.theme}>
    {document.content.map(node => {
      const content = node.type === "Hero" ? <Hero {...node.props} /> : (
        <section className="loom-section" id={node.id}><div className="loom-section__inner">
          <SectionHeading {...node.props} />
          {node.layout.type === "Grid" ? (
            <div className={`loom-grid loom-grid--${node.layout.props.columns}`}>
              {node.layout.items.map(item => editing ? (
                <div className="loom-editable-item" data-selected={selectedId === item.id || undefined} key={item.id}>
                  <button className="loom-edit-item-button" onClick={() => onSelect?.(item.id)} type="button" aria-label={`${item.type}を編集`}>編集</button>
                  {renderGridItem(item)}
                </div>
              ) : <div key={item.id}>{renderGridItem(item)}</div>)}
              {editing && node.layout.items.length === 0 ? <div className="loom-empty-grid">左のライブラリから部品を追加してください。</div> : null}
            </div>
          ) : <FreeformFrame editing={editing} frame={node.layout} onAdd={() => onAddToFrame?.(node.layout.id)}
            onChangeItem={(itemId, placement) => onChangeFrameItem?.(node.layout.id, itemId, placement)} onSelect={onSelect} selectedId={selectedId} />}
        </div></section>
      );
      return editing ? <div className="loom-editable-block" key={node.id} data-selected={selectedId === node.id || undefined}>
        <button className="loom-block-edit" onClick={() => onSelect?.(node.id)} type="button">{node.type === "Hero" ? "Heroを編集" : "セクションを編集"}</button>
        {content}
      </div> : <div key={node.id}>{content}</div>;
    })}
  </main>;
}
