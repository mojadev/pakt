import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { parseResponses } from "./response";
import { TypeModel } from "./types";

export const specHeader = {
  openapi: "3.0.1",
  info: {
    title: "Petstore",
    version: "1.0.0",
  },
};

describe("parseResponse", () => {
  it("should add all defined content types as responses", () => {
    const spec = newSpecWithResponse({
      200: {
        description: "default response",
        content: {
          "application/json": { schema: { type: "string" } },
          "application/xml": { schema: { type: "string" } },
        },
      },
    });
    const responses = parseResponses(spec, getResponse(spec));

    expect(responses[200]["application/json"]).toBeTruthy();
    expect(responses[200]["application/xml"]).toBeTruthy();
  });

  it("should add inline type declaration to the response model", () => {
    const spec = newSpecWithResponse({
      200: {
        description: "default response",
        content: { "application/json": { schema: { type: "string", description: "Test description" } } },
      },
    });

    const response = specToResponse(spec);

    expect(response).toEqual({
      type: "string",
      documentation: "Test description",
    });
  });

  it("should resolve references as types", () => {
    const spec = newSpecWithResponse({
      200: {
        description: "default response",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } },
      },
    });

    const response = specToResponse(spec);
    expect(response).toEqual({
      type: "ref",
      ref: "#/components/schemas/Response",
    });
  });

  it("should allow to define default response types", () => {
    const spec = newSpecWithResponse({
      default: {
        description: "default response",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } },
      },
    });

    const responses = parseResponses(spec, getResponse(spec));
    const response: TypeModel = responses.default["application/json"];

    expect(response).toEqual({
      type: "ref",
      ref: "#/components/schemas/Response",
    });
  });
});

function specToResponse(spec: OpenAPIV3_1.Document<{}>) {
  const responses = parseResponses(spec, getResponse(spec));
  const response: TypeModel = responses[200]["application/json"];
  return response;
}

function getResponse(spec: OpenAPIV3_1.Document<{}>) {
  return (spec.paths as OpenAPIV3_1.PathsObject)["/paths/{pet}"]?.get?.responses as OpenAPIV3_1.ResponsesObject;
}

function newSpecWithResponse(response: OpenAPIV3.ResponsesObject) {
  return {
    ...specHeader,
    paths: {
      "/paths/{pet}": {
        get: {
          summary: "Get a pet",
          description: "Endpoint to get a pet",
          parameters: [],
          responses: {
            ...response,
          },
        },
      },
    },
  } as OpenAPIV3_1.Document;
}
