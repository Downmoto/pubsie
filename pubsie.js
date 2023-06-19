var AdmZip = require("adm-zip");
var parseString = require("xml2js").parseString;

// Custom Error Names for ease of handling
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
} = require("./pubsie.error.js");

class EPUB {
  constructor(file, output) {
    this.file = file;
    this.output = output;
    this.#metaInit();
  }

  #metaInit() {
    this.meta = {
      mimetype: "",
      opf: [],
    };
  }

  parse() {
    let zip = new AdmZip(this.file);
    this.entries = zip.getEntries().map((entry) => {
      return entry;
    });

    this.#getMimeType();

    // Throws after parsing is completed/attempted
    if (this.isEncrypted) {
      throw new EpubEncryptedError(
        "Epub is encrypted, parsing will result in unknown behaviour"
      );
    }
  }

  #getMimeType() {
    this.entries.forEach((entry) => {
      if (entry.entryName.toLowerCase() == "meta-inf/container.xml") {
        this.#parseContainer(entry);
      }
      if (entry.entryName.toLowerCase() == "meta-inf/encryption.xml") {
        this.isEncrypted = true
      }
      if (entry.entryName == "mimetype") {
        if (entry.getData().toString("utf8") == "application/epub+zip") {
          this.meta.mimetype = "application/epub+zip";
        } else {
          throw new IncorrectMimeTypeError(
            "Incorrect mime type may result in unknown behaviour"
          );
        }
      }
    });

    if (!this.meta.mimetype)
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
          this.meta.opf.push(path);
        } else {
          throw new IncorrectMimeTypeError(
            "Incorrect mime type in container.xml may result in unknown behaviour"
          );
        }
      });
    });
  }

  #parseRootFiles() {}
}

module.exports = EPUB;
