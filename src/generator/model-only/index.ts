import { RouterRawDefinition, RoutingModel, TypeScriptModule } from '../../model';
import { Registry } from '../code-generator';
import { SchemaFileGenerator } from '../schema';
import { addBaseTypeScriptGenerators, EcmaScriptImportGenerator } from '../typescript';
import { Writer } from '../writer';
import { ZodAliasGenerator } from '../zod/alias';
import { ZodCompositeGenerator } from '../zod/composite';
import { ZodGenericGenerator } from '../zod/generic';
import { ZodInterfaceGenerator } from '../zod/interface';
import { ZodLiteralGenerator } from '../zod/literal';
import { ZodRouterModelGenerator } from '../zod/router-model';

export class ModelOnlyRecipe {
  api: TypeScriptModule[] = [];

  typescriptGenerator = new Registry();
  validatorGenerator = new Registry();

  constructor(private readonly model: RoutingModel) {
    addBaseTypeScriptGenerators(this.typescriptGenerator);
    this.validatorGenerator.add(new EcmaScriptImportGenerator());
    this.validatorGenerator.add(new ZodAliasGenerator());
    this.validatorGenerator.add(new ZodCompositeGenerator(this.validatorGenerator));
    this.validatorGenerator.add(new ZodInterfaceGenerator(this.validatorGenerator));
    this.validatorGenerator.add(new ZodGenericGenerator(this.validatorGenerator));
    this.validatorGenerator.add(new ZodLiteralGenerator());
    this.validatorGenerator.add(new ZodRouterModelGenerator(this.validatorGenerator));
  }

  generateImplementation(): Record<string, string> {
    const schemaGenerator = new SchemaFileGenerator(this.typescriptGenerator);
    const schemas = schemaGenerator.generate(this.model, new Writer('components/schemas')).toString();
    const files = {
      'components/schemas.ts': schemas,
      'components/parse-schemas.ts': this.validatorGenerator
        .generateCode(new RouterRawDefinition(this.model), new Writer())
        .toString(),
    } as Record<string, string>;

    return files;
  }
}