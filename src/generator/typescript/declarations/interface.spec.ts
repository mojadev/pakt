import { TypeScriptInterface, TypeScriptTypeAlias } from "model";
import { Registry } from "generator/code-generator";
import { expectSource } from "generator/source-assertions";
import {
  TypeScriptAliasFieldGenerator,
  TypeScriptInterfaceFieldGenerator,
  TypeScriptInterfaceGenerator,
} from "./interface";

describe("Interface code generator", () => {
  const registry = new Registry();
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new TypeScriptInterfaceFieldGenerator(registry));
  const generator = new TypeScriptInterfaceGenerator(registry);

  it("should generate an empty interface for an empty interface model", () => {
    const interfaceModel = new TypeScriptInterface("Test");

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test", {});
    expect(sourceCode.toString()).toContain("{");
  });

  it("should not export interfaces that do not have the exported flag set to true", () => {
    const interfaceModel = new TypeScriptInterface("Test", false);

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test", {}).withoutExport();
  });

  it("should export interfaces that have the exported flag set to true", () => {
    const interfaceModel = new TypeScriptInterface("Test");

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test", {}).withExport();
  });

  it.each`
    type         | expected
    ${"string"}  | ${{ expect: "string" }}
    ${"number"}  | ${{ expect: "number" }}
    ${"boolean"} | ${{ expect: "boolean" }}
  `("should declare ${type} alias types as interface fields", ({ type, expected }) => {
    const interfaceModel = new TypeScriptInterface("Test").addField("expect", new TypeScriptTypeAlias("expect", type));

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test", expected).withExport();
  });

  it("should declare nested definitions as objects", () => {
    const interfaceModel = new TypeScriptInterface("Test").addField(
      "expect",
      new TypeScriptInterface("expect").addField("name", new TypeScriptTypeAlias("name", "string"))
    );

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString())
      .toContainInterfaceDeclaration("Test", {
        expect: "{ name?: string; }",
      })
      .withExport();
  });

  it("should not require optional types", () => {
    const interfaceModel = new TypeScriptInterface("Test")
      .addField("optional", new TypeScriptTypeAlias("optional", "string"), false)
      .addField("required", new TypeScriptTypeAlias("required", "string"), true);

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test").withOptionalProperty("optional");
    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test").withRequiredProperty("required");
  });

  it("should not make properties identified by numbers optional ", () => {
    const interfaceModel = new TypeScriptInterface("Test").addField(
      200,
      new TypeScriptTypeAlias("optional", "string"),
      false
    );

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString()).toContainInterfaceDeclaration("Test").withRequiredProperty(200);
  });

  it("should quote properties that contain non ascii characters", () => {
    const interfaceModel = new TypeScriptInterface("Test").addField(
      "application/json",
      new TypeScriptTypeAlias("application/json", "string"),
      false
    );

    const sourceCode = generator.generate(interfaceModel);

    expectSource(sourceCode.toString())
      .toContainInterfaceDeclaration("Test")
      .withOptionalProperty('"application/json"');
  });
});
