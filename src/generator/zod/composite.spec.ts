import { TypeScriptTypeAlias, TypeScriptTypeComposition } from '../../model/generated-code-model';
import { Registry } from '../code-generator';
import { Writer } from '../writer';
import { ZodAliasGenerator } from './alias';
import { ZodCompositeGenerator } from './composite';

describe('Composite zod generator', () => {
  const registry = new Registry();
  const generator = new ZodCompositeGenerator(registry);
  registry.add(new ZodAliasGenerator());
  registry.add(generator);

  it('should create a union for union types', () => {
    const type = new TypeScriptTypeComposition('union', 'union')
      .addChild(new TypeScriptTypeAlias('string', 'string'))
      .addChild(new TypeScriptTypeAlias('number', 'number'));

    const result = generator.generate(type, new Writer()).toString();

    expect(result).toEqual('z.union([z.string(), zStringAsNumber])');
  });

  it('should create an extends chain for intersection types', () => {
    const type = new TypeScriptTypeComposition('intersection', 'intersection')
      .addChild(new TypeScriptTypeAlias('string', 'BaseModel'))
      .addChild(new TypeScriptTypeAlias('string', 'Extension'));

    const result = generator.generate(type, new Writer()).toString();

    expect(result).toEqual('BaseModelSchema.extend(ExtensionSchema.shape)');
  });

  it('should write a single type in case the union contains only one child', () => {
    const type = new TypeScriptTypeComposition('union', 'union').addChild(new TypeScriptTypeAlias('number', 'number'));

    const result = generator.generate(type, new Writer()).toString();

    expect(result).toEqual('zStringAsNumber');
  });

  it('should write a never type in case the union has no children', () => {
    const type = new TypeScriptTypeComposition('union', 'union');

    const result = generator.generate(type, new Writer()).toString();

    expect(result).toEqual('z.never()');
  });
});
