var AdmZip = require("adm-zip");
var parseString = require("xml2js").parseString;

// Custom Error Names for ease of handling
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
  RequiredEpubMetadataMissing,
} = require("./pubsie.error.js");

class EPUB {
  constructor(file, output, options = {}) {
    this.file = file;
    this.output = output;

    // TODO caching and reading from cache as opposed to fs
    if (options.cache) {
      this.cache = options.cache.file
      this.cacheOut = options.cache.output
    }

    this.#infoInit();
  }

  #infoInit() {
    this.info = {
      mimetype: "",
      opf: [], // .opf files [content.opf]
      epubVersion: "", // 3+ recommended, legacy features will not be maintained
      metadata: {},
    };
  }

  #getEntry(name) {
    return this.entries.find((item) => item.entryName == name);
  }

  parse() {
    let zip = new AdmZip(this.file);
    this.entries = zip.getEntries();

    this.#parseStart();
    this.#parseRootFiles();

    // Throws after parsing is completed/attempted
    if (this.isEncrypted) {
      throw new EpubEncryptedError(
        "Epub is encrypted, parsing has resulted in unknown behaviour"
      );
    }
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
          this.info.mimetype = "application/epub+zip";
        } else {
          throw new IncorrectMimeTypeError(
            "Incorrect mime type may result in unknown behaviour"
          );
        }
      }
    });

    if (!this.info.mimetype)
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
          this.info.opf.push(path);
        } else {
          throw new IncorrectMimeTypeError(
            "Incorrect mime type in container.xml may result in unknown behaviour"
          );
        }
      });
    });
  }

  #parseRootFiles() {
    this.info.opf.forEach((rootfile) => {
      let opf = this.#getEntry(rootfile);
      let xml = opf.getData().toString("utf-8");

      parseString(xml, (err, result) => {
        if (err) throw new Error(err);
        this.#parseEpubVersion(result.package);
        this.#parseRootFileMetadata(result.package.metadata[0]);

        if (this.info.isLegacy) {
          // DO LEGACY guide ELEMENT
        }
        // console.dir(result.package.metadata[0]);
      });
    });
  }

  #parseEpubVersion(pkg) {
    this.info.epubVersion = pkg.$.version;
    this.info.isLegacy = parseInt(this.info.epubVersion) < 3;
  }

  #parseRootFileMetadata(metadata) {
    /**TO PARSE
     * link
     * if LEGACY:
     *  OPF2 meta
     */

    // ### REQUIRED FIELDS ###
    // dc:identifier 1 or more
    this.info.metadata.identifier = [];
    metadata["dc:identifier"].forEach((tag) => {
      let dci = {
        id: tag.$.id,
        identifier: tag._,
      };
      this.info.metadata.identifier.push(dci);
    });

    if (this.info.metadata.identifier.length == 0) {
      throw new RequiredEpubMetadataMissing(
        "Epub is missing dc:identifier metadata"
      );
    }

    // dc:title 1 or more, first is primary
    this.info.metadata.title = { primary: "", additional: [] };
    for (let i = 0; i < metadata["dc:title"].length; i++) {
      const title = metadata["dc:title"][i];

      if (i == 0) {
        this.info.metadata.title.primary = title;
      } else {
        this.info.metadata.title.additional.push(title);
      }
    }

    if (metadata["dc:title"].length == 0) {
      throw new RequiredEpubMetadataMissing(
        "Epub is missing dc:title metadata"
      );
    }

    // dc:language 1 or more, first is primary
    this.info.metadata.language = { primary: "", additional: [] };
    for (let i = 0; i < metadata["dc:language"].length; i++) {
      const language = metadata["dc:language"][i];

      if (i == 0) {
        this.info.metadata.language.primary = language;
      } else {
        this.info.metadata.language.additional.push(language);
      }
    }

    if (metadata["dc:language"].length == 0) {
      throw new RequiredEpubMetadataMissing(
        "Epub is missing dc:language metadata"
      );
    }

    // meta 1 or more. This tag is only parsed for its dcterms:modified property.
    this.info.metadata.unparsed.meta = []; // If users want to parse the meta tags themselves.
    metadata["meta"].forEach((meta) => {
      if (meta.$.property == "dcterms:modified") {
        this.info.metadata.dcterms_modified = meta._;
      }
      this.info.metadata.unparsed.meta.push(meta);
    });

    if (!this.info.metadata.dcterms_modified) {
      throw new RequiredEpubMetadataMissing(
        "Epub is missing dcterms_modified (last modified date) metadata"
      );
    }
    // ### REQUIRED FIELDS ###

    // ### OPTIONAL FIELDS ###
    this.#parseRootFileMetadataDcOptionals(metadata);
    
    // link 0 or more. This tag is not parsed for information, but users can feel free to parse them themselves
    this.info.metadata.unparsed.link = []
    metadata["link"].forEach(link => {
      this.info.metadata.unparsed.link.push(link)
    })
    // ### OPTIONAL FIELDS ###
  }

  #parseRootFileMetadataDcOptionals(metadata) {
    /**
     * dc optionals ( assume dc namespace ):
     *  contributor
     *  coverage
     *  creator
     *  date
     *  description
     *  format
     *  publisher
     *  relation
     *  rights
     *  source
     *  subject
     *  type
     */
  }

  #parseRootFileManifest() {}
  #parseRootFileSpine() {}
  #parseRootFileCollections() {}
}

module.exports = EPUB;
