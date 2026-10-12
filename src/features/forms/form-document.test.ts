import { describe, expect, it } from "vitest";
import { createFormDocument, createFormNode, isLayout, parseFormDocument, type FormLayout } from "./form-document";

describe("form document constraints",()=>{
 it("preserves nested layouts, required fields and email validation settings",()=>{
  const document=createFormDocument();
  const panel=createFormNode("Panel") as FormLayout;
  const grid=createFormNode("Grid") as FormLayout;
  const input=createFormNode("TextInput");
  if(input.type!=="TextInput")throw Error("Expected input");
  input.props.inputType="email";
  grid.children=[input];panel.children=[grid];document.root.children=[panel];
  expect(parseFormDocument(document)).toEqual(document);
 });
 it("rejects duplicate field names across different nested groups",()=>{
  const document=createFormDocument();
  const first=createFormNode("TextInput"), second=createFormNode("TextInput");
  if(first.type!=="TextInput"||second.type!=="TextInput")throw Error("Expected inputs");
  second.props.name=first.props.name;
  const group=createFormNode("Grid") as FormLayout;
  group.children=[second];document.root.children=[first,group];
  expect(parseFormDocument(document)).toBeNull();
 });
 it("rejects excessive nesting and cycles before recursive validation",()=>{
  const document=createFormDocument();let current=document.root;
  for(let i=0;i<8;i++){const child=createFormNode("Stack");if(!isLayout(child))throw Error("Expected layout");current.children=[child];current=child;}
  expect(parseFormDocument(document)).toBeNull();
  const cyclic=createFormDocument();cyclic.root.children=[cyclic.root];
  expect(parseFormDocument(cyclic)).toBeNull();
 });
 it("rejects unknown components and invalid input types",()=>{
  const document=createFormDocument();
  expect(parseFormDocument({...document,root:{...document.root,children:[{id:"unknown",type:"Script",props:{}}]}})).toBeNull();
  const field=createFormNode("TextInput");
  expect(parseFormDocument({...document,root:{...document.root,children:[{...field,props:{...field.props,inputType:"file"}}]}})).toBeNull();
 });
});
