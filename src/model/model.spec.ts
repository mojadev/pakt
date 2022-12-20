import { OpenAPIV3_1 } from "openapi-types";
import { transformModel } from "./model";

export const specHeader = {
  openapi: "3.0.1",
  info: {
    title: "Petstore",
    version: "1.0.0",
  },
};

const defaultResponse = {
  responses: {
    "application/json": {
      $ref: "#/components/schemas/Pet",
    },
  },
};

describe("Model representing routing and rules", () => {
  it("should parse paths as routes", async () => {
    const spec = {
      ...specHeader,
      paths: {
        pets: {
          get: {
            operationId: "getPets",
            ...defaultResponse,
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);

    expect(model.routerPaths.length).toEqual(1);
    expect(model.routerPaths[0].method).toEqual("get");
    expect(model.routerPaths[0].path).toEqual("pets");
    expect(model.routerPaths[0].operation).toEqual("getPets");
  });

  it.each`
    path              | method    | expected
    ${"pets"}         | ${"get"}  | ${"getPets"}
    ${"/pets"}        | ${"get"}  | ${"getPets"}
    ${"pets"}         | ${"post"} | ${"postPets"}
    ${"pets/test"}    | ${"post"} | ${"postPets_test"}
    ${"pets/{test}"}  | ${"post"} | ${"postPets_forTest"}
    ${"pets/%{test}"} | ${"post"} | ${"postPets__forTest"}
  `(
    "should create operation name $expected from path '$path' and method '$method' when no operationId is given",
    async ({ path, method, expected }) => {
      const spec = {
        ...specHeader,
        paths: {
          [path]: {
            [method]: {
              ...defaultResponse,
            },
          },
        },
      } as OpenAPIV3_1.Document;

      const model = transformModel(spec);

      expect(model.routerPaths.length).toEqual(1);
      expect(model.routerPaths[0].operation).toEqual(expected);
    }
  );

  it("should declare path level query parameters in the routes with default type string if no schema is provided", async () => {
    const spec = {
      ...specHeader,
      paths: {
        "/paths/{pet}": {
          get: {
            parameters: [{ in: "path", name: "pet", required: true }],
            ...defaultResponse,
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);
    const param = (model.routerPaths[0].pathParams || [])[0];

    expect(param).toBeTruthy();
    expect(param.type.type).toEqual("string");
    expect(param.name).toEqual("pet");
  });

  it("should support string arrays as path params", async () => {
    const spec = {
      ...specHeader,
      paths: {
        "/paths/{pet}": {
          get: {
            parameters: [
              {
                in: "path",
                name: "pet",
                required: true,
                schema: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            ],
            ...defaultResponse,
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);
    const param = (model.routerPaths[0].pathParams || [])[0];

    expect(param.type.type).toEqual("array");
    expect(param.type.children![0].type).toEqual("string");
  });

  it("should add queryParams to the router model", () => {
    const spec = {
      ...specHeader,
      paths: {
        "/pets": {
          get: {
            parameters: [
              {
                in: "query",
                name: "count",
                required: false,
                schema: {
                  type: "string",
                },
              },
            ],
            ...defaultResponse,
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);
    const param = (model.routerPaths[0].queryParams || [])[0];

    expect(param.type.type).toEqual("string");
    expect(param.name).toEqual("count");
  });

  it("should set the required flag of queryParams", () => {
    const spec = {
      ...specHeader,
      paths: {
        "/pets": {
          get: {
            parameters: [
              {
                in: "query",
                name: "optional",
                required: false,
                schema: {
                  type: "string",
                },
              },
              {
                in: "query",
                name: "required",
                required: true,
                schema: {
                  type: "string",
                },
              },
              {
                in: "query",
                name: "implicit",
                schema: {
                  type: "string",
                },
              },
            ],
            ...defaultResponse,
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);
    const params = model.routerPaths[0].queryParams || [];

    expect(params[0].type.required).toEqual(false);
    expect(params[1].type.required).toEqual(true);
    expect(params[2].type.required).toEqual(false);
  });

  it("should add the description of a type as the documentation", () => {
    const spec = {
      ...specHeader,
      paths: {
        "/paths/{pet}": {
          get: {
            summary: "Get a pet",
            description: "Endpoint to get a pet",
            parameters: [
              {
                in: "path",
                name: "pet",
                required: true,
                summary: "The id of the pet to use.",
                description: "Every pet has an id, this is it.",
                schema: {
                  description: "An array of ids",
                  type: "array",
                  items: {
                    description: "an id",
                    type: "string",
                  },
                },
              },
            ],
            ...defaultResponse,
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);

    expect(model.routerPaths[0].documentation).toEqual("Get a pet.\n\nEndpoint to get a pet.");
    expect(model.routerPaths[0].pathParams![0].documentation).toEqual(
      "The id of the pet to use.\n\nEvery pet has an id, this is it."
    );
  });

  it("should add schema definitions of the same file", () => {
    const spec = {
      ...specHeader,
      components: {
        schemas: {
          Pet: {
            type: "object",
            required: ["id", "name"],
            description: "A pet",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);

    expect(model.types["Pet"]).toBeDefined();
  });

  it("should negate schemas provided with not", () => {
    const spec = {
      ...specHeader,
      components: {
        schemas: {
          Pet: {
            not: {
              type: "integer",
            },
          },
        },
      },
    } as OpenAPIV3_1.Document;

    const model = transformModel(spec);

    expect(model.types["Pet"].type).toEqual("not");
  });
});
