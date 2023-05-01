import path from 'path';
import { ModelOnlyRecipe } from '../src/generator/recipes/models';
import { importModel } from '../src/model';
import { generateSource } from './steps/generate-model-source';

describe('Echo server api creation test', () => {
  const apiFile = path.join(__dirname, 'model', 'api.yaml');

  const model = importModel(apiFile);
  const recipe = new ModelOnlyRecipe(model);

  it('should generate the source successfully', async () => {
    await generateSource('model');
    const result = recipe.generateImplementation();

    expectValidTypescriptFile('model', 'components', 'schemas.ts');
    expectValidTypescriptFile('model', 'components', 'parse-schemas.ts');
    expectValidTypescriptFile('model', 'ref-api', 'components', 'parse-schemas.ts');
    expectValidTypescriptFile('model', 'ref-api', 'components', 'schemas.ts');
    expectValidTypescriptFile('model', 'ref-api', 'index.ts');
  });
});

function expectValidTypescriptFile(...pathParts: string[]) {
  expect(path.join(__dirname, ...pathParts)).toBeExistingFile((content) => {
    expect(content.toString('utf-8')).toTranspile();
  });
}
