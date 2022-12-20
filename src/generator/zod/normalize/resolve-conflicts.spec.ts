import type { TypeModel, TypePath } from 'model';
import { getAllReferencesInModel, resolveConflicts } from './resolve-conflicts';

describe('Resolve conflicts normalizer', () => {
  it('should create a copy of a type when a circular dependency is detected in an object', () => {
    const types: Record<TypePath, TypeModel> = {
      obj1: {
        type: 'object',
        properties: {
          child: {
            type: 'ref',
            ref: 'obj2',
          },
        },
      },
      obj2: {
        type: 'object',
        properties: {
          child: {
            type: 'ref',
            ref: 'obj1',
          },
        },
      },
    };

    const result = resolveConflicts(types);

    expect(types).not.toBe(result);
    expect(result.obj2.properties?.child.ref).toEqual('_obj1');
    expect(result._obj1).toEqual(types.obj1);
  });

  it('should return all references on getAllReferences', () => {
    const type: TypeModel = {
      type: 'object',
      properties: {
        child: {
          type: 'ref',
          ref: 'obj2',
        },
        array: {
          type: 'array',
          children: [
            {
              type: 'ref',
              ref: 'arrayRef',
            },
          ],
        },
      },
    };

    expect(getAllReferencesInModel(type)).toEqual(['obj2', 'arrayRef']);
  });
});
