import { toPlainObject, TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { allOfCompositionHandler } from './all-of';

describe('all-of type handler', () => {
  it('should not handle types without all-of', () => {
    const result = allOfCompositionHandler('type', {
      type: 'any',
      children: [{ type: 'string' }],
    });
    expect(result).not.toBeDefined();
  });

  it('should not handle types without children', () => {
    const result = allOfCompositionHandler('type', {
      type: 'any',
      children: [],
    });
    expect(result).not.toBeDefined();
  });

  it('should treat all-of types with only one subtype as being the subtype only', () => {
    const result = allOfCompositionHandler('type', {
      type: 'allOf',
      children: [{ type: 'string' }],
    });

    expect(toPlainObject(result)).toEqual({ alias: 'string', name: 'type', exported: true } as TypeScriptTypeAlias);
  });

  it('should treat all-of types with two types as an intersection type', () => {
    const result = allOfCompositionHandler('type', {
      type: 'allOf',
      children: [{ type: 'string' }, { type: 'number' }],
    });

    expect(toPlainObject(result)).toEqual({
      conjunction: 'intersection',
      name: 'type',
      exported: true,
      children: [
        { alias: 'string', exported: true, name: 'type_0' },
        { alias: 'number', exported: true, name: 'type_1' },
      ],
    });
  });
});
