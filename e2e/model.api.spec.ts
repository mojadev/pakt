import { importModel } from '../src/model';
import path from 'path';
import { generateSource } from './steps/generate-model-source';
import { ModelOnlyRecipe } from '../src/generator/model-only';

describe('Echo server api creation test', () => {
  const apiFile = path.join(__dirname, 'model', 'api.yaml');

  const model = importModel(apiFile);
  const recipe = new ModelOnlyRecipe(model);

  it('should generate the source successfully', async () => {
    await generateSource('model');
    const result = recipe.generateImplementation();
  });
});
