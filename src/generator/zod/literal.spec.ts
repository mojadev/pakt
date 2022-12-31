import { Writer } from '../writer';
import { TypeScriptLiteral } from '../../model';
import { ZodLiteralGenerator } from './literal';

describe('Literal zod generator', () => {
  const generator = new ZodLiteralGenerator();

  it('should generate a z.literal definition for each literal', () => {
    const result = generator.generate(new TypeScriptLiteral('test', 'a'), new Writer()).toString();

    expect(result).toEqual('z.literal("a")');
  });
});
