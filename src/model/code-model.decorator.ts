import { modelType } from '../generator/code-generator';

export function codeModel(type: string) {
  // Required for mixin classes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends new (...args: any[]) => object>(constructor: T, ...rest: any[]) {
    return class extends constructor {
      [modelType] = type;
    };
  };
}

interface CodeModel {
  [modelType]: string;
}

const isCodeModel = (model: object): model is CodeModel => {
  return modelType in model;
};

export function getModelType(codeModel: object): string | undefined {
  if (!isCodeModel(codeModel)) {
    return;
  }
  return codeModel[modelType];
}

export function isType<Type extends object>(identifier: string, codeModel: object): codeModel is Type {
  return getModelType(codeModel) === identifier;
}
