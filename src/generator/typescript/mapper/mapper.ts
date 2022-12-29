import { TypeScriptTypeAlias } from '../../../model/generated-code-model';
import { allOfCompositionHandler } from './all-of';
import { anyOfCompositionHandler } from './any-of';
import { arrayHandler } from './array';
import { literalCompositionHandler } from './literal';
import { objectTypeParser } from './object-type';
import { refTypeHandler } from './refs';
import { TypeHandlerCandidate } from './type';

export const getTypeMapper = (): TypeHandlerCandidate[] => [
  objectTypeParser,
  arrayHandler,
  refTypeHandler,
  allOfCompositionHandler,
  anyOfCompositionHandler,
  literalCompositionHandler,
  (name, { type }) => (type === 'big' ? new TypeScriptTypeAlias(name, 'BigInt') : undefined),
  (name, { type }) => (type === 'base64' ? new TypeScriptTypeAlias(name, 'Buffer') : undefined),
  (name, { type }) => (type === 'date' ? new TypeScriptTypeAlias(name, 'Date') : undefined),
  (name, { type }) => (type === 'binary' ? new TypeScriptTypeAlias(name, 'Buffer') : undefined),
  (name, { type }) => (type === 'boolean' ? new TypeScriptTypeAlias(name, 'boolean') : undefined),
  (name, { type }) => (type === 'number' ? new TypeScriptTypeAlias(name, 'number') : undefined),
  (name, { type }) => (type === 'string' ? new TypeScriptTypeAlias(name, 'string') : undefined),
];
