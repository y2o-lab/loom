"use client";
import { useState } from "react";
import { Grid, Stack, Row, Panel } from "@/components/ui/layouts";
import { FormHeader, TextField, SelectField, TextAreaField, CheckboxField, SubmitButton, Notice } from "@/components/ui/form-controls";
import { Copy } from "@/components/ui/copy";
import { flattenForm, isLayout, type FormDocument, type FormNode } from "./form-document";
import { componentLabel } from "./form-registry";

type TreeProps = { node: FormNode; editing?: boolean; selectedId?: string | null; onSelect?: (id: string) => void };
export function FormTree({ node, editing = false, selectedId, onSelect }: TreeProps) {
  let content: React.ReactNode;
  if (isLayout(node)) {
    const children = node.children.length ? node.children.map(child => <FormTree key={child.id} node={child} editing={editing} selectedId={selectedId} onSelect={onSelect}/>) : editing ? <p className="loom-form-empty">{node.type}を選択し、左のライブラリから部品を追加</p> : null;
    switch (node.type) {
      case "Grid": content = <Grid {...node.props}>{children}</Grid>; break;
      case "Row": content = <Row {...node.props}>{children}</Row>; break;
      case "Panel": content = <Panel {...node.props}>{children}</Panel>; break;
      default: content = <Stack {...node.props}>{children}</Stack>;
    }
  } else {
    switch (node.type) {
      case "FormHeader": content = <FormHeader {...node.props}/>; break;
      case "TextInput": content = <TextField {...node.props} disabled={editing}/>; break;
      case "SelectField": content = <SelectField {...node.props} disabled={editing}/>; break;
      case "TextArea": content = <TextAreaField {...node.props} disabled={editing}/>; break;
      case "CheckboxField": content = <CheckboxField {...node.props} disabled={editing}/>; break;
      case "SubmitButton": content = <SubmitButton {...node.props} disabled={editing}/>; break;
      case "Notice": content = <Notice {...node.props}/>; break;
      case "Heading": content = <h3 className="loom-form-heading">{node.props.text}</h3>; break;
      case "FormCopy": content = <Copy text={node.props.text} emphasis="muted"/>; break;
      case "Divider": content = <hr className="loom-form-divider"/>; break;
    }
  }
  return editing ? <div className={`loom-form-node ${isLayout(node) ? "loom-form-node--layout" : ""}`} data-selected={selectedId === node.id || undefined} data-node-id={node.id}>
    <button type="button" className="loom-form-node-select" onClick={()=>onSelect?.(node.id)} aria-label={`編集: ${componentLabel(node)}`}>{node.type}</button>{content}
  </div> : <>{content}</>;
}

export function InteractiveForm({ document }: { document: FormDocument }) {
  const [result, setResult] = useState<[string, string][] | null>(null);
  const [error, setError] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const entries = flattenForm(document.root).flatMap(({node}) => "name" in node.props ? [[node.props.label, String(values.get(node.props.name) ?? "未選択") === "on" ? "同意済み" : String(values.get(node.props.name) ?? "未選択")] as [string, string]] : []);
    setResult(entries); setError(false);
  };
  return <div className="loom-form-preview-content"><form onSubmit={submit} onInvalidCapture={()=>setError(true)} onChange={()=>{setResult(null);setError(false);}}>
    <FormTree node={document.root}/>
    {error ? <p className="loom-form-error" role="alert">必須項目とメールアドレスの形式を確認してください。</p> : null}
  </form>
  {result ? <section className="loom-form-confirmation" role="status"><span className="loom-confirm-icon">✓</span><h2>入力内容を確認しました</h2><p>サンプルのため、外部への送信は行っていません。</p><table><tbody>{result.map(([label,value],index)=><tr key={index}><th>{label}</th><td>{value || "未入力"}</td></tr>)}</tbody></table></section> : null}</div>;
}
