import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { formatSource } from 'postprocess/prettier-format';
import { KoaRecipe } from '../generator/koa/koa';
import { iterateObject } from '../iterate-object';
import { importModel } from '../model';

program
  .command('generate <file> <folder>')
  .description('Generate or regenerate models from the OpenAPI 3+ spec')
  .action(async (file: string, folder: string) => {
    await generateApi(file, folder);
  });

export async function generateApi(file: string, folder: string): Promise<void> {
  const model = importModel(file);
  const recipe = new KoaRecipe(model);
  const basePath = folder;
  try {
    await fs.mkdir(basePath);
  } catch (_) {}
  await Promise.all(
    iterateObject(recipe.generateImplementation()).map(async ([key, value]) => {
      const file = path.join(basePath, key);
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
      } catch (_) {}

      const formatted = await formatSource(value, file);
      await fs.writeFile(file, formatted);
    })
  );
}
