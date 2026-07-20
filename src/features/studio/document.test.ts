import { describe, expect, it } from "vitest";
import { parseStudioDocument, seedDocument } from "./document";

describe("studioDocumentSchema", () => {
  it("accepts the seeded document", () => {
    expect(parseStudioDocument(seedDocument)).toEqual(seedDocument);
  });

  it("rejects an unsupported document version", () => {
    expect(parseStudioDocument({ ...seedDocument, version: 2 })).toBeNull();
  });

  it("rejects placements outside the freeform frame bounds", () => {
    const invalidDocument = structuredClone(seedDocument);
    const section = invalidDocument.content.find((node) => node.type === "Section");

    if (!section || section.layout.type !== "FreeformFrame") throw new Error("Expected a freeform frame");

    section.layout.items[0].placement.x = -8;
    expect(parseStudioDocument(invalidDocument)).toBeNull();
  });
});
