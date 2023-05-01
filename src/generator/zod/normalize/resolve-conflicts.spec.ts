import type { TypeModel, TypePath } from '../../../model';
import { getAllReferencesInModel, resolveConflicts } from './resolve-conflicts';

describe('Resolve conflicts normalizer', () => {
  it('should mark recursive elements as lazy', () => {
    const types: Record<TypePath, TypeModel> = {
      obj1: {
        type: 'object',
        properties: {
          child: {
            type: 'ref',
            ref: '#/components/schemas/obj2',
          },
        },
      },
      obj2: {
        type: 'object',
        properties: {
          child: {
            type: 'ref',
            ref: '#/components/schemas/obj1',
          },
        },
      },
    };

    const result = resolveConflicts(types);

    expect(result.obj1.properties?.child.lazy).toEqual(true);
    expect(result.obj2.properties?.child.lazy).toEqual(true);
  });

  it('should mark recursive elements for arrays as lazy', () => {
    const types: Record<TypePath, TypeModel> = {
      obj1: {
        type: 'object',
        properties: {
          child: {
            type: 'ref',
            ref: '#/components/schemas/obj2',
          },
        },
      },
      obj2: {
        type: 'array',
        children: [
          {
            type: 'ref',
            ref: '#/components/schemas/obj1',
          },
        ],
      },
    };

    const result = resolveConflicts(types);

    expect(result.obj1.properties?.child.lazy).toEqual(true);
    expect((result.obj2.children || [])[0].lazy).toEqual(true);
  });

  it('should mark recursive elements for arrays with nested objects as lazy', () => {
    const types: Record<TypePath, TypeModel> = {
      obj1: {
        type: 'object',
        properties: {
          child: {
            type: 'ref',
            ref: '#/components/schemas/obj2',
          },
        },
      },
      obj2: {
        type: 'array',
        children: [
          {
            type: 'object',
            properties: {
              ref: {
                type: 'ref',
                ref: '#/components/schemas/obj1',
              },
            },
          },
        ],
      },
    };

    const result = resolveConflicts(types);

    expect(result.obj1.properties?.child.lazy).toEqual(true);
    expect((result.obj2.children || [])[0].properties?.ref.lazy).toEqual(true);
  });

  it('should mark composites with nested array references as lazy', () => {
    const types: Record<TypePath, TypeModel> = {
      nodeList: {
        type: 'array',
        children: [{ type: 'ref', ref: '#/components/schemas/node' }],
      },
      node: {
        type: 'oneOf',
        children: [
          { type: 'ref', ref: '#/components/schemas/childType1' },
          { type: 'ref', ref: '#/components/schemas/childType2' },
        ],
      },
      childType1: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          children: {
            type: 'ref',
            ref: '#/components/schemas/nodeList',
          },
        },
      },
      childType2: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          children: {
            type: 'ref',
            ref: '#/components/schemas/nodeList',
          },
        },
      },
    };

    const result = resolveConflicts(types);
    expect(result.childType1.properties?.children.lazy).toBeTruthy();
    expect(result.childType2.properties?.children.lazy).toBeTruthy();
  });

  it('should return all references on getAllReferences', () => {
    const type: TypeModel = {
      type: 'object',
      properties: {
        child: {
          type: 'ref',
          ref: '#/components/schemas/obj2',
        },
        array: {
          type: 'array',
          children: [
            {
              type: 'ref',
              ref: '#/components/schemas/arrayRef',
            },
          ],
        },
      },
    };

    expect(getAllReferencesInModel(type)).toEqual(['obj2', 'arrayRef']);
  });

  it('should not try to resolve references for external documents (these are lazy by default)', () => {
    const type: TypeModel = {
      type: 'object',
      properties: {
        child: {
          type: 'ref',
          ref: '#/components/schemas/obj2',
        },
        array: {
          type: 'array',
          children: [
            {
              type: 'ref',
              ref: './files.yaml#/components/schemas/arrayRef',
            },
          ],
        },
      },
    };

    expect(getAllReferencesInModel(type)).toEqual(['obj2']);
  });
});
