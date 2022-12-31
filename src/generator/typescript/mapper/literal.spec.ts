import { TypeScriptLiteral, TypeScriptTypeComposition } from '../../../model';
import { literalCompositionHandler } from './literal';

describe('Literal type handler candidate', () => {
  it('should return a single literal for a string with a single enum value', () => {
    const result = literalCompositionHandler('test', { type: 'string', enum: ['singleValue'] });

    expect(result).toEqual(new TypeScriptLiteral('test_0', 'singleValue', true));
  });

  it('should return a composition for multiple enum values', () => {
    const result = literalCompositionHandler('test', {
      type: 'string',
      enum: ['a', 'b', 'c'],
    }) as TypeScriptTypeComposition;

    expect(TypeScriptTypeComposition.isType(result)).toBeTruthy();
    expect(result.children.length).toEqual(3);
    expect(result.children[0]).toEqual(new TypeScriptLiteral('test_0', 'a', true));
    expect(result.children[1]).toEqual(new TypeScriptLiteral('test_1', 'b', true));
    expect(result.children[2]).toEqual(new TypeScriptLiteral('test_2', 'c', true));
  });

  it('should not handle non-string types', () => {
    const result = literalCompositionHandler('test', { type: 'object' });

    expect(result).toBeUndefined();
  });

  it('should not handle non-enum types', () => {
    const result = literalCompositionHandler('test', { type: 'string' });

    expect(result).toBeUndefined();
  });
});
