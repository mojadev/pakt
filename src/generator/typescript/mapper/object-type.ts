import { generateCodeModelForType } from '.';
import { TypeScriptGeneric, TypeScriptInterface, TypeScriptTypeAlias } from '../../../model/generated-code-model';
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
  if (typeDefinition.additionalProperties) {
    result.addExtends(
      new TypeScriptGeneric('additionalProperties', 'Record', [
        new TypeScriptTypeAlias('key', 'string'),
        new TypeScriptTypeAlias('value', 'any'),
      ])
    );
  }

  if (typeDefinition.properties == null) {
    return result;
  }

  Object.entries(typeDefinition.properties).forEach(([key, type]) =>
    result.addField(key, generateCodeModelForType(key, type), type.required ?? false)
  );
  return result;
};
