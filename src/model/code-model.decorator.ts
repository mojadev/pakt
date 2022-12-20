import { modelType } from '../generator/code-generator';

export function codeModel(type: string) {
  return function <T extends new (...args: any[]) => {}>(constructor: T) {
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

export function isType<Type extends Object>(identifier: string, codeModel: object): codeModel is Type {
  return getModelType(codeModel) === identifier;
}
