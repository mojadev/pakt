import fs from 'fs';
import YAML from 'yaml';
import { OpenAPIV3_1 } from 'openapi-types';

type Filename = string;

export const importModel = async (filename: Filename): Promise<RoutingModel> => {
  const file = fs.readFileSync(filename);
  
  const openApi: OpenAPIV3_1.Document = YAML.parse(file.toString('utf-8'));
   
  return {
    routerPaths: {}
  }
};

/**
 * The RoutingModel is a koa and openapi independent representation of the api.
 * 
 * In order to generate a router middleware, the OpenAPI document is first transformed 
 * to the RoutingModel, which will then be transformed to the generated code.
 */ 
export interface RoutingModel {
  routerPaths: Record<PathName, RouterPath>;

}


export interface RouterPath {
  path: PathName;
}
export type PathName = string;
