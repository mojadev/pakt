import { Parameter, RequestBody, RouterOperationImplementation, RouterPath, TypeScriptTypeAlias } from '../model';
import { mapToRouterCodeModel } from './router';

const baseDefinition: Readonly<RouterPath> = {
  method: 'get',
  operation: 'getPets',
  path: 'pet/',
  responses: {
    200: { '*/*': { type: 'string' } },
  },
};

describe('API Model to Router Code model mapper', () => {
  it('should map a get request without params to the router code', () => {
    const path = { ...baseDefinition };

    const codeModel = mapToRouterCodeModel(path);

    expect(toObject(codeModel.implementations[0])).toEqual({
      mimeType: '*/*',
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: { alias: 'string', exported: true, name: 'GetPets_200ResponsePayload' } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it('should create operations for each mime type defined in the response', () => {
    const path = {
      ...baseDefinition,
      responses: {
        200: { '*/*': { type: 'string' }, 'application/json': { type: 'object' } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(toObject(codeModel.implementations[0])).toEqual({
      mimeType: '*/*',
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: { alias: 'string', exported: true, name: 'GetPets_200ResponsePayload' } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);

    expect(toObject(codeModel.implementations[1])).toEqual({
      mimeType: 'application/json',
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: {
            definition: {},
            exported: true,
            extends: [],
            name: 'GetPets_200ApplicationJsonResponsePayload',
          } as ForcedTypeScriptInterface,
        },
      ],
    } as RouterOperationImplementation);
  });

  it('should create responses for every return status', () => {
    const path = {
      ...baseDefinition,
      responses: {
        200: { '*/*': { type: 'string' }, 'application/json': { type: 'object' } },
        404: { 'application/json': { type: 'object' } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations.length).toEqual(2);
    expect(codeModel.implementations[0]).toEqual({
      mimeType: '*/*',
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: { alias: 'string', exported: true, name: 'GetPets_200ResponsePayload' } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);

    expect(codeModel.implementations[1]).toEqual({
      mimeType: 'application/json',
      params: [] as Parameter[],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: {
            definition: {},
            exported: true,
            extends: [],
            name: 'GetPets_200ApplicationJsonResponsePayload',
          } as ForcedTypeScriptInterface,
        },
        {
          status: 404,
          payload: {
            definition: {},
            exported: true,
            extends: [],
            name: 'GetPets_404ApplicationJsonResponsePayload',
          } as ForcedTypeScriptInterface,
        },
      ],
    } as RouterOperationImplementation);
  });

  it('should add path parameter definitions to the code model', () => {
    const path = {
      ...baseDefinition,
      pathParams: [{ explode: false, name: 'id', type: { type: 'string' }, style: 'simple' }],
      responses: {
        200: { '*/*': { type: 'string' } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations[0]).toEqual({
      mimeType: '*/*',
      queryParams: [],
      params: [
        {
          name: 'id',
          explode: false,
          format: 'simple',
          type: { alias: 'string', name: 'IdPathParam', exported: true },
        } as Parameter,
      ],
      responses: [
        {
          status: 200,
          payload: { alias: 'string', exported: true, name: 'GetPets_200ResponsePayload' } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it('should add query parameter definitions to the code model', () => {
    const path = {
      ...baseDefinition,
      queryParams: [{ explode: false, name: 'id', type: { type: 'string' }, style: 'simple' }],
      responses: {
        200: { '*/*': { type: 'string' } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations[0]).toEqual({
      mimeType: '*/*',
      params: [],
      queryParams: [
        {
          name: 'id',
          explode: false,
          format: 'simple',
          type: { alias: 'string', name: 'IdPathParam', exported: true },
        } as Parameter,
      ],
      responses: [
        {
          status: 200,
          payload: { alias: 'string', exported: true, name: 'GetPets_200ResponsePayload' } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it('should support empty responses', () => {
    const path = {
      ...baseDefinition,
      pathParams: [],
      responses: { 201: {} },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));

    expect(codeModel.implementations[0]).toEqual({
      mimeType: '*/*',
      params: [],
      queryParams: [],
      responses: [
        {
          status: 201,
          payload: { alias: 'never', exported: true, name: 'GetPets_201ResponsePayload' } as TypeScriptTypeAlias,
        },
      ],
    } as RouterOperationImplementation);
  });

  it('should not contain wildcard mimetypes when no default responses are provided', () => {
    const path = {
      ...baseDefinition,
      pathParams: [],
      responses: {
        201: {
          'application/json': {
            type: 'string',
          },
        },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(codeModel.implementations.map((implementation) => implementation.mimeType)).toEqual(['application/json']);
  });

  it.each`
    method       | result
    ${'get'}     | ${'get'}
    ${'post'}    | ${'post'}
    ${'put'}     | ${'put'}
    ${'delete'}  | ${'delete'}
    ${'options'} | ${'options'}
    ${'head'}    | ${'head'}
    ${'patch'}   | ${'patch'}
  `('should set the method from the request', ({ method, result }) => {
    const path = {
      method,
      operation: 'getPets',
      path: 'pet/',
      responses: {
        200: { '*/*': { type: 'string' } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(codeModel.method).toEqual(result);
  });

  it('should set the path from the RouterPath', () => {
    const path = {
      method: 'get',
      operation: 'getPets',
      path: 'pet/:id',
      responses: {
        200: { '*/*': { type: 'string' } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(codeModel.path).toEqual('pet/:id');
  });

  it('should create TypeScriptDataStructures for every type in requests', () => {
    const path = {
      method: 'post',
      operation: 'updatePets',
      path: 'pet/:id',
      requestBodies: {
        'application/json': { type: 'object', properties: { name: { type: 'string' } } },
        'text/plain': { type: 'string' },
      },
      responses: {
        200: { '*/*': { type: 'string' } },
      },
    } as RouterPath;

    const codeModel = toObject(mapToRouterCodeModel(path));
    const requestBodies = codeModel.implementations[0].requestBody as RequestBody[];

    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[0]).toEqual({
      mimeType: 'application/json',
      payload: {
        definition: {
          name: {
            alias: 'string',
            exported: true,
            name: 'name',
            required: false,
          },
        },
        exported: true,
        extends: [],
        name: 'ApplicationJsonRequest',
      },
    });
    expect(requestBodies[1]).toEqual({
      mimeType: 'text/plain',
      payload: {
        exported: true,
        alias: 'string',
        name: 'TextPlainRequest',
      },
    });
  });

  it('should support empty responses', () => {
    const path = {
      method: 'get',
      operation: 'getPet',
      path: 'pet/:id',
      responses: {
        404: { 'application/json': { type: 'empty' } },
      },
    } as RouterPath;

    const codeModel = mapToRouterCodeModel(path);

    expect(new Set(codeModel.allResponses().map((x) => x.mimeType))).toEqual(new Set(['application/json']));
  });
});
const toObject = <T>(x: T): T => JSON.parse(JSON.stringify(x));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForcedTypeScriptInterface = any;
