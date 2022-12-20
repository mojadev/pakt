import { exec } from "child_process";
import path from "path";

export const setupProject = async (folder: string) => {
  const cwd = path.join("src", "e2e", folder);
  console.info(`(install) Installing in folder`, folder, cwd);
  const result = new Promise((resolve, reject) => {
    exec("yarn", { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
      }
      console.info(stdout);
      resolve(stdout);
    });
  });
  return result;
};
