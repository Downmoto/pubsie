const { getPubsie, out_folder } = require("./helper.js");

const fs = require("fs");
const path = require("path");

describe("general tests", () => {
  it("should parse random epub", () => {
    let pub = getPubsie();
    pub.parse();

    expect(pub.epub.mimetype).toBe("application/epub+zip");
    expect(pub.epub.epubVersion).not.toBe(undefined);
  });

  it("should build cache", () => {
    let pub = getPubsie();
    pub.parse();
    pub.buildCache(out_folder);

    let obj = JSON.parse(
      fs.readFileSync(
        path.join(out_folder, path.basename(pub.file) + ".cache.json")
      )
    );

    expect(obj.epub.mimetype).toBe("application/epub+zip");
    expect(obj.epub.metadata).toEqual(pub.epub.metadata);
  });
});
