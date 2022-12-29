import { codeModel } from '../model/code-model.decorator';
import { CodeGenerator, generateCode, Registry } from './code-generator';
import { codeGenerator } from './code-generator.decorator';
import { Writer } from './writer';

describe('Code generator', () => {
  it('should return a comment if not implementation can be found for a model', () => {
    const registry = new Registry();

    @codeModel('unknown')
    class UnknownModel {}

    const result = generateCode(new UnknownModel(), registry);

    expect(result.trim()).toEqual('/* Missing generator for unknown */');
  });

  it('should return the generator implementation matching the type if provided', () => {
    const registry = new Registry();

    @codeModel('known')
    class KnownModel {
      constructor(public type: string) {}
    }

    @codeGenerator('known')
    class Generator implements CodeGenerator<KnownModel> {
      generate(model: KnownModel, writer: Writer): Writer {
        writer.write(model.type);
        return writer;
      }
    }
    registry.add(new Generator());

    const result = generateCode(new KnownModel('testResult'), registry);
    expect(result).toEqual('testResult');
  });
});
