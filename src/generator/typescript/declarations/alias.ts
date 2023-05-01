import { CodeGenerator, Registry } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';
import { getModelType, TypeScriptTypeAlias } from '../../../model';

@codeGenerator('alias')
export class TypeScriptAliasGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  constructor(private registry?: Registry) {}

  generate(model: TypeScriptTypeAlias, writer: Writer): Writer {
    writer.conditionalWrite(model.exported, 'export ').write('type ').write(model.name).write(' = ');

    const generator = this.registry?.entries['field:' + getModelType(model)] ?? new TypeScriptAliasFieldGenerator();
    generator.generate(model, writer).write(';').blankLine();
    return writer;
  }
}

@codeGenerator('field:alias')
export class TypeScriptAliasFieldGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  generate(model: TypeScriptTypeAlias, writer: Writer): Writer {
    if (model.import) {
      writer.write(`${model.import.defaultImport}.Schema.`);
    }
    writer.write(model.alias);
    return writer;
  }
}
