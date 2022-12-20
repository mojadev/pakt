import { generateCodeModelForType } from '.';
import { iterateObject } from '../../../iterate-object';
import { TypeScriptInterface } from '../../../model/generated-code-model';
import { TypeHandlerCandidate } from './type';

/**
 * Map object references to typescript code objects.
 *
 * @param name
 * @param typeDefinition
 * @returns
 */
export const objectTypeParser: TypeHandlerCandidate = (name, typeDefinition) => {
  if (typeDefinition.type !== 'object') {
    return undefined;
  }

  const result = new TypeScriptInterface(name);
  if (typeDefinition.properties == null) {
    return result;
  }

  iterateObject(typeDefinition.properties).forEach(([key, type]) =>
    result.addField(key, generateCodeModelForType(key, type), type.required ?? false)
  );
  return result;
};
