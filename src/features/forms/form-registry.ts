import type { FormNode } from "./form-document";
export const formRegistry: { type: FormNode["type"]; label: string; category: "layout" | "content"; hint: string }[] = [
  { type: "Grid", label: "Grid", category: "layout", hint: "1・2・3列で配置" },
  { type: "Stack", label: "Stack", category: "layout", hint: "縦に並べる" },
  { type: "Row", label: "Row", category: "layout", hint: "横に並べる" },
  { type: "Panel", label: "Panel", category: "layout", hint: "見出し付きで囲む" },
  { type: "FormHeader", label: "Header", category: "content", hint: "ブランド・タイトル" },
  { type: "Heading", label: "Heading", category: "content", hint: "小見出し" },
  { type: "TextInput", label: "Input", category: "content", hint: "テキスト・メール" },
  { type: "SelectField", label: "Select", category: "content", hint: "選択肢" },
  { type: "TextArea", label: "Textarea", category: "content", hint: "複数行入力" },
  { type: "CheckboxField", label: "Checkbox", category: "content", hint: "同意・確認" },
  { type: "SubmitButton", label: "Button", category: "content", hint: "入力内容を確認" },
  { type: "Notice", label: "Notice", category: "content", hint: "案内文" },
  { type: "FormCopy", label: "Copy", category: "content", hint: "補足テキスト" },
  { type: "Divider", label: "Divider", category: "content", hint: "区切り線" },
];
export function componentLabel(node: FormNode): string {
  return "label" in node.props ? node.props.label : "title" in node.props ? node.props.title : "text" in node.props ? node.props.text : node.type;
}
