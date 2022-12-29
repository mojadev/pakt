import { formatSource } from './prettier-format';

describe('Pettier format post processor', () => {
  it('should format generated source code', async () => {
    const input = "const x='test';let t= 5";

    expect(await formatSource(input, 'test.ts')).toEqual(`const x = 'test';
let t = 5;
`);
  });
});
