import fs from 'fs';
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import YAML from 'yaml';
import { iterateObject } from '../iterate-object';
import { parseResponses } from './response';
import { parseType } from './type-declarations';
import { Filename, MethodName, OperationList, PathName, RequestParam, RoutingModel } from './types';

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

export const transformModel = (document: OpenAPIV3_1.Document): RoutingModel => {
  const allPaths = document.paths ?? {};
  const result: RoutingModel = {
    routerPaths: [],
    types: {},
  };

  iterateObject(document.components?.schemas ?? {}).forEach(([typeName, schema]) => {
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
        method,
        tags: definition.tags,
        documentation: createDocumentation(definition),
        operation: definition.operationId ?? createOperation(method, path),
        pathParams: parseParams(definition, 'path'),
        queryParams: parseParams(definition, 'query'),

        path,
        responses: parseResponses(document, definition.responses ?? {}),
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
