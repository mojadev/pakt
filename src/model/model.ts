import fs from 'fs';
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import YAML from 'yaml';
import { parseResponses } from './response';
import { parseType } from './type-declarations';
import { Filename, MethodName, OperationList, PathName, RequestBodies, RequestParam, RoutingModel } from './types';
const supportedMethods: OpenAPIV3_1.HttpMethods[] = Object.values(OpenAPIV3.HttpMethods);

/**
 * Read an OpenAPI file as a 1:1 representation in typescript.
 *
 * @param filename
 * @returns
 */
export const importModel = (filename: Filename): RoutingModel => {
  const file = fs.readFileSync(filename);
  const document: OpenAPIV3_1.Document = YAML.parse(file.toString('utf-8'));
  if (!document) {
    throw new Error('Could not parse OpenAPI document');
  }
  return transformModel(document);
};

/**
 * Transform the OpenAPI definition to a RoutingModel.
 *
 * The RoutingModel is the data structure that is internally used.
 * This allow us to decouple the interface of router generators from the OpenAPI
 * standard.
 *
 * @param document
 * @returns
 */
export const transformModel = (document: OpenAPIV3_1.Document): RoutingModel => {
  const allPaths = document.paths ?? {};
  const result: RoutingModel = {
    routerPaths: [],
    types: {},
  };

  Object.entries(document.components?.schemas ?? {}).forEach(([typeName, schema]) => {
    result.types[typeName] = parseType(schema, schema.description);
  });

  Object.keys(allPaths).forEach((pathKey) => {
    const path = allPaths[pathKey] as OpenAPIV3_1.PathItemObject;

    const methods: OperationList = supportedMethods
      .filter((method) => Boolean(path[method]))
      .map((method) => ({
        method: method as MethodName,
        path: pathKey,
        definition: path[method] as OpenAPIV3_1.OperationObject,
      }));

    methods.forEach(({ method, path, definition }) => {
      result.routerPaths.push({
        path,
        method,
        tags: definition.tags,
        documentation: createDocumentation(definition),
        operation: definition.operationId ?? createOperation(method, path),
        pathParams: parseParams(definition, 'path'),
        queryParams: parseParams(definition, 'query'),
        responses: parseResponses(document, definition.responses ?? {}),
        requestBodies: parseRequestBody(document, definition.requestBody),
      });
    });
  });
  return result;
};

const createDocumentation = (doc: { summary?: string; description?: string }): string => {
  return [doc.summary, doc.description]
    .filter(Boolean)
    .map((x) => x?.trim())
    .map((x) => (x?.endsWith('.') ? x : `${String(x)}.`))
    .join('\n\n');
};

const parseParams = (definition: OpenAPIV3_1.OperationObject, filter: 'path' | 'query'): RequestParam[] => {
  return (
    definition.parameters?.filter(isParameterType(filter)).map(
      (parameters) =>
        ({
          name: parameters.name,
          explode: parameters.explode,
          style: parameters.style,
          documentation: createDocumentation(parameters),
          type: {
            ...parseType(parameters.schema ?? { type: 'string' }, createDocumentation(parameters)),
            required: parameters.required ?? false,
          },
        } as RequestParam)
    ) ?? []
  );
};

const parseRequestBody = (
  document: OpenAPIV3_1.Document,
  requestBody: OpenAPIV3_1.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined
): RequestBodies => {
  if (!requestBody) {
    return {};
  }
  if ('$ref' in requestBody) {
    const allRequestBodies = document.components?.requestBodies;
    const refAddress = requestBody.$ref.split('/').slice(0, -1).join('/');
    const [result] = requestBody.$ref.split('/').reverse();
    const supportedPath = '#/components/requestBodies';
    if (refAddress.toLocaleLowerCase() !== supportedPath.toLocaleLowerCase()) {
      console.warn(
        `Cannot use requestBody ${requestBody.$ref} as it is not addressing a type under ${supportedPath} (${refAddress})`
      );
      return {};
    }
    if (allRequestBodies && allRequestBodies[result]) {
      return parseRequestBody(document, allRequestBodies[result]);
    }
    console.error('Could not find ', requestBody.$ref);
    return {};
  }
  return Object.entries(requestBody.content).reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: parseType(value.schema || {}, requestBody.description),
    }),
    {}
  );
};

const isParameterType =
  (inQualifier: 'path' | 'query') =>
  (param: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject): param is OpenAPIV3_1.ParameterObject => {
    return 'in' in param && param.in === inQualifier;
  };

/**
 * Generate a operation name by the path and method.
 *
 * The following rules apply (see unit tests for details):
 * - all non alphanumeric characters are replaced by '_'
 * - params are replaced with for{paramName}, e.g. path/{param} => path_forParam
 * @param method
 * @param path
 * @returns
 */
const createOperation = (method: MethodName, path: PathName): string => {
  const sanitizedPath = path
    .replace(/^\//, '')
    .replace(/\{(\w)(.*)\}/g, (_, v1: string, v2: string) => `for${v1.toLocaleUpperCase()}${v2}`)
    .replace(/[^A-Za-z0-0]/gi, '_');
  return method + sanitizedPath[0].toLocaleUpperCase() + sanitizedPath.substring(1);
};
