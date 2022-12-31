import { CodeGenerator, Registry } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';
import { getModelType, TypeScriptInterface, TypeScriptObjectTypeLiteral, TypeScriptTypeAlias } from '../../../model';

@codeGenerator('interface')
export class TypeScriptInterfaceGenerator implements CodeGenerator<TypeScriptInterface> {
  constructor(private readonly registry: Registry) {}

  generate(interfaceModel: TypeScriptInterface, writer = new Writer()): Writer {
    writer.conditionalWrite(interfaceModel.exported, () => 'export ');
    writer.write(`interface ${interfaceModel.name} `);
    this.writeExtendsClause(interfaceModel, writer);
    const fieldInterface = this.registry.entries['field:interface'];
    if (!fieldInterface) {
      writer.inlineBlock();
      writer.blankLine();
      return writer;
    }
    fieldInterface.generate(interfaceModel, writer);
    writer.blankLine();
    return writer;
  }

  private writeExtendsClause(interfaceModel: TypeScriptInterface, writer: Writer): void {
    if (interfaceModel.extends.length > 0) {
      writer.write('extends ');
      interfaceModel.extends.forEach((type, idx) => {
        if (idx) {
          writer.write(', ');
        }
        const generator = this.registry.entries['field:' + String(getModelType(type))];
        if (generator) {
          generator.generate(type, writer);
        }
      });
      writer.space();
    }
  }
}

@codeGenerator('objectType')
export class TypeScriptObjectTypeDefinitionGenerator implements CodeGenerator<TypeScriptObjectTypeLiteral> {
  constructor(private readonly registry: Registry) {}

  generate(interfaceModel: TypeScriptObjectTypeLiteral, writer = new Writer()): Writer {
    writer.conditionalWrite(interfaceModel.exported, () => 'export ');
    writer.write(`type ${interfaceModel.name} = `);

    const fieldInterface = this.registry.entries['field:interface'];
    if (!fieldInterface) {
      writer.inlineBlock();
      writer.blankLine();
      return writer;
    }
    fieldInterface.generate(interfaceModel, writer);
    writer.blankLine();
    return writer;
  }
}

@codeGenerator('field:alias')
export class TypeScriptAliasFieldGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  generate(model: TypeScriptTypeAlias, writer: Writer): Writer {
    writer.write(model.alias);
    return writer;
  }
}

@codeGenerator('field:interface')
export class TypeScriptInterfaceFieldGenerator implements CodeGenerator<TypeScriptInterface> {
  constructor(private readonly registry: Registry) {}

  generate({ definition }: TypeScriptInterface, writer: Writer): Writer {
    writer.inlineBlock(() =>
      Object.entries(definition).forEach(([fieldName, fieldType]) => {
        if (fieldName.toString().match(/^\w+$/) != null) {
          writer.write(`${fieldName}`);
        } else {
          writer.quote(`${fieldName}`);
        }
        if (fieldName.toString().match(/^\d+$/) == null) {
          writer.conditionalWrite(!fieldType.required, '?');
        }
        writer.write(':');
        writer.space();

        const fieldGenerator = this.registry.entries['field:' + String(getModelType(fieldType))];
        if (!fieldGenerator) {
          writer.write('unknown');
        } else {
          fieldGenerator.generate(fieldType, writer);
        }
        writer.write(';');
        writer.newLine();
      })
    );
    return writer;
  }
}
