import { TypeModel, TypeScriptLiteral, TypeScriptTypeComposition } from '../../../model';
import { TypeHandlerCandidate } from './type';

export const literalCompositionHandler: TypeHandlerCandidate = (
  name: string,
  type: TypeModel
): ReturnType<TypeHandlerCandidate> => {
  if (type.type !== 'string' || !type.enum || type.enum.length < 1) {
    return;
  }
  const result = type.enum.map((enumValue, idx) => new TypeScriptLiteral(`${name}_${idx}`, enumValue));
  if (result.length === 1) {
    return result[0];
  }
  const composition = new TypeScriptTypeComposition(name, 'union');
  result.forEach(composition.addChild.bind(composition));
  return composition;
};
