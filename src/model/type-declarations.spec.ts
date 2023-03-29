import { OpenAPIV3_1 } from 'openapi-types';
import { parseType } from './type-declarations';

describe('Type Declarations', () => {
  it.each`
    format         | type                    | expected
    ${null}        | ${'string'}             | ${'string'}
    ${null}        | ${'integer'}            | ${'number'}
    ${null}        | ${'number'}             | ${'number'}
    ${'date'}      | ${'string'}             | ${'date'}
    ${'date-time'} | ${'string'}             | ${'date'}
    ${'binary'}    | ${'string'}             | ${'binary'}
    ${'byte'}      | ${'string'}             | ${'base64'}
    ${null}        | ${'boolean'}            | ${'boolean'}
    ${null}        | ${'array'}              | ${'array'}
    ${null}        | ${'object'}             | ${'object'}
    ${null}        | ${['string', 'number']} | ${'any'}
  `("should detect format '$format' and type '$type' as internal type $expected", ({ format, type, expected }) => {
    const result = parseType({
      type,
      format,
    } as OpenAPIV3_1.SchemaObject);

    expect(result.type).toEqual(expected);
  });

  it('should add min and max values for arrays', () => {
    const result = parseType({
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 5,
      maxItems: 10,
    } as OpenAPIV3_1.SchemaObject);

    expect(result.min).toEqual(5);
    expect(result.max).toEqual(10);
  });

  it.each`
    type        | expected
    ${'string'} | ${'string'}
    ${'number'} | ${'number'}
    ${'object'} | ${'object'}
    ${'array'}  | ${'array'}
  `('should support $type array children', ({ type, expected }) => {
    const result = parseType({
      type: 'array',
      items: {
        type,
      },
    } as OpenAPIV3_1.SchemaObject);

    expect(result.children?.[0].type).toEqual(expected);
  });

  it('should support objects with explicit property declarations', () => {
    const result = parseType({
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        name: {
          type: 'string',
        },
      },
    } as OpenAPIV3_1.SchemaObject);

    expect(result.properties?.id.type).toEqual('number');
    expect(result.properties?.name.type).toEqual('string');
  });

  it("should handle 'not' definitions as own types", () => {
    const result = parseType({
      type: 'object',
      properties: {
        id: {
          not: {
            type: 'integer',
          },
        },
      },
    } as OpenAPIV3_1.SchemaObject);

    expect(result.properties?.id.type).toEqual('not');
    expect(result.properties?.id.children).toEqual([{ type: 'number' }]);
  });

  it('should support enum definitions for strings', () => {
    const result = parseType({
      type: 'string',
      enum: ['a', 'b', 'c'],
    });

    expect(result.enum).toEqual(['a', 'b', 'c']);
  });

  it('should define reference types using their source', () => {
    const result = parseType({
      type: 'object',
      properties: {
        id: {
          $ref: '#/components/schema/Test',
        },
      },
    } as OpenAPIV3_1.SchemaObject);

    expect(result.properties?.id.type).toEqual('ref');
    expect(result.properties?.id.ref).toEqual('#/components/schema/Test');
  });

  it('should set the required flag of fields in an object', () => {
    const result = parseType({
      type: 'object',
      required: ['required'],
      properties: {
        required: {
          type: 'string',
        },
      },
    } as OpenAPIV3_1.SchemaObject);

    expect(result.properties?.required.required).toBe(true);
  });

  it('should support additionalProperties as booleans', () => {
    const result = parseType({
      type: 'object',
      required: ['required'],
      additionalProperties: true,
      properties: {
        required: {
          type: 'string',
        },
      },
    } as OpenAPIV3_1.SchemaObject);

    expect(result.additionalProperties).toBe(true);
  });

  it.each`
    type
    ${'oneOf'}
    ${'anyOf'}
    ${'allOf'}
  `('should support $type definitions and create union types', ({ type }) => {
    const result = parseType({
      description: 'Time',
      [type]: [
        { type: 'number', description: 'An UNIX timestamp' },
        { type: 'string', description: 'An ISO Datetime string' },
      ],
    } as OpenAPIV3_1.SchemaObject);

    expect(result.type).toEqual(type);
    expect(result.children?.length).toEqual(2);
    if (!result.children) {
      throw new Error('Children are missing');
    }
    expect(result.children[0].type).toEqual('number');
    expect(result.children[0].documentation).toEqual('An UNIX timestamp');
    expect(result.children[1].type).toEqual('string');
    expect(result.children[1].documentation).toEqual('An ISO Datetime string');
  });

  it.each`
    type
    ${'oneOf'}
    ${'anyOf'}
    ${'allOf'}
  `('should support $type definitions and create union types as array items', ({ type }) => {
    const result = parseType({
      type: 'array',
      description: 'Time',
      items: {
        [type]: [
          { type: 'number', description: 'An UNIX timestamp' },
          { type: 'string', description: 'An ISO Datetime string' },
        ],
      },
    } as OpenAPIV3_1.SchemaObject);

    if (!result.children) {
      throw new Error('Children are missing');
    }
    expect(result.children[0].type).toEqual(type);
  });
});
