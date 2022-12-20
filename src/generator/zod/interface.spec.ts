import { TypeScriptInterface, TypeScriptTypeAlias } from '../../model/generated-code-model';
import { Registry } from '../code-generator';
import { Writer } from '../writer';
import { ZodAliasGenerator } from './alias';
import { ZodInterfaceGenerator } from './interface';

describe('Zod Interface generator', () => {
  const registry = new Registry();
  const generator = new ZodInterfaceGenerator(registry);
  registry.add(new ZodAliasGenerator());
  registry.add(generator);

  it('should generate object definitions from interfaces', () => {
    const interfaceDefinition = new TypeScriptInterface('test').addField(
      'name',
      new TypeScriptTypeAlias('name', 'string'),
      true
    );

    const result = generator.generate(interfaceDefinition, new Writer()).toString();

    expect(result).toEqual(`z.object({
  name: z.string(),
})`);
  });

  it('should nest interface definitions', () => {
    const interfaceDefinition = new TypeScriptInterface('test')
      .addField('name', new TypeScriptTypeAlias('name', 'string'), true)
      .addField(
        'customer',
        new TypeScriptInterface('customer')
          .addField('name', new TypeScriptTypeAlias('string', 'string'), true)
          .addField('id', new TypeScriptTypeAlias('string', 'string'), true)
          .addField('createdAt', new TypeScriptTypeAlias('createdAt', 'Date'), true),
        true
      );

    const result = generator.generate(interfaceDefinition, new Writer()).toString();

    expect(result).toEqual(`z.object({
  name: z.string(),
  customer: z.object({
    name: z.string(),
    id: z.string(),
    createdAt: z.date(),
  }),
})`);
  });

  it('should append .optional() to optional fields', () => {
    const interfaceDefinition = new TypeScriptInterface('test')
      .addField('name', new TypeScriptTypeAlias('name', 'string'), true)
      .addField(
        'customer',
        new TypeScriptInterface('customer')
          .addField('name', new TypeScriptTypeAlias('string', 'string'), false)
          .addField('id', new TypeScriptTypeAlias('string', 'string'), false)
          .addField('createdAt', new TypeScriptTypeAlias('createdAt', 'Date'), true),
        true
      );

    const result = generator.generate(interfaceDefinition, new Writer()).toString();

    expect(result).toEqual(`z.object({
  name: z.string(),
  customer: z.object({
    name: z.string().optional(),
    id: z.string().optional(),
    createdAt: z.date(),
  }),
})`);
  });
});
