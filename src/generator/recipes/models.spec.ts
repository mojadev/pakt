import { importModel, RoutingModel } from '../../model';
import { expectSource } from '../verify/source-assertions';
import { ModelOnlyRecipe } from './models';

jest.mock('../../model', () => ({
  ...jest.requireActual('../../model'),
  importModel: jest.fn((name) => ({
    shaSum: name,
  })),
}));

const simpleModel: RoutingModel = {
  shaSum: 'sourceSha',
  sourceFile: 'root',
  types: {
    User: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        role: {
          type: 'ref',
          ref: '#/components/schemas/Role',
        },
      },
    },
    Role: {
      type: 'string',
      enum: ['User', 'Admin', 'Anonymous'],
    },
  },
  routerPaths: [],
};

describe('Typescript type model generator', () => {
  it('should generate files and schema parsers for each model', () => {
    const model: RoutingModel = simpleModel;

    const result = new ModelOnlyRecipe(model).generateImplementation();
    expect(Object.keys(result)).toEqual(['index.ts', 'components/schemas.ts', 'components/parse-schemas.ts']);
  });

  it('should declare the types in the schemas as typescript types', () => {
    const model: RoutingModel = simpleModel;

    const result = new ModelOnlyRecipe(model).generateImplementation();

    const sourceIsExpected = expectSource(result['components/schemas.ts']);
    sourceIsExpected
      .toContainInterfaceDeclaration('User')
      .withOptionalProperty('role', (property) => expect(property).toEqual('role?: Role;'));
    expect(result['components/schemas.ts']).toContain(`export type Role = "User" | "Admin" | "Anonymous"`);
  });

  it('should not import anything for non-referencing types', () => {
    const model: RoutingModel = simpleModel;

    const result = new ModelOnlyRecipe(model).generateImplementation();

    const schemas = result['components/schemas.ts'];
    expect(schemas).not.toContain('import');
  });

  it('should add an import for referenced models', () => {
    const model: RoutingModel = {
      ...simpleModel,
      types: { ...simpleModel.types, System: { type: 'ref', ref: 'referenced-api.yaml#/components/schemas/System' } },
    };
    mockImportedModel({
      'referenced-api.yaml': {
        shaSum: 'referenced-api',
        routerPaths: [],
        sourceFile: 'referenced-api.yaml',
        types: {
          System: {
            type: 'string',
            enum: ['System1'],
          },
        },
      },
    });

    const result = new ModelOnlyRecipe(model).generateImplementation();
    const sourceIsExpected = expectSource(result['components/schemas.ts']);

    expect(importModel).toHaveBeenCalledWith('referenced-api.yaml');
    sourceIsExpected.toContainImport('../referenced-api').withNamespacedDefaultImport('ReferencedApi');
    sourceIsExpected.toContainTypeAlias('System').withValue('ReferencedApi.Schema.System');
    expectSource(result['referenced-api/index.ts']).toReExport('./components/schemas').withName('Schema');
  });

  it('should add an import to the original model for references back to the original model', () => {
    const model: RoutingModel = {
      ...simpleModel,
      types: { ...simpleModel.types, System: { type: 'ref', ref: 'referenced-api.yaml#/components/schemas/System' } },
    };
    mockImportedModel({
      'root.yaml': model,
      'referenced-api.yaml': {
        shaSum: 'referenced-api',
        routerPaths: [],
        sourceFile: 'referenced-api.yaml',
        types: {
          System: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              maintainer: {
                type: 'ref',
                ref: './root.yaml#/components/schemas/User',
              },
            },
          },
        },
      },
    });

    const result = new ModelOnlyRecipe(model).generateImplementation();
    const expectRootModel = expectSource(result['components/schemas.ts']);
    const expectReferencedModel = expectSource(result['referenced-api/components/schemas.ts']);

    expect(importModel).toHaveBeenCalledWith('root.yaml');
    expectRootModel.toContainImport('../referenced-api').withNamespacedDefaultImport('ReferencedApi');
    expectRootModel.toContainTypeAlias('System').withValue('ReferencedApi.Schema.System');
    expectReferencedModel.toContainImport('../..').withNamespacedDefaultImport('Root');
  });
});

describe('schemas', () => {
  it('should import the documents types with an namespace import called types', () => {
    const model: RoutingModel = simpleModel;

    const result = new ModelOnlyRecipe(model).generateImplementation();

    expectSource(result['components/parse-schemas.ts'])
      .toContainImport('./schemas')
      .withNamespacedDefaultImport('types');
  });

  it('should import referenced apis as a namespace import with the location name', () => {
    const model: RoutingModel = {
      ...simpleModel,
      types: { ...simpleModel.types, System: { type: 'ref', ref: 'referenced-api.yaml#/components/schemas/System' } },
    };
    mockImportedModel({
      'referenced-api.yaml': {
        shaSum: 'referenced-api',
        routerPaths: [],
        sourceFile: 'referenced-api.yaml',
        types: {
          System: {
            type: 'string',
            enum: ['System1'],
          },
        },
      },
    });

    const result = new ModelOnlyRecipe(model).generateImplementation();

    expectSource(result['components/parse-schemas.ts'])
      .toContainImport('./schemas')
      .withNamespacedDefaultImport('types');
    expectSource(result['components/parse-schemas.ts'])
      .toContainImport('../referenced-api')
      .withNamespacedDefaultImport('ReferencedApi');
  });
});

function mockImportedModel(models: Record<string, RoutingModel>) {
  (importModel as jest.Mock).mockImplementation((name) => {
    return models[name];
  });
}
