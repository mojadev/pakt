import { TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { TypeHandlerCandidate } from './type';

export const refTypeHandler: TypeHandlerCandidate = (name, type) => {
  if (!type.ref || type.type !== 'ref') {
    return;
  }
  const ref = type.ref.split('/').reverse()[0];
  const aliasSource = type.ref.split('#', 2).reverse()[0].split('/').slice(0, -1).filter(Boolean).join('/');
  const result = new TypeScriptTypeAlias(name, ref).withAliasSource(aliasSource);
  if (type.lazy) {
    result.markAsLazy();
  }
  return result;
};
