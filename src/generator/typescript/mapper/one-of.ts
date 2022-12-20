import { generateCodeModelForType } from ".";
import { TypeScriptTypeComposition } from "../../../model/generated-code-model";
import { TypeHandlerCandidate } from "./type";

export const oneOfCompositionHandler: TypeHandlerCandidate = (name, type) => {
  if (type.type !== "oneOf" || !type.children) {
    return undefined;
  }
  if (type.children.length === 1) {
    return generateCodeModelForType(name, type.children[0]);
  }

  const composition = new TypeScriptTypeComposition(name, "selection");
  type.children?.forEach((type, i) => composition.addChild(generateCodeModelForType(`${name}_${i}`, type)));

  return composition;
};
