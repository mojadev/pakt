import type { TypeModel } from "../../../model";
import { TypeScriptDataStructure } from "../../../model/generated-code-model";

export type TypeHandler = {
  (name: string, type: TypeModel): TypeScriptDataStructure;
};
export type TypeHandlerCandidate = { (name: string, type: TypeModel): undefined | ReturnType<TypeHandler> };
