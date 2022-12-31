import { CodeGenerator } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { Writer } from '../writer';
import { EcmaScriptImport, TypeScriptLiteral } from '../../model';

@codeGenerator('literal')
export class ZodLiteralGenerator implements CodeGenerator<TypeScriptLiteral> {
  constructor(private readonly zodImport: EcmaScriptImport = new EcmaScriptImport('zod').setDefaultImport('z')) {}

  generate(model: TypeScriptLiteral, writer: Writer): Writer {
    writer
      .write(this.zodImport.defaultImport ?? 'z')
      .write('.literal')
      .write('(')
      .quote(model.value)
      .write(')');

    return writer;
  }
}
