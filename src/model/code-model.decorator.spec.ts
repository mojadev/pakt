import { codeModel, getModelType } from "./code-model.decorator";

describe("Code model decorator", () => {
  it("should add a modelType symbol to the annotated class", () => {
    @codeModel("test")
    class Test {
      constructor(public directProperty: string) {}
    }
    const obj = new Test("value");

    expect(obj.directProperty).toEqual("value");
    expect(getModelType(obj)).toEqual("test");
  });

  it("should return undefined for models without a model type", () => {
    class Test {
      constructor(public directProperty: string) {}
    }

    const obj = new Test("value");

    expect(getModelType(obj)).toEqual(undefined);
  });
});
