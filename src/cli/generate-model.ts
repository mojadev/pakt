import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { ModelOnlyRecipe } from '../generator/recipes/models';
import { formatSource } from '../postprocess/prettier-format';

program
  .command('generate-models <file> <folder>')
  .description('Generate or regenerate models from the OpenAPI 3+ spec')
  .action(async (file: string, folder: string) => {
    await generateApi(file, folder);
  });

export async function generateApi(file: string, folder: string): Promise<void> {
  const recipe = ModelOnlyRecipe.fromFile(file);
  const basePath = folder;
  try {
    await fs.mkdir(basePath);
  } catch (_) {
    // ignore mkdir error
  }
  await Promise.all(
    Object.entries(recipe.generateImplementation()).map(async ([key, value]) => {
      const file = path.join(basePath, key);
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
      } catch (_) {
        //ignore mkdir error
      }

      const formatted = await formatSource(value, file);
      await fs.writeFile(file, formatted);
    })
  ).catch(console.error);
}
