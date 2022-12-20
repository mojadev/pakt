import { TypeScriptTypeAlias, TypeScriptTypeComposition } from "../../model/generated-code-model";
import { Registry } from "../code-generator";
import { Writer } from "../writer";
import { ZodAliasGenerator } from "./alias";
import { ZodCompositeGenerator } from "./composite";

describe("Composite zod generator", () => {
  const registry = new Registry();
  const generator = new ZodCompositeGenerator(registry);
  registry.add(new ZodAliasGenerator());
  registry.add(generator);

  it("should create a union for union types", () => {
    const type = new TypeScriptTypeComposition("union", "union")
      .addChild(new TypeScriptTypeAlias("string", "string"))
      .addChild(new TypeScriptTypeAlias("number", "number"));

    const result = generator.generate(type, new Writer()).toString();

    expect(result).toEqual("z.union(z.string(), zStringAsNumber)");
  });
});
