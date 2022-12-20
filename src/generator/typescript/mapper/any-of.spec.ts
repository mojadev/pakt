import { toPlainObject, TypeScriptTypeAlias, TypeScriptTypeComposition } from "../../../model/generated-code-model";
import { anyOfCompositionHandler } from "./any-of";

describe("any-of type handler", () => {
  it("should not handle types without any-of", () => {
    const result = anyOfCompositionHandler("type", {
      type: "any",
      children: [{ type: "string" }],
    });
    expect(result).not.toBeDefined();
  });

  it("should not handle types without children", () => {
    const result = anyOfCompositionHandler("type", {
      type: "any",
      children: [],
    });
    expect(result).not.toBeDefined();
  });

  it("should treat any-of types with only one subtype as being the subtype only", () => {
    const result = anyOfCompositionHandler("type", {
      type: "anyOf",
      children: [{ type: "string" }],
    });

    expect(toPlainObject(result)).toEqual({ alias: "string", name: "type", exported: true } as TypeScriptTypeAlias);
  });

  it("should treat any-of types with two types as an intersection type", () => {
    const result = anyOfCompositionHandler("type", {
      type: "anyOf",
      children: [{ type: "string" }, { type: "number" }],
    });

    expect(toPlainObject(result)).toEqual({
      conjunction: "union",
      name: "type",
      exported: true,
      children: [
        { alias: "string", exported: true, name: "type_0" },
        { alias: "number", exported: true, name: "type_1" },
      ],
    });
  });
});
