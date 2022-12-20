import { CodeGenerator, modelType, Registry } from "./code-generator";

export function codeGenerator(type: string) {
  return function <T extends { new (...args: any[]): CodeGenerator<unknown> }>(constructor: T) {
    return class extends constructor {
      [modelType] = type;
    };
  };
}
