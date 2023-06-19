// TODO: Possible test suite for .epub related Errors
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError
} = require("./pubsie.error.js");
const pub = require("./pubsie.js");

const epub = "./data/moby.epub";
const output = "./data/out/";

describe("getMimeType", () => {
  test("should open epub and check for correct mime type", () => {
    let e = "application/epub+zip";

    const n = new pub(epub, output);
    n.parse();

    expect(n.meta.mimetype).toBe(e);
  });
});

describe("parseContainer", () => {
  test("should find and assign rootfile to meta object", () => {
    let e = "OEBPS/content.opf";

    const n = new pub(epub, output);
    n.parse();

    expect(n.meta.opf.length).toBe(1);
    expect(n.meta.opf[0]).toBe(e);
  });
});
