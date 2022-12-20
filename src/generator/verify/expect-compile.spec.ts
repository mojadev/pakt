describe("Expect compile jest matcher", () => {
  it("should pass when a javascript module could be transpiled", () => {
    expect("import z from 'zod';").toTranspile();
  });
  it("should pass when a typescript module could be transpiled", () => {
    expect("const test: string = 'test'").toTranspile();
  });
  it("should fail on syntax errors", () => {
    expect(":gdgsdg ;").not.toTranspile();
  });
});
