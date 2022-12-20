import { TypeScriptTypeAlias } from "../../model/generated-code-model";
import { Writer } from "../writer";
import { ZodAliasGenerator } from "./alias";

describe("zod alias generator", () => {
  const generator = new ZodAliasGenerator();

  it.each`
    primitive      | zodMethod
    ${"string"}    | ${"string"}
    ${"Date"}      | ${"date"}
    ${"BigInt"}    | ${"bigint"}
    ${"unknown"}   | ${"unknown"}
    ${"never"}     | ${"never"}
    ${"void"}      | ${"void"}
    ${"boolean"}   | ${"boolean"}
    ${"undefined"} | ${"undefined"}
    ${"any"}       | ${"any"}
  `("should generate a z.$zodMethod() for $primitive aliases", ({ primitive, zodMethod }) => {
    const result = generator.generate(new TypeScriptTypeAlias("Username", primitive), new Writer()).toString();

    expect(result).toEqual(`z.${zodMethod}()`);
  });

  it("should convert strings to numbers using a zod transform", () => {
    const result = generator.generate(new TypeScriptTypeAlias("IdParam", "number"), new Writer()).toString();

    expect(result).toEqual(`zStringAsNumber`);
  });

  /**
   * This assumes that all schemas are in the same file.
   */
  it("should use a Schema reference for type aliases", () => {
    const result = generator.generate(new TypeScriptTypeAlias("User", "UserReference"), new Writer()).toString();

    expect(result).toEqual(`UserReferenceSchema`);
  });

  it("should generate a zod array for arrays", () => {
    const result = generator.generate(new TypeScriptTypeAlias("ids", "string[]"), new Writer()).toString();

    expect(result).toEqual("z.string().array()");
  });
});
