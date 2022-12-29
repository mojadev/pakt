import { CodeGenerator, modelType } from './code-generator';

export function codeGenerator(type: string) {
  // Required for mixin class
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends new (...args: any[]) => CodeGenerator<any>>(constructor: T) {
    return class extends constructor {
      [modelType] = type;
    };
  };
}
