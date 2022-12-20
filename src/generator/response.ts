import { pascalCase } from 'change-case';
import { Responses, ReturnCode } from 'model';
import { typeDeclaration } from './templates/types.tpl';

/**
 * Generate response types for each response in the {@see Responses} object.
 *
 * @param responses
 */
export const generateResponseTypes = (operationId: string, responses: Responses): string => {
  return Object.entries(responses)
    .flatMap(([statusCode, response]) => {
      if (Object.values(response).length === 0) {
        return [typeDeclaration(createResponseTypeName(operationId, '', statusCode), { type: 'object' })];
      }
      return Object.entries(response).map(([mimeType, typeModel]) => {
        return typeDeclaration(createResponseTypeName(operationId, mimeType, statusCode), typeModel);
      });
    })
    .join('\n');
};

export const createResponseTypeName = (
  operationId: string,
  mimeType: MimeType,
  returnCode: ReturnCode
): ResponseTypeName => {
  return pascalCase(`${operationId} ${returnCode} ${mimeType.replace('/', ' ')} ResponsePayload`);
};

type MimeType = string;
export type ResponseTypeName = string;
