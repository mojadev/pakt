import { TypeScriptGeneric, TypeScriptTypeAlias } from '../../model/generated-code-model';
import { Registry } from '../code-generator';
import { Writer } from '../writer';
import { ZodAliasGenerator } from './alias';
import { ZodCompositeGenerator } from './composite';
import { ZodGenericGenerator } from './generic';
import { ZodInterfaceGenerator } from './interface';

describe('Generic zod generator', () => {
  const registry = new Registry();
  registry.add(new ZodAliasGenerator());
  registry.add(new ZodCompositeGenerator(registry));
  registry.add(new ZodInterfaceGenerator(registry));
  registry.add(new ZodGenericGenerator(registry));
  const generator = new ZodGenericGenerator(registry);

  it('should create an array for Array<T> types', () => {
    const arrayGeneric = new TypeScriptGeneric('ArrayType', 'Array', [new TypeScriptTypeAlias('type', 'string')]);

    const result = generator.generate(arrayGeneric, new Writer()).toString();

    expect(result).toEqual('z.array(z.string())');
  });

  it('should create a record for Record<T> types', () => {
    const recordGeneric = new TypeScriptGeneric('RecordType', 'Record', [
      new TypeScriptTypeAlias('key', 'string'),
      new TypeScriptTypeAlias('type', 'string'),
    ]);

    const result = generator.generate(recordGeneric, new Writer()).toString();

    expect(result).toEqual('z.record(z.string(), z.string())');
  });
});
