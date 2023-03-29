import { generateCodeModelForType } from '.';
import { isType } from '../../../model/code-model.decorator';
import { TypeScriptGeneric, TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { TypeHandlerCandidate } from './type';

export const arrayHandler: TypeHandlerCandidate = (name, type) => {
  if (type.type !== 'array') {
    return;
  }
  if (!type.children?.length) {
    return;
  }

  const resolvedArrayType = generateCodeModelForType('nameGenericValue', type.children[0]);

  if (isType('alias', resolvedArrayType)) {
    const childType = type.children[0].type ?? 'unknown';
    if (['oneOf', 'anyOf', 'allOf'].includes(childType)) {
      return new TypeScriptGeneric(name, 'Array', [resolvedArrayType]);
    }
    if (childType !== 'ref') {
      return new TypeScriptTypeAlias(name, `${childType}[]`);
    }
  }
  return new TypeScriptGeneric(name, 'Array', [resolvedArrayType]);
};
