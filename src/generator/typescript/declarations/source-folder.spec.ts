import { mkdtemp, readdir, readFile, rm } from 'fs/promises';
import { Folder, TypeScriptModule } from '../../../model';
import { join } from 'path';
import { generateSource } from './source-folder';

describe('Source folder generator', () => {
  let tmpPath: string;

  beforeEach(async () => {
    tmpPath = await mkdtemp('unit-test');
  });

  afterEach(async () => {
    if (tmpPath) {
      await rm(tmpPath, { recursive: true, force: true });
    }
  });

  it('should create folders in the filesystem for every folder node under the root', async () => {
    const folder: Folder = new Folder('root', [
      {
        name: 'folder1',
        children: [
          { name: 'folder1_child', children: [] },
          { name: 'folder2', children: [] },
        ],
      },
    ]);

    await generateSource(folder, tmpPath);

    const expectedRoot = await readdir(tmpPath);
    const expectedSubFolder = await readdir(join(tmpPath, 'folder1'));

    expect(expectedRoot).toEqual(['folder1']);
    expect(expectedSubFolder).toEqual(['folder1_child', 'folder2']);
  });

  it.skip('should generate typescript files for TypeScript Module definitions', async () => {
    const folder = new Folder('root', [
      {
        name: 'api',
        children: [new TypeScriptModule('index.ts')],
      },
      new TypeScriptModule('router.ts'),
    ]);

    await generateSource(folder, tmpPath);
    const routerTs = await readFile(join(tmpPath, 'router.ts'));
    const indexTs = await readFile(join(tmpPath, 'api', 'index.ts'));

    expect(routerTs.toString('utf-8')).toEqual('');
    expect(indexTs.toString('utf-8')).toEqual('');
  });
});
