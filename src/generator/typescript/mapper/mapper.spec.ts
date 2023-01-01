import { toPlainObject } from '../../../model/generated-code-model';
import { generateCodeModelForType } from './index';

describe('Router Types to Code Model', () => {
  it.each`
    type         | modelType
    ${'empty'}   | ${'void'}
    ${'string'}  | ${'string'}
    ${'number'}  | ${'number'}
    ${'big'}     | ${'BigInt'}
    ${'boolean'} | ${'boolean'}
    ${'binary'}  | ${'Buffer'}
    ${'base64'}  | ${'Buffer'}
    ${'date'}    | ${'Date'}
    ${'any'}     | ${'unknown'}
  `('should write a api $type field directly as code type $modelType)', ({ type, modelType }) => {
    const result = generateCodeModelForType('test', { type });

    expect(toPlainObject(result)).toEqual({
      exported: true,
      alias: modelType,
      name: 'test',
    });
  });
});
