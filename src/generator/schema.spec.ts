import { EcmaScriptImport, RoutingModel } from '../model';
import { Registry } from './code-generator';
import { SchemaFileGenerator } from './schema';
import { EcmaScriptImportGenerator } from './typescript';
import { expectSource } from './verify/source-assertions';
import { Writer } from './writer';

describe('Schema generator', () => {
  const registry = new Registry();
  registry.add(new EcmaScriptImportGenerator());

  it('should generate all imports from a routing model', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      sourceFile: './file.yaml',
      shaSum: '123',
      types: {
        User: { type: 'object', properties: { name: { type: 'ref', ref: '#/components/paths/Username' } } },
      },
    };
    const writer = new Writer('components/schema');
    const schema = new SchemaFileGenerator(registry).generate(routerModel, writer).toString();

    expectSource(schema).toContainImport('./paths').withNamedImport('Username');
  });

  it('should skip imports that point to the file itself', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      sourceFile: './file.yaml',
      shaSum: '123',
      types: {
        User: { type: 'object', properties: { name: { type: 'ref', ref: '#/components/schema/Username' } } },
      },
    };
    const writer = new Writer('components/schema');
    const schema = new SchemaFileGenerator(registry).generate(routerModel, writer).toString();

    expect(() => expectSource(schema).toContainImport('./paths')).toThrowError('Expected to find an import');
  });

  it('should generate additional imports that are define in the schema generator', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      sourceFile: './file.yaml',
      shaSum: '123',
      types: {
        User: { type: 'object', properties: { name: { type: 'ref', ref: '#/components/schema/Username' } } },
      },
    };
    const writer = new Writer('components/schema');
    const schema = new SchemaFileGenerator(registry)
      .addImport(new EcmaScriptImport('refFile').setDefaultImport('importName'))
      .generate(routerModel, writer)
      .toString();

    expectSource(schema).toContainImport('../refFile').withDefaultImport('importName');
  });
});
