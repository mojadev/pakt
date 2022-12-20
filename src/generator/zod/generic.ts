import { TypeScriptGeneric } from '../../model/generated-code-model';
import { CodeGenerator, Registry } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { Writer } from '../writer';

@codeGenerator('generic')
export class ZodGenericGenerator implements CodeGenerator<TypeScriptGeneric> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptGeneric, writer: Writer): Writer {
    if (model.genericName === 'Array') {
      writer.write('z.array(');
      this.registry.generateCode(model.templateType, writer);
      writer.write(')');
    }

    if (model.genericName === 'Record') {
      writer.write('z.record(');
      this.registry.generateCode(model.templateType, writer);
      writer.write(')');
    }
    return writer;
  }
}
