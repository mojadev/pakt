import { generateCodeModelForType } from '.';
import { TypeScriptTypeComposition } from '../../../model/generated-code-model';
import { TypeHandlerCandidate } from './type';

export const notCompositionHandler: TypeHandlerCandidate = (name, type) => {
  if (type.type !== 'not' || type.children == null) {
    return undefined;
  }
  if (type.children.length === 1) {
    return generateCodeModelForType(name, type.children[0]);
  }

  const composition = new TypeScriptTypeComposition(name, 'negation');
  type.children?.forEach((type, i) => composition.addChild(generateCodeModelForType(`${name}_${i}`, type)));
  return composition;
};
