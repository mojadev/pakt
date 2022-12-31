import { TypeModel, TypePath } from '../../../model';

const getReferences = (model: TypeModel): string[] => {
  if (model.ref) {
    return [model.ref];
  }
  if (model.properties != null) {
    return Object.values(model.properties).flatMap(getReferences);
  }
  if (model.children != null) {
    return model.children.flatMap(getReferences);
  }
  return [];
};

export const orderTypes = (types: Record<TypePath, TypeModel>): Array<[TypePath, TypeModel]> => {
  return Object.entries(types).sort(([aName, aType], [bName, bType]) => {
    const aReferences = getReferences(aType);
    const bReferences = getReferences(bType);

    if (aReferences.length === 0 && bReferences.length === 0) {
      return 0;
    }
    if (bReferences.length === 0) {
      return 1;
    }
    if (aReferences.length === 0) {
      return -1;
    }
    if (bReferences.includes(aName)) {
      return -1;
    }
    if (aReferences.includes(bName)) {
      return 1;
    }
    return 0;
  });
};
