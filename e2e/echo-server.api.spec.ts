import { KoaRecipe } from 'generator/koa/koa';
import { expectSource } from 'generator/verify/source-assertions';
import { importModel } from 'model';
import path from 'path';
import { generateSource } from './steps/generate-source';

describe('Echo server api creation test', () => {
  const apiFile = path.join(__dirname, 'echo-server', 'api.yaml');

  const model = importModel(apiFile);
  const recipe = new KoaRecipe(model);

  it('should generate the source successfully', async () => {
    await generateSource('echo-server');
  });

  it('should mark the EchoRequestQueryParameterSchema as optional in the model', () => {
    const queryParams = (model.routerPaths ?? [])[0].queryParams ?? [];

    expect(queryParams[0].type.required).toEqual(false);
  });

  it('should create a EchoRequestQueryParameterSchema with an optional query field', async () => {
    const result = recipe.generateImplementation();

    expectSource(result['components/parse-schemas.ts'])
      .toDeclare('EchoRequestQueryParameterSchema')
      .containing('optional()');
  });
});
