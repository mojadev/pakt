import { Registry } from 'generator/code-generator';
import { expectSource } from 'generator/verify/source-assertions';
import { Writer } from 'generator/writer';
import { TypeScriptTypeAlias, TypeScriptTypeComposition } from 'model';
import { TypeScriptCompositeFieldGenerator, TypeScriptCompositeGenerator } from './composite';
import { TypeScriptAliasFieldGenerator } from './interface';

describe('Composite types', () => {
  const registry = new Registry();
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new TypeScriptCompositeFieldGenerator(registry));
  const generator = new TypeScriptCompositeGenerator(registry);

  it('should create unions with |  ', () => {
    const type = new TypeScriptTypeComposition('UserIdentifier', 'union')
      .addChild(new TypeScriptTypeAlias('string', 'Username'))
      .addChild(new TypeScriptTypeAlias('number', 'UserId'));

    const sourceCode = generator.generate(type, new Writer()).toString();

    expectSource(sourceCode).toContainTypeAlias('UserIdentifier', 'Username | UserId');
  });

  it('should create selections with | ', () => {
    const type = new TypeScriptTypeComposition('UserIdentifier', 'selection')
      .addChild(new TypeScriptTypeAlias('string', 'Username'))
      .addChild(new TypeScriptTypeAlias('number', 'UserId'));

    const sourceCode = generator.generate(type, new Writer()).toString();

    expectSource(sourceCode).toContainTypeAlias('UserIdentifier', 'Username | UserId');
  });

  it('should create intersections with & ', () => {
    const type = new TypeScriptTypeComposition('UserIdentifier', 'intersection')
      .addChild(new TypeScriptTypeAlias('string', 'Username'))
      .addChild(new TypeScriptTypeAlias('number', 'UserId'));

    const sourceCode = generator.generate(type, new Writer()).toString();

    expectSource(sourceCode).toContainTypeAlias('UserIdentifier', 'Username & UserId');
  });
});
