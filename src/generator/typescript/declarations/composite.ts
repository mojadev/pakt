import { CodeGenerator, Registry } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';
import { getModelType, TypeScriptTypeComposition } from '../../../model';

@codeGenerator('composite')
export class TypeScriptCompositeGenerator implements CodeGenerator<TypeScriptTypeComposition> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptTypeComposition, writer: Writer): Writer {
    writer.conditionalWrite(model.exported, 'export ').write('type ').write(model.name).write(' = ');
    this.registry.entries['field:composite'].generate(model, writer);
    writer.write(';');
    return writer;
  }
}

@codeGenerator('field:composite')
export class TypeScriptCompositeFieldGenerator implements CodeGenerator<TypeScriptTypeComposition> {
  constructor(private readonly registry: Registry) {}

  generate(model: TypeScriptTypeComposition, writer: Writer): Writer {
    const lastIdx = model.children.length - 1;
    const joinSymbol = {
      union: ' | ',
      selection: ' | ',
      intersection: ' & ',
      negation: ' TODO ',
    }[model.conjunction];
    model.children.forEach((child, idx) => {
      const generator = this.registry.entries['field:' + String(getModelType(child))];
      if (!generator) {
        writer.write('unknown');
      } else {
        generator.generate(child, writer);
      }
      if (idx !== lastIdx) {
        writer.write(joinSymbol);
      }
    });

    return writer;
  }
}
