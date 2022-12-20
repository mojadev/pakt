import { toPlainObject, TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { notCompositionHandler } from './not';

describe('not type handler', () => {
  it('should not handle types without not', () => {
    const result = notCompositionHandler('type', {
      type: 'any',
      children: [{ type: 'string' }],
    });
    expect(result).not.toBeDefined();
  });

  it('should not handle types without children', () => {
    const result = notCompositionHandler('type', {
      type: 'any',
      children: [],
    });
    expect(result).not.toBeDefined();
  });

  it('should treat not types with only one subtype as being the subtype only', () => {
    const result = notCompositionHandler('type', {
      type: 'not',
      children: [{ type: 'string' }],
    });

    expect(toPlainObject(result)).toEqual({ alias: 'string', name: 'type', exported: true } as TypeScriptTypeAlias);
  });

  it('should treat not types with two types as an intersection type', () => {
    const result = notCompositionHandler('type', {
      type: 'not',
      children: [{ type: 'string' }, { type: 'number' }],
    });

    expect(toPlainObject(result)).toEqual({
      conjunction: 'negation',
      name: 'type',
      exported: true,
      children: [
        { alias: 'string', exported: true, name: 'type_0' },
        { alias: 'number', exported: true, name: 'type_1' },
      ],
    });
  });
});
