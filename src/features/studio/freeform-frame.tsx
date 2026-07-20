"use client";

import { useRef, useState } from "react";
import { componentRegistry } from "./component-registry";
import type { FreeformFrame, FreeformItem, Placement } from "./document";

type Interaction = {
  itemId: string;
  mode: "drag" | "resize";
  origin: Placement;
  pointerId: number;
  startX: number;
  startY: number;
};

type FreeformFrameProps = {
  frame: FreeformFrame;
  editing?: boolean;
  selectedId?: string | null;
  onAdd?: () => void;
  onChangeItem?: (itemId: string, placement: Placement) => void;
  onSelect?: (itemId: string) => void;
};

const grid = 8;
const snap = (value: number) => Math.round(value / grid) * grid;

function constrain(placement: Placement, frameWidth: number, frameHeight: number): Placement {
  const width = Math.min(Math.max(160, placement.width), frameWidth);
  const height = Math.min(Math.max(120, placement.height), frameHeight);
  return {
    width,
    height,
    x: Math.min(Math.max(0, snap(placement.x)), Math.max(0, frameWidth - width)),
    y: Math.min(Math.max(0, snap(placement.y)), Math.max(0, frameHeight - height)),
  };
}

export function FreeformFrame({ frame, editing = false, onAdd, onChangeItem, onSelect, selectedId }: FreeformFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const draftRef = useRef<Record<string, Placement>>({});
  const [localSelection, setLocalSelection] = useState<string | null>(null);
  const [draftPlacement, setDraftPlacement] = useState<Record<string, Placement>>({});
  const selection = selectedId ?? localSelection;

  const select = (itemId: string) => {
    setLocalSelection(itemId);
    onSelect?.(itemId);
  };

  const begin = (event: React.PointerEvent<HTMLElement>, item: FreeformItem, mode: Interaction["mode"]) => {
    if (!editing || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = {
      itemId: item.id,
      mode,
      origin: draftPlacement[item.id] ?? item.placement,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    select(item.id);
  };

  const update = (event: React.PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    const width = containerRef.current?.clientWidth ?? interaction.origin.width;
    const next = interaction.mode === "drag"
      ? { ...interaction.origin, x: interaction.origin.x + deltaX, y: interaction.origin.y + deltaY }
      : { ...interaction.origin, width: interaction.origin.width + deltaX, height: interaction.origin.height + deltaY };

    const constrained = constrain(next, width, frame.props.height);
    draftRef.current = { ...draftRef.current, [interaction.itemId]: constrained };
    setDraftPlacement(draftRef.current);
  };

  const finish = (event: React.PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    const next = draftRef.current[interaction.itemId] ?? interaction.origin;
    interactionRef.current = null;
    const { [interaction.itemId]: _, ...remaining } = draftRef.current;
    draftRef.current = remaining;
    setDraftPlacement(remaining);
    onChangeItem?.(interaction.itemId, next);
  };

  return (
    <div className={editing ? "loom-frame-editor" : undefined}>
      {editing ? (
        <aside aria-label="Canvas component library" className="loom-frame-editor__library">
          <p>COMPONENT LIBRARY</p>
          <button className="loom-library-item" onClick={onAdd} type="button">
            <span>UI</span>
            <strong>Feature card</strong>
            <small>Add to the frame</small>
          </button>
          <span>登録済みコンポーネントだけを追加できます。</span>
        </aside>
      ) : null}
      <div
        className="loom-freeform-frame"
        data-editing={editing || undefined}
        onPointerMove={update}
        onPointerUp={finish}
        ref={containerRef}
        style={{ height: frame.props.height }}
      >
        <div className="loom-freeform-frame__grid" aria-hidden="true" />
        <div className="loom-freeform-frame__label">{frame.props.label}</div>
        {frame.items.map((item) => {
          const placement = draftPlacement[item.id] ?? item.placement;
          return (
            <div
              className="loom-freeform-frame__item"
              data-selected={selection === item.id || undefined}
              data-testid={`frame-item-${item.id}`}
              key={item.id}
              onPointerDown={(event) => begin(event, item, "drag")}
              style={{
                height: placement.height,
                left: placement.x,
                top: placement.y,
                width: placement.width,
              }}
            >
              {componentRegistry.FeatureCard.render(item)}
              {editing ? (
                <button
                  aria-label={`${item.props.title}をリサイズ`}
                  className="loom-freeform-frame__resize-handle"
                  onPointerDown={(event) => begin(event, item, "resize")}
                  type="button"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
