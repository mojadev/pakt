import { modelType, Registry } from "../code-generator";
import { toToRouterCodeModel } from "../router";
import { EcmaScriptImportGenerator, addBaseTypeScriptGenerators } from "../typescript";
import { Writer } from "../writer";
import { ZodAliasGenerator } from "../zod/alias";
import { ZodCompositeGenerator } from "../zod/composite";
import { ZodGenericGenerator } from "../zod/generic";
import { ZodInterfaceGenerator } from "../zod/interface";
import { ZodRouterModelGenerator } from "../zod/router-model";
import { RoutingModel } from "../../model";
import { RouterRawDefinition, TypeScriptModule } from "model";
import { DataTypeGenerator } from "./data-types";
import { KoaRouterGenerator } from "./koa-router";
import { OperationTypeGenerator } from "./operations";
import { SchemaFileGenerator } from "./schema";

export class KoaRecipe {
  api: TypeScriptModule[] = [];

  typescriptGenerator = new Registry();
  validatorGenerator = new Registry();

  constructor(private readonly model: RoutingModel) {
    addBaseTypeScriptGenerators(this.typescriptGenerator);
    this.typescriptGenerator.add(new DataTypeGenerator());
    this.typescriptGenerator.add(new OperationTypeGenerator(this.typescriptGenerator));
    this.typescriptGenerator.add(new KoaRouterGenerator(this.typescriptGenerator));
    this.validatorGenerator.add(new EcmaScriptImportGenerator());
    this.validatorGenerator.add(new ZodAliasGenerator());
    this.validatorGenerator.add(new ZodCompositeGenerator(this.validatorGenerator));
    this.validatorGenerator.add(new ZodInterfaceGenerator(this.validatorGenerator));
    this.validatorGenerator.add(new ZodGenericGenerator(this.validatorGenerator));
    this.validatorGenerator.add(new ZodRouterModelGenerator(this.validatorGenerator));
  }

  generateImplementation(): Record<string, string> {
    const schemaGenerator = new SchemaFileGenerator(this.typescriptGenerator);
    const schemas = schemaGenerator.generate(this.model, new Writer("components/schemas")).toString();
    const files = {
      "api-types.ts": this.typescriptGenerator.generateCode({ [modelType]: "api-types" }, new Writer()).toString(),
      "components/schemas.ts": schemas,
      "router.ts": this.typescriptGenerator.generateCode(toToRouterCodeModel(this.model), new Writer()).toString(),
      "components/parse-schemas.ts": this.validatorGenerator
        .generateCode(new RouterRawDefinition(this.model), new Writer())
        .toString(),
    } as Record<string, string>;

    return files;
  }
}
