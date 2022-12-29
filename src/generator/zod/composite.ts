import { EcmaScriptImport, TypeScriptTypeComposition } from '../../model/generated-code-model';
import { CodeGenerator, Registry } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { Writer } from '../writer';

@codeGenerator('composite')
export class ZodCompositeGenerator implements CodeGenerator<TypeScriptTypeComposition> {
  constructor(
    private readonly registry: Registry,
    private readonly zodImport: EcmaScriptImport = new EcmaScriptImport('zod').setDefaultImport('z')
  ) {}

  generate(model: TypeScriptTypeComposition, writer: Writer): Writer {
    if (model.children.length === 0) {
      writer.write('z.never()');
      return writer;
    }
    if (model.children.length === 1) {
      this.registry.generateCode(model.children[0], writer);
      return writer;
    }
    writer.write(this.zodImport.defaultImport ?? 'z').write('.union([');
    model.children.forEach((child, idx) => {
      this.registry.generateCode(child, writer);
      writer.conditionalWrite(idx !== model.children.length - 1, ', ');
    });
    writer.write('])');
    return writer;
  }
}
