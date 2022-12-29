import { mkdir } from 'fs/promises';
import { Folder, TypeScriptModule } from 'model';
import { join } from 'path';

export const generateSource = async (root: Folder, targetPath: string): Promise<void> => {
  await createFolderStructure(root.children, targetPath);
};

const createFolderStructure = async (nodes: Folder['children'], targetPath: string): Promise<void> => {
  await Promise.all(
    nodes.filter(isFolder).map(async (node) => {
      const folderTarget = join(targetPath, node.name);
      await mkdir(folderTarget);
      await createFolderStructure(node.children, folderTarget);
    })
  );
};

const isFolder = (x: Folder | TypeScriptModule): x is Folder => {
  return 'name' in x;
};
