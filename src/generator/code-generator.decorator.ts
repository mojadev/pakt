import { CodeGenerator, modelType } from './code-generator';

export function codeGenerator(type: string) {
  return function <T extends new (...args: any[]) => CodeGenerator<any>>(constructor: T) {
    return class extends constructor {
      [modelType] = type;
    };
  };
}
