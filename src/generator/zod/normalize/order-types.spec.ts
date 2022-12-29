import { TypeModel, TypePath } from 'model';
import { orderTypes } from './order-types';

describe('Order types function', () => {
  it('should return an array of name type tuples with simple types first', () => {
    const type: Record<TypePath, TypeModel> = {
      arrayOfSimpleString: {
        type: 'array',
        children: [{ type: 'ref', ref: 'simpleString' }],
      },
      simpleObject: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
      },
      referenceObject: {
        type: 'object',
        properties: {
          reference: {
            type: 'ref',
            ref: 'simpleNumber',
          },
        },
      },
      simpleString: {
        type: 'string',
      },
      simpleNumber: {
        type: 'number',
      },
    };

    const result = orderTypes(type).map(([key]) => key);

    expect(result).toEqual(['simpleObject', 'simpleString', 'simpleNumber', 'arrayOfSimpleString', 'referenceObject']);
  });

  it('should return an array of types with referenced non-simple types first', () => {
    const type: Record<TypePath, TypeModel> = {
      arrayOfObject: {
        type: 'array',
        children: [{ type: 'ref', ref: 'objectType' }],
      },
      objectType: {
        type: 'object',
        properties: {
          name: { type: 'ref', ref: 'stringType' },
        },
      },
      stringType: {
        type: 'string',
      },
    };

    const result = orderTypes(type).map(([key]) => key);

    expect(result).toEqual(['stringType', 'objectType', 'arrayOfObject']);
  });

  it('should resolve circular dependencies by creating a copied type', () => {
    const type: Record<TypePath, TypeModel> = {
      arrayOfObject: {
        type: 'array',
        children: [{ type: 'ref', ref: 'objectType' }],
      },
      objectType: {
        type: 'object',
        properties: {
          node: { type: 'ref', ref: 'arrayOfObject' },
        },
      },
    };

    const result = orderTypes(type).map(([key]) => key);

    expect(result).toEqual(['objectType', 'arrayOfObject']);
  });
});
