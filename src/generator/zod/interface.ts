import { EcmaScriptImport, TypeScriptGeneric, TypeScriptInterface } from '../../model/generated-code-model';
import { CodeGenerator, Registry } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { Writer } from '../writer';

@codeGenerator('interface')
export class ZodInterfaceGenerator implements CodeGenerator<TypeScriptInterface> {
  constructor(
    private readonly registry: Registry,
    private readonly zodImport: EcmaScriptImport = new EcmaScriptImport('zod').setDefaultImport('z')
  ) {}

  generate(model: TypeScriptInterface, writer: Writer): Writer {
    writer
      .write(this.zodImport.defaultImport ?? 'z')
      .write('.object(')
      .inlineBlock(() => {
        Object.entries(model.definition).forEach(([key, value]) => {
          if (/^[A-Z]+$/gi.test(key)) {
            writer.write(String(key)).write(': ');
          } else {
            writer.quote(String(key)).write(': ');
          }
          this.registry.generateCode(value, writer);
          writer.conditionalWrite(!value.required, '.optional()');
          writer.write(',');
          writer.newLine();
        });
      })
      .write(')');

    // Records are modelled as passthrough for now.
    if (model.extends.filter(TypeScriptGeneric.isType).some((extension) => extension.genericName === 'Record')) {
      writer.write('.passthrough()');
    }
    return writer;
  }
}
