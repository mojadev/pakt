import { Linter, Rule } from "eslint";
import * as parser from "@typescript-eslint/parser";
import { rules } from "@typescript-eslint/eslint-plugin";
import tsc from "typescript";

declare global {
  namespace jest {
    interface Matchers<R> {
      toTranspile(tsOptions?: tsc.CompilerOptions): CustomMatcherResult;
    }
  }
}

const linter = new Linter();
linter.defineParser("@typescript-eslint/parser", parser as Linter.ParserModule);
linter.defineRules(rules as unknown as Record<string, Rule.RuleModule>);
expect.extend({
  toTranspile: (received: string, tsOptions: tsc.CompilerOptions = { target: tsc.ScriptTarget.ESNext }) => {
    try {
      const lintResult = linter
        .verify(received, {
          parser: "@typescript-eslint/parser",
          extends: ["plugin:@typescript-eslint/eslint-recommended"],
          plugins: ["@typescript-eslint"],
        })
        .filter((lintError) => lintError.fatal);
      if (lintResult.length > 0) {
        throw new Error(lintResult.map((x) => x.message).join(","));
      }
    } catch (e) {
      return {
        message: () => `expected ${received} to transpile, but got ${e}`,
        pass: false,
      };
    }
    return {
      message: () => `expected ${received} to transpile`,
      pass: true,
    };
  },
});
