import { program } from "commander";
import { importModel } from "../model";
import fs from "fs/promises";
import path from "path";
import { iterateObject } from "../iterate-object";
import { KoaRecipe } from "../generator/koa/koa";

program
  .command("generate <file> <folder>")
  .description("Generate or regenerate models from the OpenAPI 3+ spec")
  .action(async (file: string, folder: string) => {
    await generateApi(file, folder);
  });

export async function generateApi(file: string, folder: string) {
  const model = importModel(file);
  const recipe = new KoaRecipe(model);
  const basePath = folder;
  try {
    await fs.mkdir(basePath);
  } catch (_) {}
  Promise.all(
    iterateObject(recipe.generateImplementation()).map(async ([key, value]) => {
      const file = path.join(basePath, key);
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
      } catch (_) {}
      await fs.writeFile(file, value);
    })
  );
}
