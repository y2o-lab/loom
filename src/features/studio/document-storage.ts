import { parseStudioDocument, seedDocument, type StudioDocument } from "./document";

const draftKey = "loom-studio:document:v1";

export function loadDocument(): StudioDocument {
  if (typeof window === "undefined") return seedDocument;

  try {
    const raw = window.localStorage.getItem(draftKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parseStudioDocument(parsed) ?? seedDocument;
  } catch {
    return seedDocument;
  }
}

export function saveDocument(document: StudioDocument) {
  const parsed = parseStudioDocument(document);
  if (!parsed) throw new Error("Invalid Loom document");
  window.localStorage.setItem(draftKey, JSON.stringify(parsed));
}
