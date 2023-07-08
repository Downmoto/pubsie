const pubsie = require("../pubsie.js");

const fs = require("fs");
const path = require("path");

const epub_folder = path.join(__dirname, "./data/");

describe("metadata test suite", () => {
  it("should parse successfully", () => {
    let files = fs
      .readdirSync(epub_folder)
      .filter((file) => file.endsWith(".epub"));

    let file = files[~~(Math.random() * files.length)];

    let pub = new pubsie(epub_folder + file);
    pub.parse()

    expect(pub.epub.mimetype).toBe('application/epub+zip')
    expect(pub.epub.epubVersion).not.toBe(undefined)
  });
});
