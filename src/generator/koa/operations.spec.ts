import { Registry } from '../code-generator';
import { expectSource } from '../source-assertions';
import {
 EcmaScriptImportGenerator,
  TypeScriptAliasFieldGenerator,
  TypeScriptInterfaceFieldGenerator,
  TypeScriptInterfaceGenerator,
} from '../typescript';
import { Writer } from '../writer';
import { RouterOperation, TypeScriptInterface, TypeScriptTypeAlias } from '../../model/generated-code-model';
import { OperationTypeGenerator } from './operations';

describe('Operation types code generator', () => {
  const registry = new Registry();
  registry.add(new TypeScriptInterfaceGenerator(registry));
  registry.add(new TypeScriptInterfaceFieldGenerator(registry));
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new EcmaScriptImportGenerator());

  const generator = new OperationTypeGenerator(registry);

  it('should generate the types for every operation response', () => {
    const operation: RouterOperation = new RouterOperation('get', '/pets', 'getPets');

    operation.addImplementation({
      mimeType: '*/*',
      params: [],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: new TypeScriptInterface('GetPets200Response').addField(
            'message',
            new TypeScriptTypeAlias('message', 'string'),
          ),
        },
      ],
    });

    const source = generator.generate(operation).toString();
    expectSource(source).toContainInterfaceDeclaration('GetPets200Response');
  });

  it('should add all imports from a model to the content', () => {
    const operation: RouterOperation = new RouterOperation('get', '/pets', 'getPets');

    operation.addImplementation({
      mimeType: '*/*',
      params: [],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: new TypeScriptInterface('GetPets200Response').addField(
            'message',
            new TypeScriptTypeAlias('message', 'Message').withAliasSource('components/schema'),
          ),
        },
      ],
    });

    const source = generator.generate(operation, new Writer('operation/get-pets.ts')).toString();
    expectSource(source).toContainImport('../../components/schema').withNamedImport('Message');
  });

  it('should import api types from the api types module', () => {
    const operation: RouterOperation = new RouterOperation('get', '/pets', 'getPets');

    operation.addImplementation({
      mimeType: '*/*',
      params: [],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: new TypeScriptInterface('GetPets200Response').addField(
            'message',
            new TypeScriptTypeAlias('message', 'Message').withAliasSource('components/schema'),
          ),
        },
      ],
    });

    const source = generator.generate(operation, new Writer('./')).toString();
    expectSource(source).toContainImport('./api-types').withNamedImport('ResponseTuple');
  });

  it('should not import api types more than once', () => {
    const operation: RouterOperation = new RouterOperation('get', '/pets', 'getPets');

    operation.addImplementation({
      mimeType: '*/*',
      params: [],
      queryParams: [],
      responses: [
        {
          status: 200,
          payload: new TypeScriptInterface('GetPets200Response').addField(
            'message',
            new TypeScriptTypeAlias('message', 'Message').withAliasSource('components/schema'),
          ),
        },
        {
          status: 400,
          payload: new TypeScriptInterface('GetPets200Response').addField(
            'message',
            new TypeScriptTypeAlias('message', 'Message').withAliasSource('components/schema'),
          ),
        },
      ],
    });

    const source = generator.generate(operation, new Writer('operation/get-pets.ts')).toString();
    expect(source.indexOf('../components/schema')).toEqual(source.lastIndexOf('../components/schema'));
  });
});
