const { getPubsie, out_folder } = require("./helper.js");

const fs = require("fs");
const path = require("path");

describe("general test cases", () => {
  it("should parse random epub", () => {
    let pub = getPubsie();
    pub.parse();

    expect(pub.epub.mimetype).toBe("application/epub+zip");
    expect(pub.epub.epubVersion).not.toBe(undefined);
  });

  it("should build full cache", () => {
    let pub = getPubsie();
    pub.parse();
    pub.buildCache(out_folder, { cacheEntries: true, cacheManifest: true });

    let obj = JSON.parse(
      fs.readFileSync(
        path.join(out_folder, path.basename(pub.file) + ".cache.json")
      )
    );

    expect(obj.epub.mimetype).toBe("application/epub+zip");
    expect(obj.epub.metadata).toEqual(pub.epub.metadata);
    expect(obj.epub.manifest).toEqual(pub.epub.manifest);
    expect(obj.epub.spine).toEqual(pub.epub.spine);
  });

  it("should build cache without manifest", () => {
    let pub = getPubsie();
    pub.parse();
    pub.buildCache(out_folder, { cacheManifest: false });

    let obj = JSON.parse(
      fs.readFileSync(
        path.join(out_folder, path.basename(pub.file) + ".cache.json")
      )
    );

    expect(obj.epub.manifest).toBe(undefined)
  });

  it("should build cache without spine", () => {
    let pub = getPubsie();
    pub.parse();
    pub.buildCache(out_folder, { cacheSpine: false });

    let obj = JSON.parse(
      fs.readFileSync(
        path.join(out_folder, path.basename(pub.file) + ".cache.json")
      )
    );

    expect(obj.epub.spine).toBe(undefined);
  });
});
