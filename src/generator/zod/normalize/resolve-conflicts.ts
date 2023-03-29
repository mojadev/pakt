import { TypeModel, TypePath } from '../../../model';

export const resolveConflicts = (type: Record<TypePath, TypeModel>): Record<TypePath, TypeModel> => {
  const result: Record<TypePath, TypeModel> = { ...type };
  Object.entries(type).forEach(([name, value]) => {
    const references = getAllReferencesInModel(value);
    if (references.includes(name)) {
      result[name] = markReferencesAsLazy(value, name);
    }
    references.forEach((reference) => {
      if (!type[reference]) {
        console.warn('Could not find reference', reference, 'in types', Object.keys(type));
      }
      const references = getAllReferencesInModel(type[reference]);
      if (type[reference] && references.includes(name)) {
        result[reference] = markReferencesAsLazy(type[reference], name);
      }
    });
  });
  return result;
};

const markReferencesAsLazy = (type: TypeModel, source: string): TypeModel => {
  if (type.type === 'ref' && type.ref && type.ref.split('/').reverse()[0] === source) {
    return { ...type, lazy: true };
  }

  const result: TypeModel = { ...type };
  if (type.children != null) {
    result.children = type.children.map((x) => markReferencesAsLazy(x, source));
  }
  if (type.properties != null) {
    result.properties = Object.entries(type.properties).reduce(
      (prev, [key, value]) => ({ ...prev, [key]: markReferencesAsLazy(value, source) }),
      {}
    );
  }

  return result;
};

export const getAllReferencesInModel = (type: TypeModel): string[] => {
  if (type.type === 'ref' && type.ref) {
    return [type.ref.split('/').reverse()[0]];
  }
  const children = [...(type.children ?? []), ...Object.values(type.properties ?? {})];
  return children.flatMap(getAllReferencesInModel);
};
