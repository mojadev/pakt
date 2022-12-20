import { Parameter, RouterOperationImplementation, TypeScriptInterface, TypeScriptTypeAlias, RouterPath } from "model";
import { mapToRouterCodeModel } from "./router";

const baseDefinition: Readonly<RouterPath> = {
  method: "get",
  operation: "getPets",
  path: "pet/",
  responses: {
    200: { "*/*": { type: "string" } },
  },
};

describe("API Model to Router Codemodel mapper", () => {
  it("should map a get request without params to the router code", () => {
    const path = { ...baseDefinition };

    const codeModel = mapToRouterCodeModel(path);

    expect(toObject(codeModel.implementations[0])).toEqual({
      mimeType: "*/*",
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: { alias: "string", exported: true, name: "GetPets_200ResponsePayload" } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it("should create operations for each mime type defined in the response", () => {
    const path = {
      ...baseDefinition,
      responses: {
        200: { "*/*": { type: "string" }, "application/json": { type: "object" } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(toObject(codeModel.implementations[0])).toEqual({
      mimeType: "*/*",
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: { alias: "string", exported: true, name: "GetPets_200ResponsePayload" } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);

    expect(toObject(codeModel.implementations[1])).toEqual({
      mimeType: "application/json",
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: {
            definition: {},
            exported: true,
            name: "GetPets_200ApplicationJsonResponsePayload",
          } as TypeScriptInterface,
        },
      ],
    } as RouterOperationImplementation);
  });

  it("should create responses for every return status", () => {
    const path = {
      ...baseDefinition,
      responses: {
        200: { "*/*": { type: "string" }, "application/json": { type: "object" } },
        404: { "application/json": { type: "object" } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations.length).toEqual(2);
    expect(codeModel.implementations[0]).toEqual({
      mimeType: "*/*",
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: { alias: "string", exported: true, name: "GetPets_200ResponsePayload" } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);

    expect(codeModel.implementations[1]).toEqual({
      mimeType: "application/json",
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: {
            definition: {},
            exported: true,
            name: "GetPets_200ApplicationJsonResponsePayload",
          } as TypeScriptInterface,
        },
        {
          status: 404,
          payload: {
            definition: {},
            exported: true,
            name: "GetPets_404ApplicationJsonResponsePayload",
          } as TypeScriptInterface,
        },
      ],
    } as RouterOperationImplementation);
  });

  it("should add path parameter definitions to the code model", () => {
    const path = {
      ...baseDefinition,
      pathParams: [{ explode: false, name: "id", type: { type: "string" }, style: "simple" }],
      responses: {
        200: { "*/*": { type: "string" } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations[0]).toEqual({
      mimeType: "*/*",
      queryParams: [],
      params: [
        {
          name: "id",
          explode: false,
          format: "simple",
          type: { alias: "string", name: "IdPathParam", exported: true },
        } as Parameter,
      ],
      responses: [
        {
          status: 200,
          payload: { alias: "string", exported: true, name: "GetPets_200ResponsePayload" } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it("should add query parameter definitions to the code model", () => {
    const path = {
      ...baseDefinition,
      queryParams: [{ explode: false, name: "id", type: { type: "string" }, style: "simple" }],
      responses: {
        200: { "*/*": { type: "string" } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations[0]).toEqual({
      mimeType: "*/*",
      params: [],
      queryParams: [
        {
          name: "id",
          explode: false,
          format: "simple",
          type: { alias: "string", name: "IdPathParam", exported: true },
        } as Parameter,
      ],
      responses: [
        {
          status: 200,
          payload: { alias: "string", exported: true, name: "GetPets_200ResponsePayload" } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it("should support empty responses", () => {
    const path = {
      ...baseDefinition,
      pathParams: [],
      responses: { 201: {} },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations[0]).toEqual({
      mimeType: "*/*",
      params: [],
      queryParams: [],
      responses: [
        {
          status: 201,
          payload: { alias: "never", exported: true, name: "GetPets_201ResponsePayload" } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it("should not contain wildcard mimetypes when no default responses are provided", () => {
    const path = {
      ...baseDefinition,
      pathParams: [],
      responses: {
        201: {
          "application/json": {
            type: "string",
          },
        },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(codeModel.implementations.map((implementation) => implementation.mimeType)).toEqual(["application/json"]);
  });

  it.each`
    method       | result
    ${"get"}     | ${"get"}
    ${"post"}    | ${"post"}
    ${"put"}     | ${"put"}
    ${"delete"}  | ${"delete"}
    ${"options"} | ${"options"}
    ${"head"}    | ${"head"}
    ${"patch"}   | ${"patch"}
  `("should set the method from the request", ({ method, result }) => {
    const path = {
      method,
      operation: "getPets",
      path: "pet/",
      responses: {
        200: { "*/*": { type: "string" } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(codeModel.method).toEqual(method);
  });

  it("should set the path from the RouterPath", () => {
    const path = {
      method: "get",
      operation: "getPets",
      path: "pet/:id",
      responses: {
        200: { "*/*": { type: "string" } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(codeModel.path).toEqual("pet/:id");
  });
});

const toObject = (x: unknown) => JSON.parse(JSON.stringify(x));
