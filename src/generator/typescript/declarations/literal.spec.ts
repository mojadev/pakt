import { expectSource } from '../../verify/source-assertions';
import { Writer } from '../../writer';
import { TypeScriptLiteral } from '../../../model';
import { TypeScriptLiteralGenerator } from './literal';

describe('Literal code generator', () => {
  it('should generate literal definitions from literal type models', () => {
    const type = new TypeScriptLiteral('name', 'max', true);

    const result = new TypeScriptLiteralGenerator().generate(type, new Writer());

    expectSource(result.toString()).toContainTypeAlias('name', '"max"');
  });
});
