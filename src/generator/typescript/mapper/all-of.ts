import { generateCodeModelForType } from '.';
import { TypeScriptTypeComposition } from '../../../model/generated-code-model';
import { TypeHandlerCandidate } from './type';

export const allOfCompositionHandler: TypeHandlerCandidate = (name, type) => {
  if (type.type !== 'allOf' || type.children == null) {
    return undefined;
  }
  if (type.children.length === 1) {
    return generateCodeModelForType(name, type.children[0]);
  }
  const composite = new TypeScriptTypeComposition(name, 'intersection');
  type.children?.forEach((type, i) => composite.addChild(generateCodeModelForType(`${name}_${i}`, type)));
  return composite;
};
