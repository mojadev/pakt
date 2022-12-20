import { pascalCase } from 'change-case';
import { EcmaScriptImport, TypeScriptTypeAlias } from '../../model/generated-code-model';
import { CodeGenerator } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { Writer } from '../writer';

@codeGenerator('alias')
export class ZodAliasGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  constructor(private readonly zodImport: EcmaScriptImport = new EcmaScriptImport('zod').setDefaultImport('z')) {}
  private readonly primitives = {
    string: 'string',
    Date: 'date',
    BigInt: 'bigint',
    unknown: 'unknown',
    never: 'never',
    void: 'void',
    undefined: 'undefined',
    any: 'any',
    boolean: 'boolean',
  } as Record<string, string>;

  private readonly customDirectives = {
    number: 'zStringAsNumber',
  } as Record<string, string>;

  generate(model: TypeScriptTypeAlias, writer: Writer): Writer {
    if (!this.primitives[model.baseType] && !this.customDirectives[model.baseType]) {
      const value = model.alias;
      writer.write(pascalCase(value + '-Schema'));
      return writer;
    }
    if (this.primitives[model.baseType]) {
      this.writePrimitive(writer, model);
    } else {
      this.writeCustomDirective(writer, model);
    }
    if (model.isArray()) {
      writer.write('.array()');
    }
    return writer;
  }

  private writeCustomDirective(writer: Writer, model: TypeScriptTypeAlias): Writer {
    writer.write(this.customDirectives[model.baseType]);
    return writer;
  }

  private writePrimitive(writer: Writer, model: TypeScriptTypeAlias): Writer {
    writer
      .write(this.zodImport.defaultImport ?? 'z')
      .write('.')
      .write(this.primitives[model.baseType])
      .write('()');
    return writer;
  }
}
