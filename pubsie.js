var AdmZip = require("adm-zip");
var parseString = require("xml2js").parseString;

const {parseRootFileRequiredMetadata} = require("./helpers/metadata/required.js")

const fs = require("fs");

// Custom Error Names for ease of handling
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
  RequiredEpubMetadataMissing,
} = require("./helpers/errors/pubsie.error.js");
const { parseRootFileOptionalMetadata } = require("./helpers/metadata/optional.js");

class EPUB {
  #isCache = false;
  constructor(file, output) {
    this.file = file;
    this.output = output;

    if (this.file.endsWith("cache.json")) {
      this.#isCache = true;
    }

    this.#infoInit();
  }

  #infoInit() {
    this.epub = {
      mimetype: "",
      opf: [], // .opf files [content.opf]
      epubVersion: "", // 3+ recommended, legacy features will not be maintained
      metadata: {
        unparsed: {},
      },
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
      this.epub = data.info
      return
    }

    this.#parseStart();
    this.#parseRootFiles();

    // MOVE TO PARSESTART METHOD
    if (this.isEncrypted) {
      throw new EpubEncryptedError(
        "Epub is encrypted, parsing has resulted in unknown behaviour"
      );
    }
  }

  buildCache(out) {
    let cache = {
      info: this.epub,
      entries: this.entries,
    };

    let data = JSON.stringify(cache);

    let o = out ? out : this.output;
    if (!o.endsWith(".cache.json")) {
      o = o.concat(".cache.json");
    }

    fs.writeFileSync(o, data);
  }

  #parseStart() {
    this.entries.forEach((entry) => {
      if (entry.entryName.toLowerCase() == "meta-inf/container.xml") {
        this.#parseContainer(entry);
      }
      if (entry.entryName.toLowerCase() == "meta-inf/encryption.xml") {
        this.isEncrypted = true;
      }
      if (entry.entryName == "mimetype") {
        if (entry.getData().toString("utf8") == "application/epub+zip") {
          this.epub.mimetype = "application/epub+zip";
        } else {
          throw new IncorrectMimeTypeError(
            "Incorrect mime type may result in unknown behaviour"
          );
        }
      }
    });

    if (!this.epub.mimetype)
      throw new NoMimeTypeFileError("No mimetype file found");
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

  #parseRootFiles() {
    this.epub.opf.forEach((rootfile) => {
      let opf = this.#getEntry(rootfile);
      let xml = opf.getData().toString("utf-8");

      parseString(xml, (err, result) => {
        if (err) throw new Error(err);
        this.#parseEpubVersion(result.package);
        this.epub.metadata = parseRootFileRequiredMetadata(
          result.package.metadata[0],
          {isLegacy: this.epub.isLegacy}
        );

        this.epub.metadata.optionals = parseRootFileOptionalMetadata(
          result.package.metadata[0],
          { isLegacy: this.epub.isLegacy }
        );
        
        
        // this.#parseRootFileMetadata(result.package.metadata[0]);
      });
    });
  }

  #parseEpubVersion(pkg) {
    this.epub.epubVersion = pkg.$.version;
    this.epub.isLegacy = parseInt(this.epub.epubVersion) < 3;
  }


  #parseRootFileMetadataDcOptionals(metadata) {
    const dc = 'dc:'
    const ext = [
      'contributor',
      'creator',
      'coverage',
      'date',
      'description',
      'format',
      'publisher',
      'relation',
      'rights',
      'source',
      'subject',
      'type'
    ]

    ext.forEach(e => {
      let tag = dc + e;
      this.epub.metadata[e] = metadata[tag]
    })

  }

  #parseRootFileManifest() {}
  #parseRootFileSpine() {}
  #parseRootFileCollections() {}
}

module.exports = EPUB;
