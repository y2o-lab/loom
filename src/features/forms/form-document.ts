import * as v from "valibot";

const text = (length: number) => v.pipe(v.string(), v.minLength(1), v.maxLength(length));
const id = text(120);
const fieldName = v.pipe(text(48), v.regex(/^[A-Za-z][A-Za-z0-9_]*$/));
const base = { id };
const inputProps = { label: text(80), name: fieldName, placeholder: v.pipe(v.string(), v.maxLength(160)), required: v.boolean() };
const headerSchema = v.object({ ...base, type: v.literal("FormHeader"), props: v.object({ brand: text(80), title: text(120), description: text(360) }) });
const inputSchema = v.object({ ...base, type: v.literal("TextInput"), props: v.object({ ...inputProps, inputType: v.picklist(["text", "email", "tel"]) }) });
const selectSchema = v.object({ ...base, type: v.literal("SelectField"), props: v.object({ ...inputProps, options: text(600) }) });
const areaSchema = v.object({ ...base, type: v.literal("TextArea"), props: v.object({ ...inputProps, rows: v.picklist([3, 4, 6]) }) });
const checkboxSchema = v.object({ ...base, type: v.literal("CheckboxField"), props: v.object({ label: text(160), name: fieldName, required: v.boolean() }) });
const buttonSchema = v.object({ ...base, type: v.literal("SubmitButton"), props: v.object({ label: text(48) }) });
const noticeSchema = v.object({ ...base, type: v.literal("Notice"), props: v.object({ text: text(360) }) });
const headingSchema = v.object({ ...base, type: v.literal("Heading"), props: v.object({ text: text(120) }) });
const copySchema = v.object({ ...base, type: v.literal("FormCopy"), props: v.object({ text: text(480) }) });
const dividerSchema = v.object({ ...base, type: v.literal("Divider"), props: v.object({}) });
const leafSchema = v.union([headerSchema, inputSchema, selectSchema, areaSchema, checkboxSchema, buttonSchema, noticeSchema, headingSchema, copySchema, dividerSchema]);
export type FormLeaf = v.InferOutput<typeof leafSchema>;
export type LayoutType = "Grid" | "Stack" | "Row" | "Panel";
export type LayoutProps = { label: string; gap: "compact" | "normal" | "relaxed"; columns: 1 | 2 | 3 };
export type FormLayout = { id: string; type: LayoutType; props: LayoutProps; children: FormNode[] };
export type FormNode = FormLeaf | FormLayout;
export type FormDocument = { version: 1; title: string; root: FormLayout };

const layoutPropsSchema = v.object({ label: text(80), gap: v.picklist(["compact", "normal", "relaxed"]), columns: v.picklist([1, 2, 3]) });
const nodeSchema: v.GenericSchema<FormNode> = v.lazy(() => v.union([leafSchema, layoutSchema]));
const layoutSchema: v.GenericSchema<FormLayout> = v.object({ id, type: v.picklist(["Grid", "Stack", "Row", "Panel"]), props: layoutPropsSchema, children: v.pipe(v.array(nodeSchema), v.maxLength(24)) });
const documentSchema = v.object({ version: v.literal(1), title: text(120), root: layoutSchema });

export function isLayout(node: FormNode): node is FormLayout { return "children" in node; }
export function flattenForm(root: FormNode, depth = 0, parentId: string | null = null): { node: FormNode; depth: number; parentId: string | null }[] {
  return [{ node: root, depth, parentId }, ...(isLayout(root) ? root.children.flatMap(child => flattenForm(child, depth + 1, root.id)) : [])];
}

export function parseFormDocument(value: unknown): FormDocument | null {
  // Bound recursion before passing untrusted persisted JSON to the recursive schema.
  if (!value || typeof value !== "object" || !("root" in value)) return null;
  const queue = [{ node: value.root, depth: 0 }];
  let count = 0;
  while (queue.length) {
    const entry = queue.pop()!;
    if (++count > 80 || entry.depth > 6 || !entry.node || typeof entry.node !== "object") return null;
    if ("children" in entry.node) {
      if (!Array.isArray(entry.node.children) || entry.node.children.length > 24) return null;
      queue.push(...entry.node.children.map(node => ({ node, depth: entry.depth + 1 })));
    }
  }
  const result = v.safeParse(documentSchema, value);
  if (!result.success) return null;
  const nodes = flattenForm(result.output.root).map(entry => entry.node);
  if (new Set(nodes.map(node => node.id)).size !== nodes.length) return null;
  const names = nodes.flatMap(node => "name" in node.props ? [node.props.name] : []);
  if (new Set(names).size !== names.length) return null;
  return result.output;
}

export function updateFormNode(root: FormNode, target: string, update: (node: FormNode) => FormNode): FormNode {
  if (root.id === target) return update(root);
  return isLayout(root) ? { ...root, children: root.children.map(child => updateFormNode(child, target, update)) } : root;
}

export function createFormNode(type: FormNode["type"]): FormNode {
  const id = crypto.randomUUID();
  const name = `field_${id.slice(0, 8)}`;
  if (["Grid", "Stack", "Row", "Panel"].includes(type)) return { id, type: type as LayoutType, props: { label: type === "Panel" ? "参加者情報" : type, columns: 2, gap: "normal" }, children: [] };
  switch (type) {
    case "FormHeader": return { id, type, props: { brand: "LOOM / EVENTS", title: "ワークショップ参加申込", description: "必要事項をご入力ください。約1分でお申し込みいただけます。" } };
    case "TextInput": return { id, type, props: { label: "お名前", name, placeholder: "入力してください", required: true, inputType: "text" } };
    case "SelectField": return { id, type, props: { label: "参加コース", name, placeholder: "選択してください", required: true, options: "デザイン入門\nプロトタイピング\nチーム開発" } };
    case "TextArea": return { id, type, props: { label: "相談したいこと", name, placeholder: "ご質問やご要望をお聞かせください", required: false, rows: 3 } };
    case "CheckboxField": return { id, type, props: { label: "参加規約に同意します", name, required: true } };
    case "SubmitButton": return { id, type, props: { label: "申込内容を確認" } };
    case "Notice": return { id, type, props: { text: "入力内容はこの画面で確認できます。このサンプルは外部へ送信しません。" } };
    case "Heading": return { id, type, props: { text: "連絡先" } };
    case "FormCopy": return { id, type, props: { text: "入力内容をご確認のうえ、お進みください。" } };
    case "Divider": return { id, type, props: {} };
    default: throw new Error("Unsupported form component");
  }
}

export function createFormDocument(): FormDocument {
  const root = createFormNode("Stack") as FormLayout;
  root.props.label = "フォーム";
  return { version: 1, title: "ワークショップ参加申込", root };
}

const draftKey = "loom-studio:form:v1";
export function loadFormDocument(): FormDocument {
  try { const raw = window.localStorage.getItem(draftKey); return (raw ? parseFormDocument(JSON.parse(raw)) : null) ?? createFormDocument(); }
  catch { return createFormDocument(); }
}
export function saveFormDocument(document: FormDocument) {
  const parsed = parseFormDocument(document);
  if (!parsed) throw new Error("Invalid form document");
  window.localStorage.setItem(draftKey, JSON.stringify(parsed));
}
