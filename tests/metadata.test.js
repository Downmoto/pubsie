const { getPubsie, out_folder } = require("./helper.js");
const pubsie = require("../pubsie.js");

describe("metadata test cases", () => {
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

describe("metadata error test cases", () => {
  it("should listen for error event and call mock callback", () => {
    let mockCb = jest.fn((err) => err.data.name);
    let pub = new pubsie(out_folder + "DIRTY.epub");
    
    pub.on('error', mockCb)
    pub.parse();

    let m = mockCb.mock.results.filter(
      (obj) => obj.value == "RequiredEpubMetadataMissingError"
    );

    expect(mockCb).toHaveBeenCalled();
    expect(m[0]).toEqual({ type: "return", value: "RequiredEpubMetadataMissingError" });
  });
});
