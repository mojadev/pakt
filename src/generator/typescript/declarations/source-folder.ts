import { Folder, TypeScriptModule } from "model";
import { mkdir } from "fs/promises";
import { join } from "path";

export const generateSource = async (root: Folder, targetPath: string) => {
  await createFolderStructure(root.children, targetPath);
};

const createFolderStructure = async (nodes: Folder["children"], targetPath: string) => {
  await Promise.all(
    nodes.filter(isFolder).map(async (node) => {
      const folderTarget = join(targetPath, node.name);
      await mkdir(folderTarget);
      await createFolderStructure(node.children, folderTarget);
    })
  );
};

const isFolder = (x: Folder | TypeScriptModule): x is Folder => {
  return "name" in x;
};
