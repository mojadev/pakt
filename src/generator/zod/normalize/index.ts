import { TypeModel, TypePath } from "model";
import { orderTypes } from "./order-types";
import { resolveConflicts } from "./resolve-conflicts";

export const normalize = (type: Record<TypePath, TypeModel>) => {
  return orderTypes(resolveConflicts(type));
};
