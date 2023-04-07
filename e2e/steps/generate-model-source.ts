import { generateApi } from '../../src/cli/generate-model';
import path from 'path';

export const generateSource = async (folder: string): Promise<void> => {
  const cwd = path.join(__dirname, '..', folder, 'api.yaml');
  const target = path.join(__dirname, '..', folder);
  console.info('Generating API from api.yaml', cwd);
  await generateApi(cwd, target);

  console.info('Generated API from api.yaml', cwd);
};
