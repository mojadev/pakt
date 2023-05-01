/* eslint-disable @typescript-eslint/no-namespace */
import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';
import fs from 'fs';

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      toBeExistingFile(matchContent?: ContentMatchFn | undefined): CustomMatcherResult;
    }
  }
}

const toBeExistingFile: MatcherFunction<[matchContent: ContentMatchFn | undefined]> = (
  actual,
  matchContent: ContentMatchFn | undefined
) => {
  if (typeof actual !== 'string') {
    return {
      message: () => `Expected be a string as the file path, got ${typeof actual}`,
      pass: false,
    };
  }
  if (!fs.existsSync(actual)) {
    return {
      message: () => `expected ${actual} to be an existing file but could not find it`,
      pass: false,
    };
  }
  if (matchContent !== undefined) {
    const content = fs.readFileSync(actual);
    matchContent(content);
  }

  return {
    message: () => `expected ${actual} to be an existing file `,
    pass: true,
  };
};

expect.extend({
  toBeExistingFile,
});

type ContentMatchFn = (content: Buffer) => void;
