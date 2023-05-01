import { EcmaScriptImport, TypeScriptTypeAlias } from '../../../model';
import { expectSource } from '../../verify/source-assertions';
import { Writer } from '../../writer';
import { TypeScriptAliasGenerator } from './alias';

describe('Alias code generator', () => {
  it('should generate alias definitions from alias type models', () => {
    const type = new TypeScriptTypeAlias('AliasName', 'string', true);

    const result = new TypeScriptAliasGenerator().generate(type, new Writer());

    expectSource(result.toString()).toContainTypeAlias('AliasName', 'string');
  });

  it('should use a type reference from an import when the alias is not in the same file', () => {
    const type = new TypeScriptTypeAlias('AliasName', 'RemoteType', true).withAliasImport(
      new EcmaScriptImport('otherFile').setDefaultImport('otherFile')
    );

    const result = new TypeScriptAliasGenerator().generate(type, new Writer()).toString();

    expectSource(result.toString()).toContainTypeAlias('AliasName', 'otherFile.Schema.RemoteType');
  });
});
