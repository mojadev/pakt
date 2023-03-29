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

    expect(result.obj1.properties?.child.lazy).toEqual(true);
    expect(result.obj2.properties?.child.lazy).toEqual(true);
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
