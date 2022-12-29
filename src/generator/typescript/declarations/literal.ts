import { CodeGenerator } from 'generator/code-generator';
import { codeGenerator } from 'generator/code-generator.decorator';
import { Writer } from 'generator/writer';
import { TypeScriptLiteral } from 'model';

@codeGenerator('literal')
export class TypeScriptLiteralGenerator implements CodeGenerator<TypeScriptLiteral> {
  generate(model: TypeScriptLiteral, writer: Writer): Writer {
    writer
      .conditionalWrite(model.exported, 'export ')
      .write('type ')
      .write(model.name)
      .write(' = ')
      .quote(model.value)
      .write(';')
      .blankLine();
    return writer;
  }
}

@codeGenerator('field:literal')
export class TypeScriptLiteralFieldGenerator implements CodeGenerator<TypeScriptLiteral> {
  generate(model: TypeScriptLiteral, writer: Writer): Writer {
    writer.quote(model.value);
    return writer;
  }
}
