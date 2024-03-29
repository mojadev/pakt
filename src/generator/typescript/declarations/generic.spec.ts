import { TypeScriptGeneric, TypeScriptInterface, TypeScriptTypeAlias } from '../../../model';
import { Registry } from '../../code-generator';
import { expectSource } from '../../verify/source-assertions';
import { TypeScriptAliasFieldGenerator } from './alias';
import { TypeScriptGenericFieldGenerator, TypeScriptGenericGenerator } from './generic';
import { TypeScriptInterfaceFieldGenerator } from './interface';

describe('Generic code generator', () => {
  const registry = new Registry();
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new TypeScriptInterfaceFieldGenerator(registry));
  registry.add(new TypeScriptGenericFieldGenerator(registry));
  const generator = new TypeScriptGenericGenerator(registry);

  it('should resolve alias chllds as GenericName<AliasName>', () => {
    const sourceCode = generator
      .generate(new TypeScriptGeneric('GenericType', 'GenericName', [new TypeScriptTypeAlias('alias', 'AliasName')]))
      .toString();

    expectSource(sourceCode).toContainTypeAlias('GenericType', 'GenericName<AliasName>');
  });

  it('should resolve object childs as GenericName<ObjectImplementation>', () => {
    const genericTypeValue = new TypeScriptInterface('Object');
    const genericTypeValue2 = new TypeScriptInterface('Object2');
    genericTypeValue2.addField('child', new TypeScriptTypeAlias('field2', 'number'));
    genericTypeValue.addField('field', new TypeScriptTypeAlias('field', 'string'));
    genericTypeValue.addField('field2', genericTypeValue2);

    const sourceCode = generator
      .generate(new TypeScriptGeneric('GenericType', 'GenericName', [genericTypeValue]))
      .toString();

    expectSource(sourceCode).toContainTypeAlias(
      'GenericType',
      `GenericName<{
  field?: string;
  field2?: {
    child?: number;
  };
}>`
    );
  });

  it('should write multiple generic fields when provided', () => {
    const sourceCode = generator
      .generate(
        new TypeScriptGeneric('GenericType', 'GenericName', [
          new TypeScriptTypeAlias('alias', 'AliasName'),
          new TypeScriptTypeAlias('alias', 'AliasName2'),
        ])
      )
      .toString();

    expectSource(sourceCode).toContainTypeAlias('GenericType', 'GenericName<AliasName, AliasName2>');
  });
});
