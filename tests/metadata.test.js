const pubsie = require("../pubsie.js");

const fs = require("fs");
const path = require("path");

const epub_folder = path.join(__dirname, "./data/");

function getRandomEpub() {
  let files = fs
    .readdirSync(epub_folder)
    .filter((file) => file.endsWith(".epub"));

  return files[~~(Math.random() * files.length)];
}

describe("metadata test suite", () => {
  it("should parse successfully", () => {
    let file = getRandomEpub();

    let pub = new pubsie(epub_folder + file);
    pub.parse();

    expect(pub.epub.mimetype).toBe("application/epub+zip");
    expect(pub.epub.epubVersion).not.toBe(undefined);
  });

  it("should parse metadata from root file(s)", () => {
    let file = getRandomEpub();

    let pub = new pubsie(epub_folder + file);
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
