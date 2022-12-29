import { getModelType } from '../model/code-model.decorator';
import { CodeGenerator } from './code-generator';
import { codeGenerator } from './code-generator.decorator';
import { Writer } from './writer';

describe('Code generator decorator ', () => {
  it('should add a symbol for the support type on construct', () => {
    @codeGenerator('test')
    class GenerateCode implements CodeGenerator<{ test: string }> {
      generate(model: { test: string }, writer: Writer): Writer {
        return writer;
      }
    }

    expect(getModelType(new GenerateCode())).toEqual('test');
  });
});
