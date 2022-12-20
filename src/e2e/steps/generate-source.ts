import { generateApi } from "cli/generate";
import path from "path";

export const generateSource = async (folder: string) => {
  const cwd = path.join("src", "e2e", folder, "api.yaml");
  const target = path.join("src", "e2e", folder);
  console.info("Generating API from api.yaml", cwd);
  await generateApi(cwd, target);
  console.info("Generatedr API from api.yaml", cwd);
};
