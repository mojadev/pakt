import { ObjectDestructuringAssignment, ObjectTypeDeclaration } from "@ts-morph/common/lib/typescript";
import { iterateObject } from "../../../iterate-object";
import { isType } from "../../../model/code-model.decorator";
import {
  EcmaScriptImport,
  TypeScriptDataStructure,
  TypeScriptGeneric,
  TypeScriptInterface,
  TypeScriptObjectTypeLiteral,
  TypeScriptTypeAlias,
  TypeScriptTypeComposition,
} from "../../../model/generated-code-model";

/**
 * Identify all imports of the given data structure.
 *
 * @param dataStructure
 */
export const identifyImports = (dataStructure: TypeScriptDataStructure, isRoot = true): EcmaScriptImport[] => {
  let imports: EcmaScriptImport[] = [];
  if (isType<TypeScriptTypeAlias>("alias", dataStructure)) {
    imports = [createImport(dataStructure, isRoot)].filter(Boolean) as EcmaScriptImport[];
  }

  if (
    isType<TypeScriptObjectTypeLiteral>("objectType", dataStructure) ||
    isType<TypeScriptInterface>("interface", dataStructure)
  ) {
    imports = [
      ...imports,
      ...iterateObject(dataStructure.definition).flatMap(([_, value]) => identifyImports(value, true)),
    ];
  }

  if (isType<TypeScriptTypeComposition>("composite", dataStructure)) {
    imports = [...imports, ...dataStructure.children.flatMap((value) => identifyImports(value, true))];
  }
  if (isType<TypeScriptGeneric>("generic", dataStructure)) {
    imports = [...imports, ...identifyImports(dataStructure.templateType)];
  }

  const reduced = imports.reduce((result, current) => {
    if (!result[current.path]) {
      result[current.path] = result[current.path] || current;
      return result;
    }
    result[current.path].addNamedImports(current.namedImports ?? []);
    return result;
  }, {} as Record<string, EcmaScriptImport>);

  return Object.values(reduced);
};

/**
 * Remove duplicates from a set of imports and create the minimal set of imports.
 *
 * This will ignore multiple default imports on the same path, as it is considered a corner case
 * and more of an implementation issue if we encounter this scenario.
 * This means two imports with the same source and default imports (import X from "./path"; import Y from "./path"')
 * will lead to only one default import being generated.
 *
 * @param imports
 * @returns
 */
export const simplifyImports = (imports: EcmaScriptImport[]): EcmaScriptImport[] => {
  const simplified: Record<string, EcmaScriptImport> = {};
  imports.forEach((importDeclaration) => {
    simplified[importDeclaration.path] =
      simplified[importDeclaration.path] || new EcmaScriptImport(importDeclaration.path);
    const targetImport = simplified[importDeclaration.path];
    targetImport.addNamedImports(importDeclaration.namedImports || []);
    targetImport.defaultImport = importDeclaration.defaultImport;
  });
  return Object.values(simplified);
};

const createImport = (alias: TypeScriptTypeAlias, isRoot = false) => {
  const source = alias.getAliasSource();
  if (!source) {
    return;
  }

  if (isRoot) {
    return new EcmaScriptImport(source).addNamedImports([alias.alias]);
  }

  return new EcmaScriptImport(source).addNamedImports([alias.name]);
};
