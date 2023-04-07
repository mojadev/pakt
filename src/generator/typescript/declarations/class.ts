import { getModelType, TypeScriptClassMethodModel, TypeScriptClassModel } from '../../../model';
import { CodeGenerator, Registry } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';

@codeGenerator('class')
export class TypeScriptClassGenerator implements CodeGenerator<TypeScriptClassModel> {
  methodGenerator = new TypeScriptClassMethodGenerator(this.registry);

  constructor(private registry: Registry) {}

  generate(model: TypeScriptClassModel, writer: Writer) {
    writer
      .write('export class ')
      .write(model.name)
      .inlineBlock(() => {
        model.getMethods().forEach((method) => this.methodGenerator.generate(method, writer));
      });

    return writer;
  }
}

@codeGenerator('class:method')
export class TypeScriptClassMethodGenerator implements CodeGenerator<TypeScriptClassMethodModel> {
  constructor(private registry: Registry) {}

  generate(model: TypeScriptClassMethodModel, writer: Writer) {
    writer
      .write(model.visibilty)
      .write(' ')
      .conditionalWrite(model.static, 'static ')
      .conditionalWrite(model.getter, 'get ')
      .write(model.name)
      .write('()');
    if (model.returnType) {
      writer.write(': ');

      const modelType = getModelType(model.returnType) ?? '';
      const generator = this.registry.entries['field:' + modelType];
      if (!generator) {
        writer.write('unknown');
      } else {
        generator.generate(model.returnType, writer);
      }
    }
    writer.block(() => writer.write(model.implementation));
    return writer;
  }
}
