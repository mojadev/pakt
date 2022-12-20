import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { parseType } from './type-declarations';
import { Responses, TypeModel } from './types';

export const parseResponses = (document: OpenAPIV3_1.Document, responses: OpenAPIV3_1.ResponsesObject): Responses => {
  return Object.keys(responses).reduce(
    (prev, statusCode) => ({
      ...prev,
      [statusCode]: parseResponseForStatusCode(responses[statusCode] as OpenAPIV3_1.ResponseObject),
    }),
    {}
  );
};

const parseResponseForStatusCode = (response: OpenAPIV3_1.ResponseObject): Record<string, TypeModel> => {
  if (response.content == null) {
    return {};
  }
  const content = response.content;

  return Object.keys(response.content as OpenAPIV3_1.MediaTypeObject).reduce((prev, current) => {
    const mediaTypeObject: OpenAPIV3.MediaTypeObject = content[current] as OpenAPIV3.MediaTypeObject;
    if (mediaTypeObject.schema == null) {
      return { ...prev };
    }
    return {
      ...prev,
      [current]: parseType(mediaTypeObject.schema as OpenAPIV3_1.SchemaObject, response.description),
    };
  }, {});
};
