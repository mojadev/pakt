import { OpenAPIV3_1 } from 'openapi-types';
import { TypeModel } from './types';

type OpenApiTypeParser = (type: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject) => TypeModel | undefined;

const defaultType = {
  type: 'string' as const,
  additionalProperties: false,
  readOnly: false,
  writeOnly: false,
} as TypeModel;

const referenceParser: OpenApiTypeParser = (type) => {
  if (!isReference(type)) {
    return;
  }
  return {
    type: 'ref',
    ref: type.$ref,
    documentation: type.description,
  };
};

const fallbackParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  return { ...defaultType, type: 'any', documentation: type.description };
};

const arrayParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (!isArrayType(type)) {
    return;
  }
  return {
    ...defaultType,
    requiredFields: type.required,
    type: 'array',
    documentation: type.description,
    children: type.items ? [parseType(type.items, type.items.description)] : [],
    min: type.minItems,
    max: type.maxItems,
  };
};

const objectParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (!isObjectType(type)) {
    return;
  }
  const properties = type.properties ?? {};
  return {
    documentation: type.description,
    requiredFields: type.required,
    type: 'object',
    additionalProperties: Boolean(type.additionalProperties),
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
    properties: Object.keys(properties).reduce<Record<string, TypeModel>>(
      (result, key) => ({
        ...result,
        [key]: {
          ...parseType(properties[key], properties[key].description),
          required: (type.required ?? []).includes(key),
        },
      }),
      {}
    ),
  };
};

const numberParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'number') {
    return;
  }
  return {
    type: 'number',
    documentation: type.description,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const integerParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'integer') {
    return;
  }
  return {
    type: 'number',
    documentation: type.description,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const stringTypeParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'string') {
    return;
  }
  return {
    type: 'string',
    pattern: type.pattern,
    documentation: type.description,
    enum: type.enum,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const notParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.not == null) {
    return;
  }
  return { type: 'not', documentation: type.description, children: [parseType(type.not, type.not.description)] };
};

const dateParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'string' || !(type.format === 'date' || type.format === 'date-time')) {
    return;
  }
  return {
    type: 'date',
    pattern: type.pattern,
    documentation: type.description,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const base64Parser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'string' || type.format !== 'byte') {
    return;
  }
  return {
    type: 'base64',
    documentation: type.description,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const booleanParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'boolean') {
    return;
  }
  return {
    type: 'boolean',
    documentation: type.description,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const binaryParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  if (type.type !== 'string' || type.format !== 'binary') {
    return;
  }
  return {
    type: 'binary',
    documentation: type.description,
    readOnly: type.readOnly,
    writeOnly: type.writeOnly,
  };
};

const compositeTypeParser: OpenApiTypeParser = (type: OpenAPIV3_1.SchemaObject) => {
  const matchingComposite = ['anyOf' as const, 'oneOf' as const, 'allOf' as const].find(
    (compositeKeyword) => compositeKeyword in type
  );

  if (!matchingComposite) {
    return;
  }
  return {
    type: matchingComposite,
    children: type[matchingComposite]?.map((compositeChild) => parseType(compositeChild)),
  };
};

const openApiParser: OpenApiTypeParser[] = [
  referenceParser,
  arrayParser,
  objectParser,
  notParser,
  dateParser,
  base64Parser,
  binaryParser,
  numberParser,
  integerParser,
  booleanParser,
  compositeTypeParser,
  stringTypeParser,
  fallbackParser,
];

export const parseType = (
  type: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  documentation?: string
): TypeModel => {
  for (const parser of openApiParser) {
    const result = parser(type);
    if (result) {
      return { ...result, documentation: result.documentation ?? documentation };
    }
  }

  return { ...defaultType, documentation };
};

const isObjectType = (type: OpenAPIV3_1.SchemaObject): type is OpenAPIV3_1.ArraySchemaObject => {
  if (!type) {
    return false;
  }
  return type.type === 'object';
};

const isArrayType = (type: OpenAPIV3_1.SchemaObject): type is OpenAPIV3_1.ArraySchemaObject => {
  if (!type) {
    return false;
  }
  return type.type === 'array';
};

export const isReference = (
  type: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject | undefined
): type is OpenAPIV3_1.ReferenceObject => {
  return type !== undefined && type && '$ref' in type;
};
