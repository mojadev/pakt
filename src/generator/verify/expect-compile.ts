/* eslint-disable @typescript-eslint/no-namespace */
import { rules } from '@typescript-eslint/eslint-plugin';
import * as parser from '@typescript-eslint/parser';
import { Linter, Rule } from 'eslint';
import type tsc from 'typescript';

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      toTranspile(tsOptions?: tsc.CompilerOptions): CustomMatcherResult;
    }
  }
}

expect.extend({
  toTranspile: (received: string) => {
    try {
      const linter = new Linter();

      linter.defineParser('@typescript-eslint/parser', parser as Linter.ParserModule);
      linter.defineRules(rules as unknown as Record<string, Rule.RuleModule>);
      const lintResult = linter
        .verify(received, {
          parser: '@typescript-eslint/parser',
          extends: ['plugin:@typescript-eslint/eslint-recommended'],
          plugins: ['@typescript-eslint'],
        })
        .filter((lintError) => lintError.fatal);
      if (lintResult.length > 0) {
        throw new Error(lintResult.map((x) => x.message).join(','));
      }
    } catch (e) {
      return {
        message: () => `expected ${received} to transpile, but got ${String(e)}`,
        pass: false,
      };
    }
    return {
      message: () => `expected ${received} to transpile`,
      pass: true,
    };
  },
});
