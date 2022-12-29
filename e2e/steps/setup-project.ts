import { exec } from 'child_process';
import path from 'path';

export const setupProject = async (folder: string): Promise<string> => {
  const cwd = path.join(__dirname, '..', folder);
  console.info('(install) Installing in folder', folder, cwd);
  const result = new Promise<string>((resolve, reject) => {
    exec('yarn', { cwd }, (error, stdout, stderr) => {
      if (error != null) {
        console.error(stderr);
        reject(error);
      }
      console.info(stdout);
      resolve(stdout);
    });
  });
  return await result;
};
