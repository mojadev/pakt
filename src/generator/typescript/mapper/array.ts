import { generateCodeModelForType } from ".";
import { isType } from "../../../model/code-model.decorator";
import { TypeScriptGeneric, TypeScriptTypeAlias } from "../../../model/generated-code-model";
import { TypeHandlerCandidate } from "./type";

export const arrayHandler: TypeHandlerCandidate = (name, type) => {
  if (type.type !== "array") {
    return;
  }
  if (!type.children?.length) {
    return;
  }

  const resolvedArrayType = generateCodeModelForType("nameGenericValue", type.children[0]);
  if (isType("alias", resolvedArrayType) && type.children[0].type !== "ref") {
    return new TypeScriptTypeAlias(name, `${type.children[0].type}[]`);
  }
  return new TypeScriptGeneric(name, "Array", resolvedArrayType);
};
