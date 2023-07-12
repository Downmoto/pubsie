const { getPubsie, out_folder } = require("./helper.js");
const pubsie = require("../pubsie.js");

const { RequiredEpubMetadataMissingError } = require("../helpers/errors");

describe("metadata tests", () => {
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

describe("metadata error tests", () => {
  it("should throw RequiredEpubMetadataError", () => {
    let pub = new pubsie(out_folder + "DIRTY.epub");

    expect(() => {
      pub.parse();
    }).toThrow("required");
  });
});
