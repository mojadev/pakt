import { CodeGenerator } from '../../code-generator';
import { codeGenerator } from '../../code-generator.decorator';
import { Writer } from '../../writer';
import { TypeScriptLiteral } from '../../../model';

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
