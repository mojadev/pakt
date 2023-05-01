import { EcmaScriptImport, RoutingModel } from '../model';
import { getModelType } from '../model/code-model.decorator';
import { CodeGenerator, ECMAScriptModuleGenerator, Registry } from './code-generator';
import { generateCodeModelForType } from './typescript/mapper';
import { identifyImports } from './typescript/mapper/identify-imports';
import { Writer } from './writer';

const fileRules = [
  '/* eslint-disable @typescript-eslint/array-type */',
  '/* eslint-disable @typescript-eslint/no-empty-interface */',
  '/* eslint-disable @typescript-eslint/no-explicit-any */',
];

export class SchemaFileGenerator implements CodeGenerator<RoutingModel>, ECMAScriptModuleGenerator {
  additionalImports: EcmaScriptImport[] = [];

  constructor(private readonly registry: Registry) {}

  generate(model: RoutingModel, writer: Writer = new Writer()): Writer {
    fileRules.forEach(writer.writeLine);

    Object.entries(model.types)
      .map(([key, typeModel]) => generateCodeModelForType(key, typeModel))
      .flatMap((model) => [...identifyImports(model), ...this.additionalImports, model])
      .sort((a) => (getModelType(a) === 'import' ? -1 : 1))
      .forEach((model) => this.registry.generateCode(model, writer));
    return writer;
  }

  addImport(importStatement: EcmaScriptImport) {
    this.additionalImports = [...this.additionalImports, importStatement];
    return this;
  }
}
