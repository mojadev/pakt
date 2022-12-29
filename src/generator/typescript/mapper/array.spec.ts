import { toPlainObject } from '../../../model/generated-code-model';
import { arrayHandler } from './array';

describe('array type handler', () => {
  it('should return undefined for non array types', () => {
    const result = arrayHandler('test', { type: 'string' });

    expect(result).toBeUndefined();
  });

  it.each`
    type         | expected
    ${'string'}  | ${'string[]'}
    ${'boolean'} | ${'boolean[]'}
  `('should return a typescript alias with an array of the type', ({ type, expected }) => {
    const result = arrayHandler('test', { type: 'array', children: [{ type }] });

    expect(toPlainObject(result)).toEqual({
      alias: expected,
      name: 'test',
      exported: true,
    });
  });

  it('should use generic array definitions', () => {
    const result = toPlainObject(
      arrayHandler('test', {
        type: 'array',
        children: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
      })
    );

    expect(result).toEqual({
      exported: true,
      genericName: 'Array',
      name: 'test',
      templateType: [
        {
          name: 'nameGenericValue',
          exported: true,
          extends: [],
          definition: { name: { exported: true, name: 'name', required: false, alias: 'string' } },
        },
      ],
    });
  });
});
