import * as v from "valibot";

const text = (maxLength: number) => v.pipe(v.string(), v.minLength(1), v.maxLength(maxLength));
const identifier = text(120);

export const placementSchema = v.object({
  x: v.pipe(v.number(), v.minValue(0), v.maxValue(960)),
  y: v.pipe(v.number(), v.minValue(0), v.maxValue(960)),
  width: v.pipe(v.number(), v.minValue(160), v.maxValue(960)),
  height: v.pipe(v.number(), v.minValue(120), v.maxValue(720)),
});

export const featureCardSchema = v.object({
  id: identifier,
  type: v.literal("FeatureCard"),
  props: v.object({
    icon: text(4),
    title: text(80),
    description: text(240),
  }),
});

const copySchema = v.object({
  id: identifier,
  type: v.literal("Copy"),
  props: v.object({
    text: text(480),
    emphasis: v.picklist(["default", "muted"]),
  }),
});

const buttonLinkSchema = v.object({
  id: identifier,
  type: v.literal("ButtonLink"),
  props: v.object({
    label: text(48),
    href: text(512),
    tone: v.picklist(["primary", "quiet"]),
  }),
});

export const freeformItemSchema = v.object({
  ...featureCardSchema.entries,
  placement: placementSchema,
});

export const freeformFrameSchema = v.object({
  id: identifier,
  type: v.literal("FreeformFrame"),
  props: v.object({
    label: text(80),
    height: v.pipe(v.number(), v.minValue(360), v.maxValue(960)),
  }),
  items: v.pipe(v.array(freeformItemSchema), v.maxLength(12)),
});

const gridSchema = v.object({
  id: identifier,
  type: v.literal("Grid"),
  props: v.object({ columns: v.picklist([2, 3]) }),
  items: v.pipe(v.array(v.union([featureCardSchema, copySchema, buttonLinkSchema])), v.maxLength(12)),
});

const heroSchema = v.object({
  id: identifier,
  type: v.literal("Hero"),
  props: v.object({
    eyebrow: text(80),
    title: text(160),
    description: text(360),
    ctaLabel: text(48),
    ctaHref: text(512),
  }),
});

const sectionSchema = v.object({
  id: identifier,
  type: v.literal("Section"),
  props: v.object({
    eyebrow: text(80),
    title: text(120),
    description: text(360),
  }),
  layout: v.union([gridSchema, freeformFrameSchema]),
});

export const studioDocumentSchema = v.object({
  version: v.literal(1),
  root: v.object({
    title: text(120),
    description: text(360),
    theme: v.picklist(["light", "ink", "sand"]),
  }),
  content: v.pipe(v.array(v.union([heroSchema, sectionSchema])), v.minLength(1), v.maxLength(50)),
});

export type Placement = v.InferOutput<typeof placementSchema>;
export type FeatureCardItem = v.InferOutput<typeof featureCardSchema>;
export type CopyItem = v.InferOutput<typeof copySchema>;
export type ButtonLinkItem = v.InferOutput<typeof buttonLinkSchema>;
export type FreeformItem = v.InferOutput<typeof freeformItemSchema>;
export type FreeformFrame = v.InferOutput<typeof freeformFrameSchema>;
export type Grid = v.InferOutput<typeof gridSchema>;
export type StudioDocument = v.InferOutput<typeof studioDocumentSchema>;

export function parseStudioDocument(value: unknown): StudioDocument | null {
  const result = v.safeParse(studioDocumentSchema, value);
  return result.success ? result.output : null;
}

export function isStudioDocument(value: unknown): value is StudioDocument {
  return parseStudioDocument(value) !== null;
}

export const seedDocument: StudioDocument = {
  version: 1,
  root: {
    title: "Loom custom studio",
    description: "A page built from an approved React component registry.",
    theme: "light",
  },
  content: [
    {
      id: "hero-intro",
      type: "Hero",
      props: {
        eyebrow: "LOOM STUDIO / CUSTOM CORE",
        title: "Place trusted UI components with canvas-level control.",
        description: "The editor owns structure and placement data. Your application continues to own every rendered component.",
        ctaLabel: "Explore the canvas",
        ctaHref: "#section-canvas",
      },
    },
    {
      id: "section-canvas",
      type: "Section",
      props: {
        eyebrow: "FREEFORM FRAME",
        title: "Move, resize, and snap — inside an intentional boundary.",
        description: "The frame accepts only registered canvas components. The surrounding page remains responsive and structurally constrained.",
      },
      layout: {
        id: "frame-compose",
        type: "FreeformFrame",
        props: { label: "Product composition", height: 560 },
        items: [
          {
            id: "frame-card-library",
            type: "FeatureCard",
            props: {
              icon: "UI",
              title: "Registry first",
              description: "Each canvas item is an imported application component, not arbitrary HTML.",
            },
            placement: { x: 48, y: 64, width: 272, height: 236 },
          },
          {
            id: "frame-card-guardrails",
            type: "FeatureCard",
            props: {
              icon: "OK",
              title: "Guardrails persist",
              description: "The document validator rejects invalid page hierarchy and placement data.",
            },
            placement: { x: 392, y: 172, width: 300, height: 236 },
          },
          {
            id: "frame-card-portable",
            type: "FeatureCard",
            props: {
              icon: "JS",
              title: "Portable JSON",
              description: "The preview renders the exact document that the editor saves locally today.",
            },
            placement: { x: 640, y: 68, width: 272, height: 236 },
          },
        ],
      },
    },
  ],
};

export function createFrameCard(index: number): FreeformItem {
  return {
    id: `feature-${crypto.randomUUID()}`,
    type: "FeatureCard",
    props: {
      icon: "NEW",
      title: `New component ${index + 1}`,
      description: "A registered UI component added to this freeform frame.",
    },
    placement: {
      x: 40 + (index % 3) * 36,
      y: 40 + (index % 4) * 36,
      width: 272,
      height: 236,
    },
  };
}

export type PageNode = StudioDocument["content"][number];
export type SectionNode = Extract<PageNode, { type: "Section" }>;
export type GridItem = Grid["items"][number];

export function createHero(): Extract<PageNode, { type: "Hero" }> {
  return { id: `hero-${crypto.randomUUID()}`, type: "Hero", props: {
    eyebrow: "YOUR BRAND", title: "新しいページをつくろう", description: "登録済みのUIコンポーネントで、あなたのサービスを紹介しましょう。",
    ctaLabel: "詳しく見る", ctaHref: "#features",
  } };
}

export function createPage(): StudioDocument {
  return { version: 1, root: { title: "新しいページ", description: "Loomで作成したページ", theme: "light" }, content: [createHero()] };
}

export function createGridSection(): SectionNode {
  return { id: `section-${crypto.randomUUID()}`, type: "Section", props: {
    eyebrow: "FEATURES", title: "サービスの特徴", description: "ライブラリから部品を追加して、このセクションを組み立てます。",
  }, layout: { id: `grid-${crypto.randomUUID()}`, type: "Grid", props: { columns: 3 }, items: [] } };
}

export function createGridItem(type: GridItem["type"]): GridItem {
  const id = `item-${crypto.randomUUID()}`;
  if (type === "FeatureCard") return { id, type, props: { icon: "UI", title: "新しい特徴", description: "特徴の説明を入力してください。" } };
  if (type === "Copy") return { id, type, props: { text: "伝えたいメッセージを入力してください。", emphasis: "default" } };
  return { id, type, props: { label: "お問い合わせ", href: "https://example.com", tone: "primary" } };
}
