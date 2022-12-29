import { TypeModel, TypePath } from '../../../model';
import { TypeScriptDataStructure, TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { getTypeMapper } from './mapper';
import { TypeHandler } from './type';

const fallback: TypeHandler = (name) => new TypeScriptTypeAlias(name, 'unknown');

export const generateCodeModelForType: TypeHandler = (name: TypePath, type: TypeModel): TypeScriptDataStructure => {
  if (!type) {
    return new TypeScriptTypeAlias(name, 'never');
  }
  return (getTypeMapper().find((x) => x(name, type)) ?? fallback)(name, type) as TypeScriptDataStructure;
};
