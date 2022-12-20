import { importModel } from "../../model";
import { KoaRecipe } from "./koa";
import { join } from "path";
import { expectSource } from "../source-assertions";

describe("Koa recipe", () => {
  const model = importModel(join(__dirname, "__test__", "api.yaml"));

  it("should generate a schemas.ts file", () => {
    const recipe = new KoaRecipe(model);

    const fileMap = recipe.generateImplementation();

    expect(fileMap["components/schemas.ts"]).toBeDefined();
  });

  it("should contain all types in the schema.ts file", () => {
    const recipe = new KoaRecipe(model);

    const fileMap = recipe.generateImplementation();
    expectSource(fileMap["components/schemas.ts"]).toContainInterfaceDeclaration("Order", {
      id: "number",
      petId: "number",
      quantity: "number",
      shipDate: "Date",
      status: "string",
      complete: "boolean",
    });
    expectSource(fileMap["components/schemas.ts"]).toContainInterfaceDeclaration("Category");
  });

  it("should generate array types correctly in the schema.ts file", () => {
    const recipe = new KoaRecipe(model);

    const fileMap = recipe.generateImplementation();

    expectSource(fileMap["components/schemas.ts"]).toContainInterfaceDeclaration("Pet", { photoUrls: "string[]" });
  });

  it("should generate an api type module in the operations folder", () => {
    const recipe = new KoaRecipe(model);

    const fileMap = recipe.generateImplementation();
    const source = fileMap["api-types.ts"];

    expectSource(source).toContainTypeAlias("Response", "GeneralResponse<TResponse, keyof TResponse>");
  });
});
