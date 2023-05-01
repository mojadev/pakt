import { EcmaScriptImport, RouterPath, RoutingModel } from '../../model';
import { Registry } from '../code-generator';
import {
  EcmaScriptImportGenerator,
  TypeScriptAliasFieldGenerator,
  TypeScriptGenericFieldGenerator,
} from '../typescript';
import { TypeScriptClassGenerator } from '../typescript/declarations/class';
import { expectSource } from '../verify/source-assertions';
import { Writer } from '../writer';
import { ZodAliasGenerator } from './alias';
import { ZodCompositeGenerator } from './composite';
import { ZodGenericGenerator } from './generic';
import { ZodInterfaceGenerator } from './interface';
import { ZodSchemaParserGenerator } from './schema-parser';

const model: RoutingModel = {
  routerPaths: [],
  shaSum: 'sha-sum',
  sourceFile: 'source-file.yaml',
  types: {
    Object: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
    },
    Ref: {
      type: 'ref',
      ref: '#/schema/components/Object',
    },
    RecursiveArray: {
      type: 'array',
      children: [
        {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            children: {
              type: 'ref',
              ref: '#/schema/components/RecursiveArray',
            },
          },
        },
      ],
    },
  },
};

const basicBody = {
  method: 'get',
  operation: 'getPet',
  path: '/pet/:id',
  responses: {
    200: {},
  },
} as RouterPath;

describe('Schema Parser', () => {
  const registry = new Registry();

  registry.add(new ZodAliasGenerator());
  registry.add(new ZodInterfaceGenerator(registry));
  registry.add(new ZodCompositeGenerator(registry));
  registry.add(new ZodGenericGenerator(registry));
  registry.add(new EcmaScriptImportGenerator());
  registry.add(new TypeScriptClassGenerator(registry));
  registry.add(new TypeScriptGenericFieldGenerator(registry));
  registry.add(new TypeScriptAliasFieldGenerator());

  let parser = new ZodSchemaParserGenerator(registry);
  beforeEach(() => {
    parser = new ZodSchemaParserGenerator(registry);
  });

  it('should generate imports for zod', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],

      shaSum: 'sha-sum',
      sourceFile: 'source-file.yaml',
      types: {},
    };

    const source = parser.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expectSource(source).toContainImport('zod').withDefaultImport('z');
  });

  it('should create compilable code', () => {
    const result = parser.generate(model, new Writer()).toString();

    expect(result).toTranspile();
  });

  it('should create a class that contains the schemas', () => {
    const result = parser.generate(model, new Writer()).toString();

    expectSource(result).toDeclareClass('Schemas', () => {
      // no implementation
    });
  });

  it('should generate schemas for every router path param', () => {
    const routerModel: RoutingModel = {
      shaSum: 'sha-sum',
      sourceFile: 'source-file.yaml',
      routerPaths: [
        {
          ...basicBody,
          pathParams: [{ name: 'id', explode: false, style: 'simple', type: { type: 'string', required: true } }],
        },
      ],
      types: {},
    };

    const source = parser.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expect(source).toContain(`GetPetPathParameterSchema = z.object({
  id: z.string(),
});`);
  });

  it('should declare a getter for every type', () => {
    const result = parser.generate(model, new Writer()).toString();

    expectSource(result).toDeclareClass('Schemas', (clazz) => {
      clazz.toDefineGetter('ObjectSchema').withVisibility('public').asStatic();
      clazz.toDefineGetter('RefSchema').withVisibility('public').asStatic();
      clazz.toDefineGetter('RecursiveArraySchema').withVisibility('public').asStatic();
    });
  });

  it('should return the implementation of a schema in the getter', () => {
    const result = parser.generate(model, new Writer()).toString();

    expectSource(result).toDeclareClass('Schemas', (clazz) => {
      clazz.toDefineGetter('ObjectSchema').withImplementation(`return z.object({
  id: z.string().optional(),
});`);
      clazz.toDefineGetter('RefSchema').withImplementation('return Schemas.ObjectSchema;');
      clazz.toDefineGetter('RecursiveArraySchema').withImplementation(`return z.array(z.object({
  id: z.string().optional(),
  children: z.lazy((): z.ZodType<types.RecursiveArray> => Schemas.RecursiveArraySchema).optional(),
}));`);
    });
  });

  it('should generate payload types for every requestBody', () => {
    const routerModel: RoutingModel = {
      shaSum: 'sha-sum',
      sourceFile: 'source-file.yaml',
      routerPaths: [
        {
          ...basicBody,
          requestBodies: {
            'application/json': {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
            'text/plain': {
              type: 'string',
            },
          },
        },
      ],
      types: {},
    };

    const source = parser.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expectSource(source).toDeclareVariable(
      'GetPetBodyPayloadSchema',
      `GetPetBodyPayloadSchema=z.union([z.object({
      name: z.string().optional(),
    }),z.string()])`
    );
  });

  it('should not define a body payload if no body exists', () => {
    const routerModel: RoutingModel = {
      shaSum: 'sha-sum',
      sourceFile: 'source-file.yaml',
      routerPaths: [
        {
          ...basicBody,
        },
      ],
      types: {},
    };

    const source = parser.generate(routerModel, new Writer()).toString();

    expect(source).toTranspile();
    expect(source).not.toContain('GetPetBodyPayloadSchema');
  });

  it('should export each schema for the public interface', () => {
    const result = parser.generate(model, new Writer()).toString();

    expectSource(result).toDeclareVariable('ObjectSchema', 'ObjectSchema = Schemas.ObjectSchema');
    expectSource(result).toDeclareVariable('RefSchema', 'RefSchema = Schemas.RefSchema');
    expectSource(result).toDeclareVariable(
      'RecursiveArraySchema',
      'RecursiveArraySchema = Schemas.RecursiveArraySchema'
    );
  });

  it('should add additional imports when they provided to addImport', () => {
    parser.addImport(new EcmaScriptImport('reference').setDefaultImport('Reference'));
    const result = parser.generate(model, new Writer()).toString();

    expectSource(result).toContainImport('./reference').withDefaultImport('Reference');
  });
});
