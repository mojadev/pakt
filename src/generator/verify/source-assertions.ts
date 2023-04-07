/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  AccessorDeclaration,
  ArrowFunction,
  CallExpression,
  CaseClause,
  ClassDeclaration,
  FunctionDeclaration,
  MethodDeclaration,
  Project,
  SourceFile,
  SyntaxKind,
  ts,
  Type,
} from 'ts-morph';

/**
 * Perform expectations on TypeScript source code.
 *
 * This assertion directives do not intent to cover all cases of expectations, but
 * provides simple assertions for cases where string matching doesn't make sense.
 *
 * @TODO: This could be a own matcher library, but let's not blow up the scope more for now.
 *
 * @param sourceContent
 * @param root
 * @returns
 */
export const expectSource = (sourceContent: string, root?: string) => {
  const project = new Project();
  let sourceFile: SourceFile = project.createSourceFile('assert.ts', sourceContent);
  if (root) {
    sourceFile = project.createSourceFile(root, sourceFile.getFunction(root)?.getBodyText());
  }

  function functionMatcher(varName: string, functionName: string): ReturnType<typeof argumentMatcher> {
    const expressions = sourceFile
      .getStatements()
      .filter((statement) => statement.getKind() === SyntaxKind.ExpressionStatement);

    const functionCalls = expressions
      .flatMap((x) => x.getChildrenOfKind(SyntaxKind.CallExpression))
      .flatMap((x) => x.getChildrenOfKind(SyntaxKind.PropertyAccessExpression));

    const functionCall = functionCalls.find((call) => {
      return call.getName() === functionName && call.getExpression().getText() === varName;
    });

    try {
      expect(functionCall).toBeTruthy();
    } catch (e) {
      console.error(`Could not find function call ${varName}.${functionName} in ${sourceContent}`);
      console.log(
        'Found functions',
        functionCalls.map((x) => x.getName())
      );
      throw e;
    }
    return argumentMatcher(functionCall?.getParent() as CallExpression);
  }

  function argumentMatcher(context: CallExpression) {
    return {
      withArguments: (...args: string[]) => {
        args.forEach((arg, index) => {
          expect(context.getArguments()[index].getText()).toEqual(arg);
        });
        return argumentMatcher(context);
      },
      withArgumentAt: (index: number, arg: string) => {
        expect(context.getArguments()[index].getText()).toEqual(arg);
        return argumentMatcher(context);
      },
      withCallbackAt: (index: number) => {
        const callbackCandidate = context.getArguments()[index];
        const callback =
          callbackCandidate.asKind(SyntaxKind.ArrowFunction) ??
          callbackCandidate.asKindOrThrow(SyntaxKind.FunctionDeclaration);
        return functionAssertions(callback);
      },
    };
  }

  function defaultImportMatcher(defaultName: string, moduleName: string) {
    const imports = sourceFile.getImportDeclarations();
    const imported = imports.find((importDeclaration) => {
      return (
        importDeclaration.getModuleSpecifier().getText() === `'${moduleName}'` &&
        importDeclaration.getDefaultImport()?.getText() === defaultName
      );
    });

    expect(imported).toBeTruthy();
  }

  function importMatcher(moduleName: string) {
    const importDeclaration = sourceFile.getImportDeclarationOrThrow(moduleName);
    return {
      withDefaultImport: (defaultImport: string) => {
        if (defaultImport !== importDeclaration.getDefaultImport()?.getText()) {
          throw new Error(`Import ${moduleName} does not have default import with name ${defaultImport}`);
        }
      },
      withNamespacedDefaultImport: (namespace: string) => {
        if (importDeclaration.getImportClauseOrThrow().getNamespaceImportOrThrow().getText() !== namespace) {
          throw new Error(`Import ${moduleName} does not have namespaced import with namespace ${namespace}`);
        }
      },
      withNamedImport: (namedImport: string) => {
        const allImports = importDeclaration.getNamedImports().map((x) => x.getName());
        const found = allImports.includes(namedImport);
        if (!found) {
          throw new Error(
            `Could not find named import ${namedImport} in ${moduleName} (found ${allImports.join(',')})`
          );
        }
      },
    };
  }

  function typeAliasMatcher(aliasName: string, typeDeclaration?: string) {
    const typeAlias = sourceFile.getTypeAlias(aliasName);

    if (typeAlias == null) {
      throw new Error(`Type ${aliasName} does not exist in ${sourceContent}`);
    }
    if (typeDeclaration) {
      expect(typeAlias?.getTypeNodeOrThrow().getText()).toEqual(typeDeclaration);
    }
    return aliasValueMatcher(typeAlias.getType());
  }

  function interfaceMatcher(name: string, definition?: Record<string, string>) {
    const interfaceDeclaration = sourceFile.getInterfaceOrThrow(name);
    if (definition != null) {
      Object.keys(definition).forEach((propertyName) => {
        const property = interfaceDeclaration.getProperty(propertyName);
        expect(property?.getType().getText(interfaceDeclaration)).toEqual(definition[propertyName]);
      });
    }

    return {
      withExtendsClauseToEqual: (index: number, expected: string) => {
        expect(interfaceDeclaration.getExtends()[index].getText()).toEqual(expected);
        return interfaceMatcher(name, definition);
      },
      withRequiredProperty: (property: string | number, matcher?: (value: string) => void) => {
        const propertyInstance = interfaceDeclaration.getPropertyOrThrow(property.toString());
        expect(propertyInstance?.getQuestionTokenNode()).not.toBeDefined();
        if (matcher) {
          matcher(propertyInstance.getText());
        }
        return interfaceMatcher(name, definition);
      },
      withOptionalProperty: (property: string | number, matcher?: (value: string) => void) => {
        const propertyInstance = interfaceDeclaration.getPropertyOrThrow(property.toString());
        expect(propertyInstance?.getQuestionTokenNode()).toBeDefined();
        if (matcher) {
          matcher(propertyInstance.getText());
        }
        return interfaceMatcher(name, definition);
      },
      withoutExport: () => {
        expect(interfaceDeclaration.getExportKeyword()).not.toBeDefined();
        return interfaceMatcher(name, definition);
      },
      withExport: () => {
        expect(interfaceDeclaration.getExportKeyword()).toBeDefined();
        return interfaceMatcher(name, definition);
      },
    };
  }

  function interfaceDocumentationMatcher(interfaceName: string, docMatcher: string) {
    const interfaceDeclaration = sourceFile.getInterfaceOrThrow(interfaceName);
    expect(interfaceDeclaration.getLeadingCommentRanges()[0].getText()).toContain(docMatcher);
  }

  function variableDeclarationMatcher(variableName: string, definition: string) {
    const variableDeclaration = sourceFile.getVariableDeclarationOrThrow(variableName);
    expect(variableDeclaration.getVariableStatement()?.getDeclarations()[0].getText().replace(/ /g, '')).toEqual(
      definition.replace(/ /g, '')
    );
  }

  function variableDeclarationMatcherV2(variableName: string) {
    const variableDeclaration = sourceFile.getVariableDeclarationOrThrow(variableName);
    return {
      containing: (value: string) => {
        expect(variableDeclaration.getVariableStatement()?.getDeclarations()[0].getText().replace(/ /g, '')).toContain(
          value
        );
      },
    };
  }

  function functionDeclarationMatcher(functionName: string) {
    const functionUnderTest = sourceFile.getFunctionOrThrow(functionName);

    return functionAssertions(functionUnderTest);
  }

  function functionAssertions(functionUnderTest: FunctionDeclaration | ArrowFunction) {
    return {
      withParameters: (parameters: Array<{ name: string; type: string; initializer?: string }>) => {
        parameters.forEach(({ name, type, initializer: assignment }) => {
          const parameter = functionUnderTest.getParameterOrThrow(name);
          expect(parameter.getType().getText()).toEqual(type);
          if (assignment) {
            expect(parameter.getInitializerOrThrow().getText()).toEqual(assignment);
          } else {
            expect(parameter.getInitializer()).not.toBeDefined();
          }
        });
        return functionAssertions(functionUnderTest);
      },
      withBody: (matcher: (expectBody: ReturnType<typeof expectSource>) => void) => {
        const contentBody = functionUnderTest.getBody()?.getChildSyntaxListOrThrow();

        matcher(expectSource(contentBody?.getText() ?? ''));
        return functionAssertions(functionUnderTest);
      },
    };
  }

  function switchStatementMatcher(switchExpression: string) {
    const switchStatement = sourceFile.getStatementByKindOrThrow(SyntaxKind.SwitchStatement);
    expect(switchStatement.getExpression().getText()).toEqual(switchExpression);
    return {
      withCase: (identifier: string) => {
        const matchingCase = switchStatement
          .getCaseBlock()
          .getClauses()
          .map((clause) => clause.asKind(SyntaxKind.CaseClause) as CaseClause)
          .filter(Boolean)
          .find((clause) => clause.getExpression().getText() === identifier);
        if (matchingCase == null) {
          throw new Error(`No clause found with identifier ${identifier} in source ${sourceContent}`);
        }
      },
    };
  }

  function objectStatementMatcher(variableName: string) {
    const objectMatcher = sourceFile.getVariableDeclarationOrThrow(variableName);
    objectMatcher.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  }

  function classAssertions(classDeclaration: ClassDeclaration) {
    return {
      toImplementInterface: (interfaceName: string) => {
        const allImplements = classDeclaration.getImplements().map((x) => x.getText());
        if (!allImplements.includes(interfaceName)) {
          throw new Error(`Could not find interface ${interfaceName} in implements (found ${allImplements.join(',')})`);
        }
        return classAssertions(classDeclaration);
      },
      toDefineProperty: (propertyName: string, initializer?: string | number) => {
        const property = classDeclaration.getPropertyOrThrow(propertyName);
        expect(property.getInitializerOrThrow().getText()).toEqual(String(initializer));
        return classAssertions(classDeclaration);
      },

      toDefineMethod: (methodName: string) => {
        const method = classDeclaration.getMethodOrThrow(methodName);
        return methodAssertion(method);
      },

      toDefineGetter: (getterName: string) => {
        const accessor = classDeclaration.getGetAccessorOrThrow(getterName);
        return methodAssertion(accessor);
      },
    };
  }

  function methodAssertion(method: MethodDeclaration | AccessorDeclaration) {
    return {
      withVisibility(visibilty: 'public' | 'private' | 'protected') {
        method.getFirstModifierByKindOrThrow(visibilityToKind(visibilty));
        return methodAssertion(method);
      },
      withImplementation(code: string | RegExp) {
        expect(method.getBodyText()).toEqual(code);
        return methodAssertion(method);
      },
      withReturnType(type: string) {
        expect(method.getReturnTypeNode()?.getText()).toEqual(type);
        return methodAssertion(method);
      },
      asStatic() {
        expect(method.getStaticKeywordOrThrow());
        return methodAssertion(method);
      },
    };
  }

  function classDeclarationMatcher(
    className: string,
    sourceMatcherFn: (assert: ReturnType<typeof classAssertions>) => void
  ) {
    const classDeclaration = sourceFile.getClassOrThrow(className);
    sourceMatcherFn(classAssertions(classDeclaration));
    return expectSource(sourceContent, root);
  }

  function aliasValueMatcher(type: Type<ts.Type>) {
    return {
      withObjectContainingField(fieldName: string) {
        const property = type.getPropertyOrThrow(fieldName);
        const value = property.getValueDeclarationOrThrow();
        const signature = value.asKindOrThrow(SyntaxKind.PropertySignature);
        return aliasValueMatcher(signature.getType());
      },
      withValue(textValue: string) {
        expect(type.getText()).toEqual(textValue);
      },
    };
  }

  return {
    toContainDefaultImport: defaultImportMatcher,
    toContainImport: importMatcher,
    toCallFunction: functionMatcher,
    toContainTypeAlias: typeAliasMatcher,
    toContainInterfaceDeclaration: interfaceMatcher,
    toHaveInterfaceDocumentation: interfaceDocumentationMatcher,
    toDeclareVariable: variableDeclarationMatcher,
    toDeclare: variableDeclarationMatcherV2,
    toDeclareFunction: functionDeclarationMatcher,
    toDefineSwitchStatement: switchStatementMatcher,
    toDefineObject: objectStatementMatcher,
    toDeclareClass: classDeclarationMatcher,
  };
};

const visibilityToKind = (visibility: 'public' | 'private' | 'protected') => {
  switch (visibility) {
    case 'public':
      return SyntaxKind.PublicKeyword;
    case 'private':
      return SyntaxKind.PrivateKeyword;
    case 'protected':
      return SyntaxKind.ProtectedKeyword;
  }
};
