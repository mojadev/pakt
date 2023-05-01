import { pascalCase } from 'change-case';
import { EcmaScriptImport, TypeScriptTypeAlias } from '../../model/generated-code-model';
import { CodeGenerator } from '../code-generator';
import { codeGenerator } from '../code-generator.decorator';
import { Writer } from '../writer';

@codeGenerator('alias')
export class ZodAliasGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  private fieldGenerator = new TypeScriptAliasFieldGenerator();
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

  constructor(private readonly zodImport: EcmaScriptImport = new EcmaScriptImport('zod').setDefaultImport('z')) {}

  generate(model: TypeScriptTypeAlias, writer: Writer) {
    if (model.markedAsLazy()) {
      return this.generateLazy(model, writer);
    }
    return this.generateAlias(model, writer);
  }

  generateAlias(model: TypeScriptTypeAlias, writer: Writer): Writer {
    const value = model.alias;

    if (!model.import && !this.primitives[model.baseType] && !this.customDirectives[model.baseType]) {
      writer.write('Schemas.' + pascalCase(value + '_Schema'));
      return writer;
    }
    if (model.import) {
      writer.write(model.import.defaultImport + '.SchemaParser.' + pascalCase(value + '_Schema'));
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

  generateLazy(model: TypeScriptTypeAlias, writer: Writer) {
    const zodImport = this.zodImport.defaultImport ?? 'z';
    const alias = new TypeScriptTypeAlias(model.name, model.alias, model.exported);
    const aliasSource = model.getAliasSource();

    if (aliasSource) {
      alias.withAliasSource(aliasSource);
    }
    if (model.import) {
      alias.withAliasImport(model.import);
    }

    writer.write(zodImport).write('.lazy((): ').write(zodImport).write('.ZodType<');
    this.fieldGenerator.generate(alias, writer);
    writer.write('> => ');
    this.generateAlias(alias, writer);
    writer.write(')');
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

export class TypeScriptAliasFieldGenerator implements CodeGenerator<TypeScriptTypeAlias> {
  generate(model: TypeScriptTypeAlias, writer: Writer): Writer {
    if (model.import) {
      writer.write(`${model.import.defaultImport}.Schema.`);
    } else {
      writer.write('types.');
    }
    writer.write(model.alias);
    return writer;
  }
}
