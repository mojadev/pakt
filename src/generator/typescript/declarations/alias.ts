import { CodeGenerator } from 'generator/code-generator';
import { codeGenerator } from 'generator/code-generator.decorator';
import { Writer } from 'generator/writer';
import { TypeScriptTypeAlias } from 'model';

@codeGenerator('alias')
export class TypeScriptAliasGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  generate(model: TypeScriptTypeAlias, writer: Writer): Writer {
    writer
      .conditionalWrite(model.exported, 'export ')
      .write('type ')
      .write(model.name)
      .write(' = ')
      .write(model.alias)
      .write(';')
      .blankLine();
    return writer;
  }
}
