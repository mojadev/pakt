import { Registry } from '../code-generator';
import { expectSource } from '../verify/source-assertions';
import { EcmaScriptImportGenerator } from '../typescript';
import { Writer } from '../writer';
import { RoutingModel } from '../../model';
import { SchemaFileGenerator } from './schema';

describe('Schema generator', () => {
  const registry = new Registry();
  registry.add(new EcmaScriptImportGenerator());

  it('should generate all imports from a routing model', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      types: {
        User: { type: 'object', properties: { name: { type: 'ref', ref: '#/components/paths/Username' } } },
      },
    };
    const writer = new Writer('components/schema');
    const schema = new SchemaFileGenerator(registry).generate(routerModel, writer).toString();

    expectSource(schema).toContainImport('../paths').withNamedImport('Username');
  });

  it('should skip imports that point to the file itself', () => {
    const routerModel: RoutingModel = {
      routerPaths: [],
      types: {
        User: { type: 'object', properties: { name: { type: 'ref', ref: '#/components/schema/Username' } } },
      },
    };
    const writer = new Writer('components/schema');
    const schema = new SchemaFileGenerator(registry).generate(routerModel, writer).toString();

    expect(() => expectSource(schema).toContainImport('./paths')).toThrowError('Expected to find an import');
  });
});
