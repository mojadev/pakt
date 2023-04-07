import { MethodVisibilty, TypeScriptClassMethodModel, TypeScriptClassModel, TypeScriptTypeAlias } from '../../../model';
import { Registry } from '../../code-generator';
import { expectSource } from '../../verify/source-assertions';
import { Writer } from '../../writer';
import { TypeScriptClassGenerator } from './class';
import { TypeScriptGenericFieldGenerator } from './generic';
import { TypeScriptAliasFieldGenerator } from './interface';

describe('Typescript class model', () => {
  const registry = new Registry();
  registry.add(new TypeScriptAliasFieldGenerator());
  registry.add(new TypeScriptGenericFieldGenerator(registry));

  const generator = new TypeScriptClassGenerator(registry);

  it('should generate a class with the given name and no methods when constructing', () => {
    const code = generator.generate(new TypeScriptClassModel('TestClass'), new Writer()).toString();

    expectSource(code).toDeclareClass('TestClass', () => true);
  });

  it.each(['private', 'public', 'protected'] as MethodVisibilty[])('should define members as %s', (visibilty) => {
    const model = new TypeScriptClassModel('TestClass');
    model.addMethod(new TypeScriptClassMethodModel('methodUnderTest', visibilty));

    const code = generator.generate(model, new Writer()).toString();

    expectSource(code).toDeclareClass('TestClass', (clazz) => {
      clazz.toDefineMethod('methodUnderTest').withVisibility(visibilty);
    });
  });

  it.each(['private', 'public', 'protected'] as MethodVisibilty[])(
    'should allow methods to be defined as getters with visibility %s',
    (visibility) => {
      const model = new TypeScriptClassModel('TestClass');
      model.addMethod(new TypeScriptClassMethodModel('getterUnderTest', visibility).markAsGetter());

      const code = generator.generate(model, new Writer()).toString();

      expectSource(code).toDeclareClass('TestClass', (clazz) => {
        clazz.toDefineGetter('getterUnderTest').withVisibility(visibility);
      });
    }
  );

  it('should allow to define an implementation for a method', () => {
    const model = new TypeScriptClassModel('TestClass');
    model.addMethod(new TypeScriptClassMethodModel('methodUnderTest').withImplementation('console.log("test")'));

    const code = generator.generate(model, new Writer()).toString();

    expectSource(code).toDeclareClass('TestClass', (clazz) => {
      clazz.toDefineMethod('methodUnderTest').withImplementation(`console.log("test")`);
    });
  });

  it('should define a return type for methods', () => {
    const model = new TypeScriptClassModel('TestClass');
    model.addMethod(
      new TypeScriptClassMethodModel('methodUnderTest')
        .withImplementation('return "Hello World";')
        .withReturnType(new TypeScriptTypeAlias('string', 'string'))
    );

    const code = generator.generate(model, new Writer()).toString();

    expectSource(code).toDeclareClass('TestClass', (clazz) => {
      clazz.toDefineMethod('methodUnderTest').withReturnType('string');
    });
  });

  it('should define a return type for getter', () => {
    const model = new TypeScriptClassModel('TestClass');
    model.addMethod(
      new TypeScriptClassMethodModel('getterUnderTest')
        .withImplementation('return "Hello World";')
        .markAsGetter()
        .withReturnType(new TypeScriptTypeAlias('string', 'string'))
    );

    const code = generator.generate(model, new Writer()).toString();

    expectSource(code).toDeclareClass('TestClass', (clazz) => {
      clazz.toDefineGetter('getterUnderTest').withReturnType('string');
    });
  });

  it('should create static methods when methods are marked as static', () => {
    const model = new TypeScriptClassModel('TestClass');
    model.addMethod(
      new TypeScriptClassMethodModel('getterUnderTest')
        .withImplementation('return "Hello World";')
        .markAsGetter()
        .markAsStatic()
        .withReturnType(new TypeScriptTypeAlias('string', 'string'))
    );

    const code = generator.generate(model, new Writer()).toString();

    expectSource(code).toDeclareClass('TestClass', (clazz) => {
      clazz.toDefineGetter('getterUnderTest').asStatic();
    });
  });
});
