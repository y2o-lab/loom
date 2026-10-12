"use client";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { loadFormDocument } from "./form-document";
import { InteractiveForm } from "./form-renderer";
const subscribe=()=>()=>{};
export function FormPreview() {
  const hydrated=useSyncExternalStore(subscribe,()=>true,()=>false);
  const document=useMemo(()=>hydrated?loadFormDocument():null,[hydrated]);
  if(!document)return <div className="loom-loading">Loading preview…</div>;
  return <div className="loom-form-preview"><nav className="loom-preview-nav"><span>LOOM / FORM PREVIEW</span><Link href="/form-builder">フォーム編集に戻る</Link></nav><InteractiveForm document={document}/></div>;
}
