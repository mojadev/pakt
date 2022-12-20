import { TypeModel } from "model";
import { generateResponseTypes } from "./response";
import { expectSource } from "./source-assertions";

const defaultResponseType: TypeModel = {
  type: "object",
  documentation: "A cute pet",
  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
  },
};

describe("Code Generator: Response types", () => {
  it("should generate responses type declarations for every mimetype and status definition", () => {
    const generatedCode = generateResponseTypes("getPets", {
      200: {
        "application/json": { ...defaultResponseType },
        "application/xml": { ...defaultResponseType },
      },
      404: {
        "application/json": { type: "string" },
      },
      default: {
        "application/json": { type: "string" },
      },
    });

    expectSource(generatedCode).toContainInterfaceDeclaration("GetPets_200ApplicationJsonResponsePayload", {
      id: "string",
      name: "string",
    });
    expectSource(generatedCode).toContainInterfaceDeclaration("GetPets_200ApplicationXmlResponsePayload", {
      id: "string",
      name: "string",
    });
    expectSource(generatedCode).toContainTypeAlias("GetPets_404ApplicationJsonResponsePayload", "string");
    expectSource(generatedCode).toContainTypeAlias("GetPetsDefaultApplicationJsonResponsePayload", "string");
  });

  it("should generate response types for empty responses", () => {
    const generatedCode = generateResponseTypes("getPets", {
      200: {},
      404: {},
    });

    expectSource(generatedCode).toContainInterfaceDeclaration("GetPets_200ResponsePayload", {});
    expectSource(generatedCode).toContainInterfaceDeclaration("GetPets_404ResponsePayload", {});
  });
});
