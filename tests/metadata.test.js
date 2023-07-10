const { getPubsie } = require('./helper.js')


describe("metadata test suite", () => {
  it("should parse metadata from root file(s)", () => {
    let pub = getPubsie();
    pub.parse();

    let expected_object = {
      identifier: expect.any(Array),
      title: expect.objectContaining({
        primary: expect.any(String),
        additional: expect.any(Array),
      }),
      language: expect.objectContaining({
        primary: expect.any(String),
        additional: expect.any(Array),
      }),
      dcterms_modified: expect.toBeOneOf([expect.any(String), undefined]),
    };

    expect(pub.epub.metadata[0]).toMatchObject(expected_object);
  });
});

describe("metadata error test suite", () => {
  it("should do nothing", () => {});
});
