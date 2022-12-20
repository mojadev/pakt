import { CodeGenerator, Registry } from '../code-generator';
import { generateCodeModelForType } from '../typescript/mapper';
import { identifyImports } from '../typescript/mapper/identify-imports';
import { Writer } from '../writer';
import { iterateObject } from '../../iterate-object';
import { RoutingModel } from '../../model';
import { getModelType } from '../../model/code-model.decorator';

export class SchemaFileGenerator implements CodeGenerator<RoutingModel> {
  constructor(private readonly registry: Registry) {}

  generate(model: RoutingModel, writer: Writer = new Writer()): Writer {
    writer.writeLine('/* eslint-disable @typescript-eslint/array-type */');
    iterateObject(model.types)
      .map(([key, typeModel]) => generateCodeModelForType(key, typeModel))
      .flatMap((model) => [...identifyImports(model), model])
      .sort((a) => (getModelType(a) === 'import' ? -1 : 1))
      .forEach((model) => this.registry.generateCode(model, writer));
    return writer;
  }
}
