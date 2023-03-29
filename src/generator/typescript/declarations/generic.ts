import { CodeGenerator, Registry } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';
import { getModelType, TypeScriptGeneric } from '../../../model';

@codeGenerator('generic')
export class TypeScriptGenericGenerator implements CodeGenerator<TypeScriptGeneric> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptGeneric, writer = new Writer()): Writer {
    const typeGenerator = this.registry.entries['field:generic'];
    writer.conditionalWrite(model.exported, 'export ').write('type ').write(model.name).write(' = ');
    if (!typeGenerator) {
      writer.write('unknown;');
      return writer;
    }
    typeGenerator.generate(model, writer);
    writer.write(';');
    return writer;
  }
}

@codeGenerator('field:generic')
export class TypeScriptGenericFieldGenerator implements CodeGenerator<TypeScriptGeneric> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptGeneric, writer: Writer = new Writer()): Writer {
    writer.write(model.genericName).write('<');
    model.templateType.forEach((templateType, idx) => {
      const modelType = getModelType(templateType) ?? '';
      const generator = this.registry.entries['field:' + modelType];
      if (idx > 0) {
        writer.write(', ');
      }
      if (!generator) {
        writer.write('unknown');
      } else {
        generator.generate(templateType, writer);
      }
    });
    writer.write('>');
    return writer;
  }
}
