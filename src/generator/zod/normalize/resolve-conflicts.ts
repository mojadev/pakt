import { TypeModel, TypePath } from '../../../model';

export const resolveConflicts = (type: Record<TypePath, TypeModel>): Record<TypePath, TypeModel> => {
  const result: Record<TypePath, TypeModel> = { ...type };
  Object.keys(type).forEach((name) => {
    traverseReferenceChain(name, type, [name]);
  });
  return result;
};

const traverseReferenceChain = (currentNode: string, type: Record<TypePath, TypeModel>, chain: string[]) => {
  const references = getAllReferencesInModel(type[currentNode]);
  const lazyRefs = references.filter((reference) => chain.includes(reference));
  lazyRefs.forEach((lazyRef) => markReferencesAsLazy(type[currentNode], lazyRef));

  references
    .filter((x) => !chain.includes(x))
    .forEach((reference) => {
      if (!type[reference]) {
        console.warn('Could not find reference', reference, 'in types', Object.keys(type));
        return;
      }
      traverseReferenceChain(reference, type, [...chain, reference]);
    });
  return type;
};

const markReferencesAsLazy = (type: TypeModel, source: string): TypeModel => {
  if (type.type === 'ref' && type.ref && type.ref.split('/').reverse()[0] === source) {
    type.lazy = true;
    return type;
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
