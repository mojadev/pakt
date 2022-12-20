import { TypeModel } from "../../model";

const isSimpleType = (type: TypeModel) => !["anyOf", "allOf", "array", "object", "ref"].includes(type.type);

/**
 * Generate a type declaration for the given {@see TypeModel} under the provided name.
 *
 * @param name  The name of the type declaration
 * @param type  The type that should be declared.
 *
 * @returns A typescript string declaring the type under the given name
 */
export const typeDeclaration = (name: string, type: TypeModel): string => {
  const doc = type.documentation
    ? `/**
 * ${type.documentation || ""}
 */`
    : ``;
  return `${doc}\n${createTypeDeclaration(name, type)}`;
};

const createTypeDeclaration = (name: string, type: TypeModel): string => {
  if (isSimpleType(type)) {
    return `export type ${name} = ${toTypeScriptType(type.type)};`;
  }

  if (type.type === "ref") {
    // ToDo: Proper ref handling
    // - ref to different files
    return `export type ${name} = ${type.ref?.replace("#/schema/components/", "")};`;
  }

  if (type.type === "anyOf") {
    return unionType(type.children, name, "|");
  }
  if (type.type === "allOf") {
    return unionType(type.children, name, "&");
  }

  if (type.type === "array") {
    const arrayType = (type.children || [{ type: "any" }])[0];
    if (arrayType.type === "object") {
      return arrayReferenceToElemType(name, arrayType);
    }
    return arrayReferenceToExistingType(arrayType, name);
  }

  if (type.type === "object") {
    const properties = type.properties || {};
    return `export interface ${name} {
${Object.keys(properties)
  .map((propertyKey) => interfaceMember(propertyKey, properties[propertyKey]))
  .join("\n")}      
}`;
  }
  return `export type ${name} = unknown;`;
};

export const interfaceMember = (name: string, property: TypeModel) => {
  switch (property.type) {
    case "string":
    case "boolean":
    case "number":
    case "date":
      return `  ${name}: ${toTypeScriptType(property.type)};`;
    case "array":
      if (!property.children) {
        return `  ${name}: unknown[];`;
      }
      return `  ${name}: ${arrayDeclaration(property.children[0])};`;
    case "ref":
      return `  ${name}: ${property.ref || "any"};`;
    default:
      return `  ${name}: any;`;
  }
};

export const arrayDeclaration = (type: TypeModel) => {
  if (isSimpleType(type)) {
    return toTypeScriptType(type.type) + "[]";
  }
  return "unknown";
};

export const unionType = (types: TypeModel[] | undefined, name: string, unionType: "&" | "|") => {
  if (!types || !types.length) {
    return `export type ${name} = unknown`;
  }
  const utilityTypes: string[] = [];

  const unionDeclaration = types
    .map((type, idx) => {
      if (isSimpleType(type)) {
        return toTypeScriptType(type.type);
      }
      if (type.type === "ref") {
        return type.ref || "unknown";
      }
      const utilityTypeName = name + "Candidate_" + (idx + 1);
      utilityTypes.push(typeDeclaration(utilityTypeName, type));
      return utilityTypeName;
    })
    .join(` ${unionType} `);

  return [utilityTypes.join("\n"), `export type ${name} = ${unionDeclaration}`].join("\n");
};

const toTypeScriptType = (type: TypeModel["type"]) => {
  const map = { date: "Date", binary: "Buffer", base64: "Buffer" } as Record<TypeModel["type"], string>;
  return map[type] || type;
};

function arrayReferenceToExistingType(arrayType: TypeModel, name: string) {
  let typeDeclaration: string = arrayType.type;
  if (arrayType.type === "ref") {
    typeDeclaration = arrayType.ref || "unknown";
  }

  return `export type ${name} = ${typeDeclaration}[]`;
}

function arrayReferenceToElemType(name: string, arrayType: TypeModel) {
  const utilityTypeName = name + "ArrayElement";
  return [typeDeclaration(utilityTypeName, arrayType), `export type ${name} = ${utilityTypeName}[]`].join("\n");
}
