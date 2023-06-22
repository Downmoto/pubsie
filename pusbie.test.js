// TODO: Possible test suite for .epub related Errors
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
} = require("./pubsie.error.js");
const pub = require("./pubsie.js");

const epub = "./data/moby.epub";
const output = "./data/out/";

const n = new pub(epub, output);
n.parse();

describe("getMimeType", () => {
  test("should open epub and check for correct mime type", () => {
    let e = "application/epub+zip";

    expect(n.info.mimetype).toBe(e);
  });
});

describe("parseContainer", () => {
  test("should find and assign rootfile to meta object", () => {
    let e = "OEBPS/content.opf";

    expect(n.info.opf.length).toBe(1);
    expect(n.info.opf[0]).toBe(e);
  });
});

describe("parseRootFileMetadata", () => {
  test("should have correct dc:identifier information", () => {
    let e = { id: "id", identifier: "http://www.gutenberg.org/2701" };

    expect(n.info.metadata.identifier.length).toBe(1);
    expect(n.info.metadata.identifier[0]).toStrictEqual(e);
  });

  test("should have english language as primary with no additional languages set", () => {
    let e = {
      primary: "en",
      additional: [],
    };

    expect(n.info.metadata.language).toStrictEqual(e);
  });

  test("should have correct title as primary with no additional titles set", () => {
    let e = {
      primary: "Moby Dick; Or, The Whale",
      additional: [],
    };

    expect(n.info.metadata.title).toStrictEqual(e);
  });

  test('should have correct last modified date', () => { 
    let e = "2023-06-02T08:47:25Z";

    expect(n.info.metadata.dcterms_modified).toBe(e)
   })
});
