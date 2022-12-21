import { RouterPath, RoutingModel } from 'model';
import { Registry } from '../code-generator';
import { expectSource } from '../verify/source-assertions';
import { EcmaScriptImportGenerator } from '../typescript';
import { Writer } from '../writer';
import { ZodAliasGenerator } from './alias';
import { ZodCompositeGenerator } from './composite';
import { ZodInterfaceGenerator } from './interface';
import { ZodRouterModelGenerator } from './router-model';

const basicBody = {
  method: 'get',
  operation: 'getPet',
  path: '/pet/:id',
  responses: {
    200: {},
  },
} as RouterPath;

describe('Router model zod generator', () => {
  const registry = new Registry();
  const generator = new ZodRouterModelGenerator(registry);

  registry.add(new ZodAliasGenerator());
  registry.add(new ZodInterfaceGenerator(registry));
  registry.add(new ZodCompositeGenerator(registry));
  registry.add(new EcmaScriptImportGenerator());

  it('should generate schemas for all types', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      types: {
        User: {
          type: 'object',
          properties: {
            Name: {
              required: true,
              type: 'string',
            },
          },
        },
        Id: {
          type: 'string',
        },
      },
    };

    const source = generator.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expect(source).toContain('IdSchema');
    expect(source).toContain('UserSchema');
  });

  it('should generate imports for zod', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      types: {},
    };

    const source = generator.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expectSource(source).toContainImport('zod').withDefaultImport('z');
  });

  it('should generate schemas for every router path param', () => {
    const routerModel: RoutingModel = {
      routerPaths: [
        {
          ...basicBody,
          pathParams: [{ name: 'id', explode: false, style: 'simple', type: { type: 'string', required: true } }],
        },
      ],
      types: {},
    };

    const source = generator.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expect(source).toContain(`GetPetPathParameterSchema = z.object({
  id: z.string(),
});`);
  });

  it('should generate schemas for every router query param', () => {
    const routerModel: RoutingModel = {
      routerPaths: [
        {
          ...basicBody,
          queryParams: [{ name: 'id', explode: false, style: 'simple', type: { type: 'string', required: true } }],
        },
      ],
      types: {},
    };

    const source = generator.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expect(source).toContain(`GetPetQueryParameterSchema = z.object({
  id: z.string(),
});`);
  });

  it('should assign existing schemas when references are provided', () => {
    const routerModel: RoutingModel = {
      routerPaths: [
        {
          ...basicBody,
          queryParams: [
            {
              name: 'filter',
              type: { type: 'ref', ref: '#/schemas/components/Filter', required: true },
              explode: false,
              style: 'simple',
            },
          ],
        },
      ],
      types: {
        Filter: {
          type: 'object',
          requiredFields: ['queryString'],
          properties: {
            queryString: { type: 'string', required: true },
            from: { type: 'date' },
            to: { type: 'date' },
          },
        },
      },
    };

    const source = generator.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expect(source).toContain('queryString: z.string()');
    expect(source).toContain('from: z.date()');
    expect(source).toContain('to: z.date()');
  });
});
