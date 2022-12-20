import { CodeModel, modelType } from "../generator/code-generator";
import { codeModel } from "./code-model.decorator";
import { MethodName, RouterPath, RoutingModel, TypeModel } from "./types";

const aliasSource = Symbol("aliasSource");

/**
 * Model representing the code that should be generated.
 */
@codeModel("folder")
export class Folder {
  constructor(public readonly name: string, public readonly children: Array<TypeScriptModule | Folder>) {}
}

@codeModel("typeScriptModule")
export class TypeScriptModule {
  models: CodeModel<string>[] = [];

  constructor(public readonly filename: string) {}

  addModel(model: CodeModel<string>) {
    this.models = [...this.models, model];
    return this;
  }
}

@codeModel("import")
export class EcmaScriptImport {
  defaultImport?: string;
  namespaceImport?: string;
  namedImports?: string[];

  constructor(public readonly path: string, public readonly library: boolean = false) {}

  setDefaultImport(name: string) {
    this.defaultImport = name;
    return this;
  }

  setNamespaceImport(name: string) {
    this.namespaceImport = name;
    return this;
  }

  addNamedImports(name: string[]) {
    this.namedImports = Array.from(new Set([...name, ...(this.namedImports || [])]).values());
    return this;
  }
}

@codeModel("alias")
export class TypeScriptTypeAlias {
  [aliasSource]?: string = "";

  constructor(public readonly name: string, public readonly alias: string, public readonly exported: boolean = true) {}

  withAliasSource(source: string) {
    this[aliasSource] = source;
    return this;
  }

  getAliasSource() {
    return this[aliasSource];
  }

  isArray() {
    return this.alias.endsWith("[]");
  }

  get baseType() {
    return this.alias.split("[")[0];
  }
}

@codeModel("composite")
export class TypeScriptTypeComposition {
  children: TypeScriptDataStructure[] = [];

  constructor(
    public readonly name: string,
    public readonly conjunction: "union" | "intersection" | "selection" | "negation",
    public readonly exported: boolean = true
  ) {}

  addChild(child: TypeScriptDataStructure) {
    this.children = [...this.children, child];
    return this;
  }

  addChildIf(condition: { (): boolean }, child: TypeScriptDataStructure) {
    if (!condition()) {
      return this;
    }
    this.children = [...this.children, child];
    return this;
  }
}

@codeModel("interface")
export class TypeScriptInterface {
  definition: TypeScriptInterfaceDefinition = {};

  constructor(public readonly name: string, public readonly exported = true) {}

  addField(fieldName: FieldName, value: TypeScriptDataStructure, required = false) {
    this.definition[fieldName] = value;
    this.definition[fieldName].required = required;
    return this;
  }
}

@codeModel("objectType")
export class TypeScriptObjectTypeLiteral {
  definition: TypeScriptInterfaceDefinition = {};

  constructor(public readonly name: string, public readonly exported = true) {}

  addField(fieldName: FieldName, value: TypeScriptDataStructure, required = false) {
    this.definition[fieldName] = value;
    this.definition[fieldName].required = required;
    return this;
  }
}

@codeModel("generic")
export class TypeScriptGeneric {
  constructor(
    public readonly name: string,
    public readonly genericName: string,
    public readonly templateType: TypeScriptDataStructure,
    public readonly exported = true
  ) {}
}

/**
 * Todo: Implement generics properly
 */
@codeModel("generic")
export class TypeScriptGenericV2 {
  constructor(public readonly name: string, public baseType = TypeScriptTypeAlias, public readonly exported = true) {}
}

export type TypeScriptDataStructure =
  | TypeScriptTypeAlias
  | TypeScriptInterface
  | TypeScriptTypeComposition
  | TypeScriptGeneric;

export type TypeScriptInterfaceDefinition = Record<
  FieldName,
  TypeScriptDataStructure & { required?: boolean; readonly?: boolean }
>;

export type FieldName = string | number;

@codeModel("router:raw")
export class RouterRawDefinition implements RoutingModel {
  routerPaths: RouterPath[];
  types: Record<string, TypeModel>;

  constructor(readonly model: RoutingModel) {
    this.routerPaths = model.routerPaths;
    this.types = model.types;
  }
}

@codeModel("router")
export class RouterDefinition {
  operations: RouterOperation[] = [];

  addOperation(operation: RouterOperation) {
    this.operations = [...this.operations, operation];
    return this;
  }
}

@codeModel("router:operation")
export class RouterOperation {
  implementations: RouterOperationImplementation[] = [];

  constructor(public readonly method: MethodName, public readonly path: string, public readonly name: string) {}

  addImplementation(implementation: RouterOperationImplementation) {
    this.implementations = [...this.implementations, implementation];
    return this;
  }

  allResponses() {
    return this.implementations
      .flatMap((operation) => operation.responses.map((response) => ({ ...response, mimeType: operation.mimeType })))
      .filter(Boolean);
  }

  responseInterface(mimeType: string): TypeScriptInterface {
    const responseInterface = new TypeScriptInterface(mimeType);
    const response = this.implementations.find((impl) => impl.mimeType === mimeType);
    response?.responses.forEach((impl) => {
      responseInterface.addField(impl.status, impl.payload || new TypeScriptTypeAlias("void", "void"), true);
    });
    return responseInterface;
  }
}

export interface RouterOperationImplementation {
  mimeType: MimeType;
  params: Omit<Parameter, "required">[];
  queryParams: Parameter[];
  responses: Response[];
}

export interface Response {
  status: number;
  payload?: TypeScriptDataStructure;
}

export interface Parameter {
  name: string;
  format: "simple" | "matrix" | "label";
  explode: boolean;
  type: TypeScriptDataStructure;
  required?: boolean;
}

type MimeType = string;

export const toPlainObject = (x: unknown) => JSON.parse(JSON.stringify(x));
