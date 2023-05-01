import { Writer } from './writer';

describe('Writer', () => {
  it.each`
    writerPath           | targetPath             | expected
    ${'components/'}     | ${'test'}              | ${'../test'}
    ${'components/test'} | ${'components/test'}   | ${'./'}
    ${'components/test'} | ${'components/target'} | ${'./target'}
  `(
    'should resolve an path $targetPath to $expected when the own location is $writerPath ',
    ({ writerPath, targetPath, expected }) => {
      const writer = new Writer(writerPath);

      expect(writer.path(targetPath).toString()).toEqual(`"${expected}"`);
    }
  );
});
