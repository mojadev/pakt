import { toPlainObject, TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { refTypeHandler } from './refs';

describe('Ref Type handler', () => {
  it('should include local references as type aliases', () => {
    const result = refTypeHandler('test', {
      type: 'ref',
      ref: '#/components/schema/TestType',
    });

    expect(toPlainObject(result)).toEqual({
      alias: 'TestType',
      exported: true,
      name: 'test',
    } as TypeScriptTypeAlias);
  });

  it('should not declare a type when the type alias is not ref', () => {
    const result = refTypeHandler('test', {
      type: 'string',
      ref: '#/components/schema/TestType',
    });

    expect(result).not.toBeDefined();
  });

  it('should not declare a type when the type ref is not given', () => {
    const result = refTypeHandler('test', {
      type: 'ref',
    });

    expect(result).not.toBeDefined();
  });

  it('should add the source of type from the reference to the source symbol', () => {
    const result = refTypeHandler('test', {
      ref: '#/components/schema/TestType',
      type: 'ref',
    }) as TypeScriptTypeAlias;

    expect(result.getAliasSource()).toEqual('components/schema');
  });

  it('should mark lazy references as lazy', () => {
    const lazy = refTypeHandler('test', {
      ref: '#/components/schema/TestType',
      type: 'ref',
      lazy: true,
    }) as TypeScriptTypeAlias;
    const staticValue = refTypeHandler('test', {
      ref: '#/components/schema/TestType',
      type: 'ref',
    }) as TypeScriptTypeAlias;

    expect(lazy.markedAsLazy()).toEqual(true);
    expect(staticValue.markedAsLazy()).toEqual(false);
  });
});
