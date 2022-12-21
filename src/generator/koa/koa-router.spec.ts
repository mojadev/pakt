import { Registry } from '../code-generator';
import { expectSource } from '../verify/source-assertions';
import {
  TypeScriptCompositeFieldGenerator,
  TypeScriptCompositeGenerator,
  TypeScriptGenericFieldGenerator,
  TypeScriptGenericGenerator,
  EcmaScriptImportGenerator,
  TypeScriptAliasGenerator,
  TypeScriptAliasFieldGenerator,
  TypeScriptInterfaceFieldGenerator,
  TypeScriptInterfaceGenerator,
  TypeScriptObjectTypeDefinitionGenerator,
} from '../typescript';
import { Writer } from '../writer';
import { RouterDefinition, RouterOperation, TypeScriptInterface, TypeScriptTypeAlias } from 'model';
import { KoaRouterGenerator } from './koa-router';

const router = new RouterDefinition();

router.addOperation(
  new RouterOperation('get', '/pets/{petId}', 'getPets')
    .addImplementation({
      mimeType: 'application/json',
      queryParams: [
        {
          type: new TypeScriptTypeAlias('name', 'string'),
          name: 'format',
          format: 'simple',
          explode: false,
        },
      ],
      params: [
        {
          type: new TypeScriptTypeAlias('name', 'string'),
          name: 'petId',
          format: 'simple',
          explode: false,
        },
      ],
      responses: [
        {
          status: 200,
          payload: new TypeScriptTypeAlias('message', 'string'),
        },
      ],
    })
    .addImplementation({
      mimeType: 'application/xml',
      queryParams: [],
      params: [],
      responses: [
        {
          status: 200,
          payload: new TypeScriptInterface('message').addField('message', new TypeScriptTypeAlias('string', 'string')),
        },

        {
          status: 400,
          payload: new TypeScriptInterface('message').addField('message', new TypeScriptTypeAlias('string', 'string')),
        },
      ],
    })
);

describe('Koa router generator', () => {
  const registry = new Registry();
  registry.add(new EcmaScriptImportGenerator());
  registry.add(new TypeScriptInterfaceGenerator(registry));
  registry.add(new TypeScriptInterfaceFieldGenerator(registry));
  registry.add(new TypeScriptGenericFieldGenerator(registry));
  registry.add(new TypeScriptGenericGenerator(registry));
  registry.add(new TypeScriptObjectTypeDefinitionGenerator(registry));
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new TypeScriptCompositeFieldGenerator(registry));
  registry.add(new TypeScriptCompositeGenerator(registry));
  registry.add(new TypeScriptAliasGenerator());

  const generator = new KoaRouterGenerator(registry);

  it('should import the api Response type from the api types module', () => {
    const source = generator.generate(router, new Writer()).toString();

    expectSource(source).toContainImport('./api-types').withNamespacedDefaultImport('_ApiTypes');
  });

  it('should define a router Operation Map containing all operations and mimetypes', () => {
    const source = generator.generate(router, new Writer()).toString();

    expectSource(source)
      .toContainInterfaceDeclaration('ApiDefinition')
      .withRequiredProperty('getPets', (property) => property.includes('application/json'));
    expectSource(source)
      .toContainInterfaceDeclaration('ApiDefinition')
      .withRequiredProperty('getPets', (property) => property.includes('application/xml'));
  });

  it('should generate imports for path parameter schema parsing when pathparams are defined in the operation', () => {
    const source = generator.generate(router, new Writer()).toString();

    expectSource(source).toContainImport('./components/parse-schemas').withNamedImport('GetPetsPathParameterSchema');
  });

  it('should generate imports for query parameter schema parsing when queryParams are defined in the operation', () => {
    const source = generator.generate(router, new Writer()).toString();

    expectSource(source).toContainImport('./components/parse-schemas').withNamedImport('GetPetsQueryParameterSchema');
  });

  it('should tranform path parameters to a :param syntax', () => {
    const source = generator.generate(router, new Writer()).toString();

    expect(source).toContain('/pets/:petId');
    expect(source).not.toContain('/pets/{petId}');
  });

  it('should import all types with declared dependencies', () => {
    const routerWithImport = new RouterDefinition().addOperation(
      new RouterOperation('get', '/pets', 'getPets').addImplementation({
        mimeType: 'application/json',
        params: [],
        queryParams: [],
        responses: [
          {
            status: 200,
            payload: new TypeScriptTypeAlias('user', 'User').withAliasSource('types'),
          },
        ],
      })
    );

    const source = generator.generate(routerWithImport, new Writer()).toString();

    expectSource(source).toContainImport('./types').withNamedImport('User');
  });
});
