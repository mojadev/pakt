import { toPlainObject, TypeScriptInterface } from "../../../model/generated-code-model";
import { objectTypeParser } from "./object-type";

describe("Object type code definition", () => {
  it("should create interface definitions for objects", () => {
    const result = objectTypeParser("test", {
      type: "object",
      properties: {
        requiredField: {
          type: "string",
          required: true,
        },
        additionalField: {
          type: "number",
        },
      },
    });

    expect(toPlainObject(result)).toEqual({
      exported: true,
      name: "test",
      definition: {
        requiredField: {
          alias: "string",
          exported: true,
          name: "requiredField",
          required: true,
        },
        additionalField: {
          alias: "number",
          exported: true,
          name: "additionalField",
          required: false,
        },
      },
    });
  });

  it("should define required fields in the definition", () => {
    const result = toPlainObject(
      objectTypeParser("test", {
        type: "object",
        requiredFields: ["requiredField"],
        properties: {
          requiredField: {
            type: "string",
            required: true,
          },
          additionalField: {
            type: "number",
          },
        },
      })
    );

    expect(result).toBeTruthy();
    expect(result.definition.requiredField.required).toBeTruthy();
    expect(result.definition.additionalField.required).toBeFalsy();
  });
});
