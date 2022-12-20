import { camelCase, pascalCase } from "change-case";
import {
  Response,
  RouterOperation,
  Parameter,
  RouterDefinition,
  RequestParam,
  ReturnCode,
  RouterPath,
  RoutingModel,
} from "model";
import { generateCodeModelForType } from "generator/typescript/mapper";

export const toToRouterCodeModel = (routerModel: RoutingModel) => {
  const model = new RouterDefinition();
  routerModel.routerPaths.map(mapToRouterCodeModel).forEach((codeModel) => model.addOperation(codeModel));
  return model;
};

export const mapToRouterCodeModel = (path: RouterPath): RouterOperation => {
  const mimeTypeStatusMapIterator = Object.entries(getMimeTypeStatusMap(path));
  const operation = new RouterOperation(path.method, path.path, path.operation);

  mimeTypeStatusMapIterator.forEach(([mimeType, statusCodes]) =>
    operation.addImplementation({
      mimeType,
      queryParams: (path.queryParams ?? []).map(mapToParameter),
      params: (path.pathParams ?? []).map(mapToParameter),
      responses: Array.from(statusCodes).map(createRespponseCodeModel(path, mimeType)),
    })
  );
  return operation;
};

function mapToParameter(pathParam: RequestParam): Parameter {
  return {
    name: pathParam.name,
    explode: pathParam.explode,
    format: pathParam.style,
    type: generateCodeModelForType(pascalCase(`${pathParam.name}PathParam`), pathParam.type),
  } as Parameter;
}

function createRespponseCodeModel(
  path: RouterPath,
  mimeType: string
): (value: ReturnCode, index: number, array: ReturnCode[]) => Response {
  return (code) =>
    ({
      payload: generateCodeModelForType(
        createResponseTypeName(path.operation, mimeType, code),
        path.responses[code][mimeType]
      ),
      status: Number(code),
    } as Response);
}

function getMimeTypeStatusMap(path: RouterPath) {
  const statusMap: Record<string, Set<ReturnCode>> = {};
  Object.entries(path.responses).forEach(([status, mimeTypeMap]) => {
    const mimeTypes = Object.keys(mimeTypeMap);
    if (!mimeTypes.length) {
      statusMap["*/*"] = statusMap["*/*"] ?? new Set();
      statusMap["*/*"].add(status);
    }
    mimeTypes.forEach((mimeType) => {
      statusMap[mimeType] = statusMap[mimeType] ?? new Set();
      statusMap[mimeType].add(status);
    });
  });

  return statusMap;
}

function getRequestOperationTypeName(path: RouterPath, mimeType: string) {
  const typeName = pascalCase(mimeType.replace(/\//g, "_"));
  return `Handle${pascalCase(path.operation)}${typeName}Request`;
}

export const createResponseTypeName = (operationId: string, mimeType: string, returnCode: ReturnCode): string => {
  return pascalCase(`${operationId} ${returnCode} ${mimeType.replace("/", " ")} ResponsePayload`);
};

/**
 * Return a map resolving every mime type defined in the path to its handler function.
 *
 * @param path
 * @returns
 */
export const generateMimeTypeOperationMap = (path: RouterPath): Record<string, string> => {
  return Object.keys(getMimeTypeStatusMap(path)).reduce(
    (result, mimeType) => ({ ...result, [mimeType]: camelCase(getRequestOperationTypeName(path, mimeType)) }),
    {}
  );
};
