"use client";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { componentRegistry } from "./component-registry";
import { createFrameCard, createGridItem, createGridSection, createPage, parseStudioDocument, type GridItem, type StudioDocument } from "./document";
import { loadDocument, saveDocument } from "./document-storage";
import { DocumentRenderer } from "./document-renderer";
const subscribe = () => () => {};
const labels: Record<string,string> = {eyebrow:"ラベル",title:"見出し",description:"説明",ctaLabel:"ボタンの文字",ctaHref:"ボタンのリンク",icon:"アイコン",text:"本文",emphasis:"文字の強調",label:"ボタンの文字",href:"リンク",tone:"ボタンの種類"};
export function PageComposer() {
 const hydrated = useSyncExternalStore(subscribe,()=>true,()=>false);
 const initial = useMemo(()=>hydrated?loadDocument():null,[hydrated]);
 const [draft,setDraft]=useState<StudioDocument|null>(null);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [message,setMessage]=useState("変更はこのブラウザに保存されます");
 const document=draft??initial;
 const commit=(value:unknown)=>{const next=parseStudioDocument(value);if(!next){setMessage("入力内容と部品数の上限を確認してください。");return;}try{saveDocument(next);setDraft(next);setMessage("保存済み · このブラウザ");return next;}catch{setMessage("保存できません。ストレージ設定を確認してください。");}};
 if(!document)return <div className="loom-loading">Loading studio…</div>;
 const node=document.content.find(n=>n.id===selectedId);
 const item=document.content.flatMap(n=>n.type==="Section"?n.layout.items:[]).find(i=>i.id===selectedId);
 const frameItem=document.content.flatMap(n=>n.type==="Section"&&n.layout.type==="FreeformFrame"?n.layout.items:[]).find(i=>i.id===selectedId);
 const selected=node??item;
 const parent=node?.type==="Section"?node:document.content.find(n=>n.type==="Section"&&n.layout.items.some(i=>i.id===selectedId));
 const target=parent?.type==="Section"&&parent.layout.type==="Grid"?parent:document.content.find(n=>n.type==="Section"&&n.layout.type==="Grid");
 const addSection=()=>{const section=createGridSection();commit({...document,content:[...document.content,section]});setSelectedId(section.id);};
 const addItem=(type:GridItem["type"])=>{if(!target)return;const added=createGridItem(type);commit({...document,content:document.content.map(n=>n.id===target.id&&n.type==="Section"?{...n,layout:{...n.layout,items:[...n.layout.items,added]}}:n)});setSelectedId(added.id);};
 const submit=(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();if(!selected)return;
  const data=new FormData(event.currentTarget);
  const anchor=node?.type==="Section"?String(data.get("anchor")??"").trim():selected.id;
  if(!anchor||/\s/.test(anchor)||document.content.some(n=>n.id!==selected.id&&n.id===anchor)){setMessage("セクションIDは重複のない、空白を含まない値にしてください。");return;}
  const props=Object.fromEntries(Object.keys(selected.props).map(k=>[k,String(data.get(k)??"")]));
  const result=commit({...document,content:document.content.map(n=>n.id===selected.id?{...n,id:anchor,props,...(n.type==="Section"&&n.layout.type==="Grid"?{layout:{...n.layout,props:{columns:Number(data.get("columns"))}}}:{})}:n.type==="Section"?{...n,layout:{...n.layout,items:n.layout.items.map(i=>i.id===selected.id?{...i,props}:i)}}:n)});
  if(result)setSelectedId(anchor);
 };

 return <div className="loom-studio-shell"><header className="loom-studio-header"><div><strong>LOOM / STUDIO</strong><span role="status">{message}</span></div><div><Link href="/library">UIライブラリ</Link><button type="button" onClick={()=>{const next=createPage();commit(next);setSelectedId(next.content[0].id);}}>新しいページ</button><Link href="/preview">Preview</Link></div></header>
 <div className="loom-studio-workspace"><aside className="loom-studio-panel"><p>PAGE STRUCTURE</p><h2>ページを組み立てる</h2><div className="loom-builder-actions"><button type="button" onClick={addSection} disabled={document.content.length>=50}>＋ Gridセクション</button></div><div className="loom-page-tree">{document.content.map((n,index)=><button key={n.id} type="button" data-selected={selectedId===n.id||undefined} onClick={()=>setSelectedId(n.id)}><small>{String(index+1).padStart(2,"0")} · {n.type}</small><span>{n.props.title}</span></button>)}</div>
 <p className="loom-studio-panel__source">COMPONENT LIBRARY</p><p className="loom-library-hint">{target?`追加先: ${target.props.title}`:"Gridセクションを追加すると部品を配置できます。"}</p>{Object.entries(componentRegistry).map(([type,component])=><button className="loom-studio-registry-item" key={type} type="button" onClick={()=>addItem(type as GridItem["type"])} disabled={!target||(target.type==="Section"&&target.layout.items.length>=12)}><strong>＋ {component.label}</strong><span>{component.source}</span></button>)}
 <label className="loom-field">テーマ<select aria-label="テーマ" value={document.root.theme} onChange={e=>commit({...document,root:{...document.root,theme:e.target.value}})}><option value="light">Light</option><option value="sand">Sand</option><option value="ink">Ink</option></select></label></aside>
 <div className="loom-studio-canvas"><DocumentRenderer document={document} editing selectedId={selectedId} onSelect={setSelectedId}
 onAddToFrame={frameId=>commit({...document,content:document.content.map(n=>n.type==="Section"&&n.layout.type==="FreeformFrame"&&n.layout.id===frameId?{...n,layout:{...n.layout,items:[...n.layout.items,createFrameCard(n.layout.items.length)]}}:n)})}
 onChangeFrameItem={(frameId,itemId,placement)=>commit({...document,content:document.content.map(n=>n.type==="Section"&&n.layout.type==="FreeformFrame"&&n.layout.id===frameId?{...n,layout:{...n.layout,items:n.layout.items.map(i=>i.id===itemId?{...i,placement}:i)}}:n)})}/>
</div>
 <aside className="loom-studio-panel loom-studio-panel--inspector"><p>INSPECTOR</p>{selected?<><h2>{selected.type}を編集</h2><form key={`${selected.id}-${JSON.stringify(selected.props)}`} onSubmit={submit}>{Object.entries(selected.props).map(([key,value])=><label className="loom-field" key={key}>{labels[key]??key}{key==="tone"||key==="emphasis"?<select name={key} aria-label={labels[key]??key} defaultValue={String(value)}>{(key==="tone"?["primary","quiet"]:["default","muted"]).map(option=><option key={option}>{option}</option>)}</select>:key==="description"||key==="text"?<textarea name={key} aria-label={labels[key]??key} required maxLength={key==="text"?480:node?360:240} defaultValue={String(value)} rows={4}/>:<input name={key} aria-label={labels[key]??key} required maxLength={key==="icon"?4:key==="href"||key==="ctaHref"?512:key==="title"?node?.type==="Hero"?160:node?120:80:key==="eyebrow"?80:48} defaultValue={String(value)}/>}</label>)}
 {node?.type==="Section"?<label className="loom-field">セクションID<input name="anchor" aria-label="セクションID" required maxLength={120} defaultValue={node.id}/></label>:null}
 {node?.type==="Section"&&node.layout.type==="Grid"?<label className="loom-field">列数<select aria-label="列数" name="columns" defaultValue={node.layout.props.columns}><option value="2">2列</option><option value="3">3列</option></select></label>:null}<button className="loom-save-props" type="submit">変更を保存</button></form>
 {frameItem?<div>{Object.entries(frameItem.placement).map(([key,value])=><p key={key}>{key}: {value}px</p>)}</div>:null}</>:<p className="loom-studio-panel__empty">左のページ構成、または部品の編集ボタンを選択してください。</p>}</aside></div></div>;
}
