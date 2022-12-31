import { TypeModel, TypePath } from '../../../model';

export const resolveConflicts = (type: Record<TypePath, TypeModel>): Record<TypePath, TypeModel> => {
  const result: Record<TypePath, TypeModel> = { ...type };
  Object.entries(type).forEach(([name, value]) => {
    const references = getAllReferencesInModel(value);
    if (references.includes(name)) {
      result['_' + name] = { ...value };
      result[name] = replaceReferences(value, name, '_' + name);
    }
    references.forEach((reference) => {
      if (!type[reference]) {
        console.warn('Could not find reference', reference, 'in types', Object.keys(type));
      }
      const references = getAllReferencesInModel(type[reference]);
      if (type[reference] && references.includes(name)) {
        result[reference] = replaceReferences(type[reference], name, '_' + name);
        result['_' + name] = { ...value };
      }
    });
  });
  return result;
};

const replaceReferences = (type: TypeModel, source: string, replacement: string): TypeModel => {
  if (type.type === 'ref' && type.ref && type.ref === source) {
    return { ...type, ref: replacement };
  }

  const result: TypeModel = { ...type };
  if (type.children != null) {
    result.children = type.children.map((x) => replaceReferences(x, source, replacement));
  }
  if (type.properties != null) {
    result.properties = Object.entries(type.properties).reduce(
      (prev, [key, value]) => ({ ...prev, [key]: replaceReferences(value, source, replacement) }),
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
