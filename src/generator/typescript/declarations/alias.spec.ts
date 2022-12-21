import { expectSource } from 'generator/verify/source-assertions';
import { Writer } from 'generator/writer';
import { TypeScriptTypeAlias } from 'model';
import { TypeScriptAliasGenerator } from './alias';

describe('Alias code generator', () => {
  it('should generate alias definitions from alias type models', () => {
    const type = new TypeScriptTypeAlias('AliasName', 'string', true);

    const result = new TypeScriptAliasGenerator().generate(type, new Writer());

    expectSource(result.toString()).toContainTypeAlias('AliasName', 'string');
  });
});
