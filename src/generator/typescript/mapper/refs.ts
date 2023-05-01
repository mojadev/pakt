import { camelCase, pascalCase } from 'change-case';
import { EcmaScriptImport, TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { TypeHandlerCandidate } from './type';
import { basename, extname } from 'path';

export const refTypeHandler: TypeHandlerCandidate = (name, type) => {
  if (!type.ref || type.type !== 'ref') {
    return;
  }
  const ref = type.ref.split('/').reverse()[0];
  const fileLocation = type.ref.split('#', 2)[0];
  const aliasSource = type.ref.split('#', 2).reverse()[0].split('/').slice(0, -1).filter(Boolean).join('/');
  const result = new TypeScriptTypeAlias(name, ref).withAliasSource(aliasSource);

  if (fileLocation) {
    result.withImportSource(fileLocation);
    result.withAliasImport(
      new EcmaScriptImport(camelCase(getFilename(fileLocation)), false).setDefaultImport(
        pascalCase(getFilename(fileLocation))
      )
    );
  }
  if (type.lazy) {
    result.markAsLazy();
  }
  return result;
};

const getFilename = (file: string) => basename(file, extname(file));
