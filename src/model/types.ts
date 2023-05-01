import { OpenAPIV3_1 } from 'openapi-types';

/**
 * The RoutingModel is an openapi independent representation of the api.
 *
 * In order to generate a router middleware, the OpenAPI document is first transformed
 * to the RoutingModel, which will then be transformed to the generated code.
 */
export interface RoutingModel {
  /**
   * The sha sum of the source file.
   */
  shaSum: string;
  /**
   * The router paths that are exposed by the router.
   */
  routerPaths: RouterPath[];
  /**
   * The types types that are defined in the OpenAPI document.
   */
  types: Record<TypePath, TypeModel>;
  /**
   * The source file that was used to generate the model.
   */
  sourceFile: string;
}

/**
 * TypeModel are intermediate representations and can be converted to e.g. TypeScript structures later.
 *
 * This might be additional mapping effort, but it allows to work with internal structures which
 * are under our control.
 */
export interface TypeModel {
  type:
    | 'string'
    | 'ref'
    | 'number'
    | 'big'
    | 'anyOf'
    | 'allOf'
    | 'oneOf'
    | 'date'
    | 'boolean'
    | 'array'
    | 'object'
    | 'not'
    | 'binary'
    | 'base64'
    | 'empty'
    | 'any';
  ref?: string;
  pattern?: string;
  enum?: string[];
  min?: number;
  max?: number;
  requiredFields?: string[];
  required?: boolean;
  additionalProperties?: boolean;
  readOnly?: boolean;
  documentation?: string;
  writeOnly?: boolean;
  children?: TypeModel[];
  properties?: Record<string, TypeModel>;
  lazy?: boolean;
}

export interface RequestParam {
  type: TypeModel;
  explode: boolean;
  name: string;
  documentation?: string;
  style: string;
}

export interface RouterPath {
  path: PathName;
  tags?: string[];
  operation: OperationName;
  pathParams?: RequestParam[];
  documentation?: string;
  queryParams?: RequestParam[];
  headerParams?: RequestParam[];
  method: MethodName;
  responses: Responses;
  requestBodies?: RequestBodies;
}

export type Responses = Record<ReturnCode, MimeTypeResponseMap>;
export type RequestBodies = Record<ContentType, TypeModel>;
export type MimeTypeResponseMap = Record<ContentType, TypeModel>;

export type ContentType = string;
export type MethodName = 'get' | 'delete' | 'post' | 'put' | 'options' | 'head' | 'patch';
export type OperationName = string;
export type PathName = string;
export type OperationList = Array<{
  method: MethodName;
  path: PathName;
  definition: OpenAPIV3_1.OperationObject;
}>;

export type ReturnCode = string | number;

export type Filename = string;

export type TypePath = string;
