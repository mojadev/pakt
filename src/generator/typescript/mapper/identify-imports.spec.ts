import {
  EcmaScriptImport,
  TypeScriptGeneric,
  TypeScriptInterface,
  TypeScriptTypeAlias,
  TypeScriptTypeComposition,
} from "../../../model/generated-code-model";
import { identifyImports, simplifyImports } from "./identify-imports";

describe("Import identifier", () => {
  it("should return an empty array for data structures without imports", () => {
    const imports = identifyImports(new TypeScriptTypeAlias("Username", "string"));

    expect(imports).toEqual([]);
  });

  it("should return an import for aliases with a source", () => {
    const imports = identifyImports(
      new TypeScriptTypeAlias("Username", "UsernameType").withAliasSource("components/schema")
    );

    expect(imports).toEqual([new EcmaScriptImport("components/schema").addNamedImports(["UsernameType"])]);
  });

  it("should traverse through interfaces and add their imports", () => {
    const imports = identifyImports(
      new TypeScriptInterface("Username").addField(
        "user",
        new TypeScriptTypeAlias("Username", "Username").withAliasSource("components/schema")
      )
    );

    expect(imports).toEqual([new EcmaScriptImport("components/schema").addNamedImports(["Username"])]);
  });

  it("should group imports of the same type", () => {
    const imports = identifyImports(
      new TypeScriptInterface("Username")
        .addField("user", new TypeScriptTypeAlias("Username", "Username").withAliasSource("components/schema"))
        .addField("account", new TypeScriptTypeAlias("Account", "Account").withAliasSource("components/schema"))
        .addField("id", new TypeScriptTypeAlias("UserId", "UserId").withAliasSource("components/schema"))
    );

    expect(imports.length).toEqual(1);
    expect(imports[0].namedImports?.sort()).toEqual(["Username", "Account", "UserId"].sort());
  });

  it("should resolve imports for composite types", () => {
    const imports = identifyImports(
      new TypeScriptTypeComposition("User", "selection")
        .addChild(new TypeScriptTypeAlias("User_0", "Person").withAliasSource("components/schema"))
        .addChild(new TypeScriptTypeAlias("User_1", "SystemUser").withAliasSource("components/schema"))
    );

    expect(imports.length).toEqual(1);
    expect(imports[0].namedImports?.sort()).toEqual(["Person", "SystemUser"].sort());
  });

  it("should remove duplicates", () => {
    const imports = simplifyImports([
      new EcmaScriptImport("./file").addNamedImports(["symbol1", "symbol2"]),
      new EcmaScriptImport("./file2").addNamedImports(["symbol1", "symbol2"]),
      new EcmaScriptImport("./file").addNamedImports(["symbol2", "symbol3"]),
    ]);

    expect(imports.length).toEqual(2);
    expect(imports.map((x) => x.path)).toEqual(["./file", "./file2"]);
  });

  it("should resolve imports for generic types", () => {
    const imports = identifyImports(
      new TypeScriptGeneric(
        "name",
        "Array",
        new TypeScriptTypeAlias("User_0", "Person").withAliasSource("components/schema")
      )
    );

    expect(imports.length).toEqual(1);

    expect(imports[0].namedImports).toEqual(["Person"]);
  });
});
