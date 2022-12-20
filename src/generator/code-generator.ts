import { getModelType } from "../model/code-model.decorator";
import { Writer } from "./writer";

export type CodeGeneratorRegistry = Record<ModuleType, CodeGenerator<unknown>>;

export class Registry {
  entries: CodeGeneratorRegistry = {};

  public add(generator: CodeGenerator<unknown>) {
    this.entries[getModelType(generator) || ""] = generator;
  }

  public forModel(model: object): CodeGenerator<unknown> {
    const modelType = getModelType(model);
    if (!modelType || !this.entries[modelType]) {
      return {
        generate: (_, writer = new Writer()) => {
          writer.writeLine("/* Missing generator for " + modelType + " */");
          return writer;
        },
      };
    }
    return this.entries[modelType];
  }

  public generateCode(model: object, writer: Writer): Writer {
    this.forModel(model).generate(model, writer);
    return writer;
  }
}

export interface CodeGenerator<T> {
  generate(model: T, writer: Writer): Writer;
}

export const generateCode = (model: object, registry: Registry): string => {
  const modelType = getModelType(model);
  if (!modelType) {
    return "";
  }

  const generator = registry.forModel(model);
  if (!generator) {
    return "";
  }
  return generator.generate(model, new Writer()).toString();
};

export const modelType = Symbol("modelType");

export interface CodeModel<ModelType extends string> {
  [modelType]: ModelType;
}

export type SourceCode = string;

type ModuleType = string;
