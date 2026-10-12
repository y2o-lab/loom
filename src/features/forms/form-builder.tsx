"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createFormDocument, createFormNode, flattenForm, isLayout, loadFormDocument, parseFormDocument, saveFormDocument, updateFormNode, type FormDocument, type FormLayout, type FormNode } from "./form-document";
import { componentLabel, formRegistry } from "./form-registry";
import { FormTree } from "./form-renderer";

const subscribe = () => () => {};
const labels: Record<string,string> = { label: "表示名", brand: "ブランド", title: "タイトル", description: "説明", text: "本文", name: "項目キー", placeholder: "プレースホルダー", required: "必須入力", inputType: "入力形式", options: "選択肢（1行に1件）", rows: "行数", gap: "間隔", columns: "列数" };
const options: Record<string, [string,string][]> = { gap: [["compact","狭い"],["normal","標準"],["relaxed","広い"]], columns: [["1","1列"],["2","2列"],["3","3列"]], inputType: [["text","テキスト"],["email","メールアドレス"],["tel","電話番号"]], rows: [["3","3行"],["4","4行"],["6","6行"]] };

function Tree({ node, selectedId, onSelect }: { node: FormNode; selectedId: string | null; onSelect: (id:string)=>void }) {
  return <div className="loom-form-tree-branch"><button type="button" aria-label={`選択: ${componentLabel(node)}`} data-selected={selectedId===node.id||undefined} onClick={()=>onSelect(node.id)}><span className="loom-form-tree-type">{formRegistry.find(entry=>entry.type===node.type)?.label}</span><span>{componentLabel(node)}</span></button>{isLayout(node)?<div className="loom-form-tree-children">{node.children.map(child=><Tree key={child.id} node={child} selectedId={selectedId} onSelect={onSelect}/>)}</div>:null}</div>;
}

export function FormBuilder() {
  const hydrated=useSyncExternalStore(subscribe,()=>true,()=>false);
  const initial=useMemo(()=>hydrated?loadFormDocument():null,[hydrated]);
  const [draft,setDraft]=useState<FormDocument|null>(null);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [message,setMessage]=useState("変更はこのブラウザに保存されます");
  const document=draft??initial;
  const canvasRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!selectedId)return;
    const frame=requestAnimationFrame(()=>canvasRef.current?.querySelector(`[data-node-id="${CSS.escape(selectedId)}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest"}));
    return ()=>cancelAnimationFrame(frame);
  },[selectedId]);
  if(!document)return <div className="loom-loading">Loading form builder…</div>;
  const entries=flattenForm(document.root);
  const selectedEntry=entries.find(entry=>entry.node.id===selectedId)??entries[0];
  const selected=selectedEntry.node;
  const target=isLayout(selected)?selected:entries.find(entry=>entry.node.id===selectedEntry.parentId)?.node??document.root;
  const commit=(candidate:unknown)=>{
    const parsed=parseFormDocument(candidate);
    if(!parsed){setMessage("保存できません。項目キーの重複や入力内容、入れ子の深さを確認してください。");return false;}
    try{saveFormDocument(parsed);setDraft(parsed);setMessage("保存済み · このブラウザ");return true;}
    catch{setMessage("保存できません。ブラウザのストレージ設定を確認してください。");return false;}
  };
  const add=(type:FormNode["type"])=>{
    if(!isLayout(target))return;
    const added=createFormNode(type);
    const root=updateFormNode(document.root,target.id,node=>isLayout(node)?{...node,children:[...node.children,added]}:node);
    if(commit({...document,root}))setSelectedId(added.id);
  };
  const save=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const data=new FormData(event.currentTarget);
    const props=Object.fromEntries(Object.entries(selected.props).map(([key,value])=>[key,typeof value==="boolean"?data.get(key)==="on":typeof value==="number"?Number(data.get(key)??value):String(data.get(key)??value)]));
    commit({...document,root:updateFormNode(document.root,selected.id,node=>({...node,props}) as FormNode)});
  };
  const reorder=(direction:number)=>{
    if(!selectedEntry.parentId)return;
    commit({...document,root:updateFormNode(document.root,selectedEntry.parentId,node=>{
      if(!isLayout(node))return node;
      const children=[...node.children];const index=children.findIndex(child=>child.id===selected.id);const next=index+direction;
      if(next<0||next>=children.length)return node;
      [children[index],children[next]]=[children[next],children[index]];return {...node,children};
    })});
  };
  const parent=entries.find(entry=>entry.node.id===selectedEntry.parentId)?.node;
  const index=parent&&isLayout(parent)?parent.children.findIndex(child=>child.id===selected.id):-1;
  return <div className="loom-form-builder"><header className="loom-studio-header"><div><strong>LOOM / FORM BUILDER</strong><span role="status">{message}</span></div><div><Link href="/form-components">部品ライブラリ</Link><button type="button" onClick={()=>{const next=createFormDocument();if(commit(next))setSelectedId(next.root.id);}}>新しいフォーム</button><Link href="/form-preview">フォームをプレビュー</Link></div></header>
    <div className="loom-form-workspace"><aside className="loom-studio-panel loom-form-sidebar"><p>STRUCTURE</p><h2>フォームの構成</h2><div className="loom-form-tree"><Tree node={document.root} selectedId={selected.id} onSelect={setSelectedId}/></div>
      <p className="loom-studio-panel__source">COMPONENT LIBRARY</p><p className="loom-library-hint">追加先: {componentLabel(target)}</p>
      {(["layout","content"] as const).map(category=><section className="loom-form-palette-group" key={category}><h3>{category==="layout"?"レイアウト":"コンポーネント"}</h3><div className="loom-form-palette">{formRegistry.filter(entry=>entry.category===category).map(entry=><button key={entry.type} type="button" aria-label={`追加: ${entry.label}`} onClick={()=>add(entry.type)} disabled={entries.length>=80||!isLayout(target)||target.children.length>=24||(isLayout(target)&&selectedEntry.depth>=6&&isLayout(selected))}><strong>＋ {entry.label}</strong><small>{entry.hint}</small></button>)}</div></section>)}
    </aside>
    <div className="loom-form-canvas" ref={canvasRef}><div className="loom-form-canvas-caption"><span>FORM CANVAS</span><span>{entries.length} components · 自動保存</span></div><div className="loom-form-canvas-sheet"><FormTree node={document.root} editing selectedId={selected.id} onSelect={setSelectedId}/></div></div>
    <aside className="loom-studio-panel loom-studio-panel--inspector"><p>INSPECTOR</p><h2>{formRegistry.find(entry=>entry.type===selected.type)?.label}を編集</h2><p className="loom-library-hint">{isLayout(selected)?"選択したレイアウトの中に部品を追加できます。":"部品の設定を編集して保存します。"}</p>
      <form key={`${selected.id}-${JSON.stringify(selected.props)}`} onSubmit={save}>
      {Object.entries(selected.props).filter(([key])=>key!=="columns"||selected.type==="Grid").map(([key,value])=><label key={key} className={`loom-field ${typeof value==="boolean"?"loom-inspector-check":""}`}>{labels[key]??key}
        {typeof value==="boolean"?<input type="checkbox" name={key} aria-label={labels[key]} defaultChecked={value}/>:options[key]?<select name={key} aria-label={labels[key]} defaultValue={String(value)}>{options[key].map(([option,label])=><option value={option} key={option}>{label}</option>)}</select>:["description","text","options"].includes(key)?<textarea name={key} aria-label={labels[key]} required rows={key==="options"?4:3} maxLength={key==="options"?600:key==="text"?480:360} defaultValue={String(value)}/>:<input name={key} aria-label={labels[key]} required={key!=="placeholder"} maxLength={key==="name"?48:key==="title"?120:key==="label"&&selected.type==="CheckboxField"?160:key==="placeholder"?160:80} defaultValue={String(value)}/>}
      </label>)}<button type="submit" className="loom-save-props">設定を保存</button></form>
      {selectedEntry.parentId?<><div className="loom-builder-actions"><button type="button" disabled={index<=0} onClick={()=>reorder(-1)}>↑ 上へ</button><button type="button" disabled={!parent||!isLayout(parent)||index>=parent.children.length-1} onClick={()=>reorder(1)}>↓ 下へ</button></div><button className="loom-form-remove" type="button" onClick={()=>{if(commit({...document,root:updateFormNode(document.root,selectedEntry.parentId!,node=>isLayout(node)?{...node,children:node.children.filter(child=>child.id!==selected.id)}:node)}))setSelectedId(selectedEntry.parentId);}}>選択した部品を削除</button></>:null}
    </aside></div>
  </div>;
}
