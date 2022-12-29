import prettier from 'prettier';

export const formatSource = async (source: string, name: string): Promise<string> => {
  const config = await prettier.resolveConfig(process.cwd());

  return prettier.format(source, {
    filepath: name,
    ...config,
  });
};
