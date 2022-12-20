import { toPlainObject, TypeScriptTypeAlias, TypeScriptTypeComposition } from "../../../model/generated-code-model";
import { oneOfCompositionHandler } from "./one-of";

describe("one-of type handler", () => {
  it("should not handle types without one-of", () => {
    const result = oneOfCompositionHandler("type", {
      type: "any",
      children: [{ type: "string" }],
    });
    expect(result).not.toBeDefined();
  });

  it("should not handle types without children", () => {
    const result = oneOfCompositionHandler("type", {
      type: "any",
      children: [],
    });
    expect(result).not.toBeDefined();
  });

  it("should treat one-of types with only one subtype as being the subtype only", () => {
    const result = oneOfCompositionHandler("type", {
      type: "oneOf",
      children: [{ type: "string" }],
    });

    expect(toPlainObject(result)).toEqual({ alias: "string", name: "type", exported: true } as TypeScriptTypeAlias);
  });

  it("should treat one-of types with two types as a selection type", () => {
    const result = oneOfCompositionHandler("type", {
      type: "oneOf",
      children: [{ type: "string" }, { type: "number" }],
    });

    expect(toPlainObject(result)).toEqual({
      conjunction: "selection",
      name: "type",
      exported: true,
      children: [
        { alias: "string", exported: true, name: "type_0" },
        { alias: "number", exported: true, name: "type_1" },
      ],
    });
  });
});
