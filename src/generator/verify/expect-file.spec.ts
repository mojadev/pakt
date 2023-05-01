describe('Expect compile jest matcher', () => {
  it('should fail for nonexisting files', () => {
    expect('unknown').not.toBeExistingFile();
  });

  it('should pass when a file exists', () => {
    expect(__dirname + '/expect-file.spec.ts').toBeExistingFile();
  });

  it('should fail when the contentmatcher does not match', () => {
    expect(() =>
      expect(__dirname + '/expect-file.spec.ts').toBeExistingFile((content) => {
        expect(content.toString('utf-8')).toEqual('something wrong');
      })
    ).toThrowError();
  });

  it('should pass when the contentmatcher does match', () => {
    expect(__dirname + '/expect-file.spec.ts').toBeExistingFile((content) => {
      expect(content.toString('utf-8')).toContain('describe');
    });
  });
});
