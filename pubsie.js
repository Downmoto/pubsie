var AdmZip = require("adm-zip");
var parseString = require("xml2js").parseString;

const fs = require("fs");
const path = require('path')

// Custom Error Names for ease of handling
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
} = require("./helpers/errors");

const {
  parseRootFileRequiredMetadata,
  parseRootFileOptionalMetadata,
} = require("./helpers/metadata");

class Pubsie {
  #isCache = false;
  constructor(file) {
    this.file = file;

    if (!this.file) {
      throw new Error("pubsie requires file arg");
    }

    const acceptedExt = ["epub", "cache.json"];

    if (this.file.endsWith(acceptedExt[1])) {
      this.#isCache = true;
    }

    let endsWithAny = (acc, str) => {
      return acc.some((ext) => {
        return str.endsWith(ext);
      });
    };

    if (!endsWithAny(acceptedExt, file)) {
      throw new Error("Incorrect file type");
    }

    this.#infoInit();
  }

  #infoInit() {
    this.epub = {
      mimetype: "",
      opf: [], // .opf files [content.opf]
      epubVersion: "", // 3+ recommended, legacy features will not be maintained
      metadata: [],
    };
  }

  #getEntry(name) {
    return this.entries.find((item) => item.entryName == name);
  }

  parse() {
    if (!this.#isCache) {
      let zip = new AdmZip(this.file);
      this.entries = zip.getEntries();
    } else {
      let raw = fs.readFileSync(this.file);
      let data = JSON.parse(raw);
      this.entries = data.entries;
      this.epub = data.epub;
      return;
    }

    this.#parseStart();
    this.#parseRootFiles();
  }

  buildCache(out) {
    const keys = ["entryName", "name", "isDirectory"];

    const filtered = this.entries.map((entry) => {
      const f = {};
      keys.forEach((key) => {
        if (entry.hasOwnProperty(key)) {
          f[key] = entry[key];
        }
      });
      return f;
    });

    let cache = {
      location: this.file,
      epub: this.epub,
      entries: filtered,
    };

    let data = JSON.stringify(cache);

    let o = out + path.basename(this.file);
    if (!o.endsWith(".cache.json")) o = o.concat(".cache.json");

    fs.writeFileSync(o, data);
  }

  #parseStart() {
    if (this.#getEntry("META-INF/encryption.xml")) {
      this.isEncrypted = true;
      throw new EpubEncryptedError(
        "Epub is encrypted, parsing has resulted in unknown behaviour"
      );
    }

    this.#parseContainer(this.#getEntry("META-INF/container.xml"));

    let mimetype = this.#getEntry("mimetype");
    if (mimetype) {
      if (mimetype.getData().toString("utf8") == "application/epub+zip") {
        this.epub.mimetype = "application/epub+zip";
      } else {
        throw new IncorrectMimeTypeError(
          "Incorrect mime type may result in unknown behaviour"
        );
      }
    } else {
      throw new NoMimeTypeFileError("No mimetype file found");
    }
  }

  #parseContainer(container) {
    parseString(container.getData().toString("utf8"), (err, result) => {
      if (err) throw new Error(err);

      let rootfiles = result.container.rootfiles;

      rootfiles.forEach((rfo) => {
        let mime = rfo.rootfile[0].$["media-type"];
        let path = rfo.rootfile[0].$["full-path"];

        if (mime == "application/oebps-package+xml") {
          this.epub.opf.push(path);
        } else {
          throw new IncorrectMimeTypeError(
            "Incorrect mime type in container.xml may result in unknown behaviour"
          );
        }
      });
    });
  }

  // TODO: POSSIBLE ERROR INCASE OF MULTIPLE ROOTFILES. ACCOUNT FOR IN FUTURE
  #parseRootFiles() {
    for (let i = 0; i < this.epub.opf.length; i++) {
      const rootfile = this.epub.opf[i];
      let opf = this.#getEntry(rootfile);
      let xml = opf.getData().toString("utf-8");

      parseString(xml, (err, result) => {
        if (err) throw new Error(err);

        this.#parseEpubVersion(result.package);
        this.#parseRootFileMetadata(i, result.package.metadata[i]);
      });
    }
  }

  #parseEpubVersion(pkg) {
    this.epub.epubVersion = pkg.$.version;
    this.epub.isLegacy = parseInt(this.epub.epubVersion) < 3;
  }

  #parseRootFileMetadata(index, metadata) {
    this.epub.metadata[index] = parseRootFileRequiredMetadata(metadata, {
      isLegacy: this.epub.isLegacy,
    });

    this.epub.metadata[index].optional = parseRootFileOptionalMetadata(
      metadata,
      { isLegacy: this.epub.isLegacy }
    );
  }

  #parseRootFileManifest() {}
  #parseRootFileSpine() {}
  #parseRootFileCollections() {}
}

module.exports = Pubsie;
