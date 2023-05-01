import { RoutingModel, TypeScriptModule } from '../../../model';
import { modelType, Registry } from '../../code-generator';
import { ModelOnlyRecipe } from '../models';
import { toToRouterCodeModel } from '../../router';
import { addBaseTypeScriptGenerators } from '../../typescript';
import { Writer } from '../../writer';
import { DataTypeGenerator } from './data-types';
import { KoaRouterGenerator } from './koa-router';
import { OperationTypeGenerator } from './operations';

export class KoaRecipe {
  api: TypeScriptModule[] = [];
  typescriptGenerator = new Registry();
  modelGenerator: ModelOnlyRecipe;

  constructor(private readonly model: RoutingModel) {
    this.modelGenerator = new ModelOnlyRecipe(model);

    addBaseTypeScriptGenerators(this.typescriptGenerator);
    this.typescriptGenerator.add(new DataTypeGenerator());
    this.typescriptGenerator.add(new OperationTypeGenerator(this.typescriptGenerator));
    this.typescriptGenerator.add(new KoaRouterGenerator(this.typescriptGenerator));
  }

  generateImplementation(): Record<string, string> {
    const files = {
      ...this.modelGenerator.generateImplementation(),
      'api-types.ts': this.typescriptGenerator.generateCode({ [modelType]: 'api-types' }, new Writer()).toString(),
      'router.ts': this.typescriptGenerator.generateCode(toToRouterCodeModel(this.model), new Writer()).toString(),
    } as Record<string, string>;

    return files;
  }
}
