/**
 * Pubsie package
 * @author Arad Fadaei
 * @see https://github.com/Downmoto/pubsie
 *
 * @license
 * Copyright (c) 2023 Arad Fadaei.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// External dependencies
var AdmZip = require("adm-zip");
var parseString = require("xml2js").parseString;

// Internal Node dependencies
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("node:events");

// Errors
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
  RequiredEpubMetadataMissingError,
  EmptyManifestError,
  NoNcxError,
} = require("./helpers/errors");

// Metadata parser helpers
const {
  parseRootFileRequiredMetadata,
  parseRootFileOptionalMetadata,
} = require("./helpers/metadata");

const { parseRootFileManifest } = require("./helpers/manifest");

/**
 * Pubsie parses `.epub` files. Extends `EventEmitter`
 *
 * @param {String} file path to .epub or .cache.json
 * @emits `error` check documentation on github for full list
 */
class Pubsie extends EventEmitter {
  #isCache = false;
  constructor(file) {
    super();

    this.file = file;
    if (!this.file) throw new Error("pubsie requires file arg");

    const acceptedExt = ["epub", "cache.json"];
    if (this.file.endsWith(acceptedExt[1])) {
      this.#isCache = true;
    }

    // TODO: move to appropriate location
    let endsWithAny = (acc, str) => {
      return acc.some((ext) => {
        return str.endsWith(ext);
      });
    };

    if (!endsWithAny(acceptedExt, file)) throw new Error("Incorrect file type");

    this.#infoInit();
  }

  #infoInit() {
    this.epub = {
      mimetype: "",
      opf: [], // .opf files [content.opf]
      epubVersion: "", // 3+ recommended, legacy features will not be maintained
      metadata: [],
      manifest: [],
    };
  }

  #getEntry(name) {
    return this.entries.find((item) => item.entryName == name);
  }

  /**
   * Parses epub or cache passed to constructor. This should be called
   * after setting up event listeners.
   */
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

  /**
   * Builds cache of epub.
   * @param {String} out write path, appends .cache.json.
   * @param {Boolean} noEntries defaults to `false`. Set to `true` to disable caching entries
   */
  buildCache(out, noEntries = false) {
    const keys = ["entryName", "name", "isDirectory"];
    let filtered;

    // filters entries to key data
    if (!noEntries) {
      filtered = this.entries.map((entry) => {
        const f = {};
        keys.forEach((key) => {
          if (entry.hasOwnProperty(key)) {
            f[key] = entry[key];
          }
        });
        return f;
      });
    }

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
    // Encrypted epubs cannot be parsed
    if (this.#getEntry("META-INF/encryption.xml")) {
      this.isEncrypted = true;
      throw new EpubEncryptedError("Epub is encrypted");
    }

    this.#parseContainer(this.#getEntry("META-INF/container.xml"));

    let mimetype = this.#getEntry("mimetype");
    if (mimetype) {
      if (mimetype.getData().toString("utf8") == "application/epub+zip") {
        this.epub.mimetype = "application/epub+zip";
      } else {
        this.emit(
          "error",
          new IncorrectMimeTypeError(
            "Incorrect mime type may result in unknown behaviour"
          )
        );
      }
    } else {
      this.emit("error", new NoMimeTypeFileError("No mimetype file found"));
    }
  }

  #parseContainer(container) {
    parseString(container.getData().toString("utf8"), (err, result) => {
      if (err) throw new Error(err);

      result.container.rootfiles.forEach((rfo) => {
        let mime = rfo.rootfile[0].$["media-type"];
        let path = rfo.rootfile[0].$["full-path"];

        if (mime == "application/oebps-package+xml") {
          this.epub.opf.push(path);
        } else {
          this.emit(
            "error",
            new IncorrectMimeTypeError(
              "Incorrect mime type in container.xml may result in unknown parsing behaviour"
            )
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
        this.#validateRequiredMetadata(i);

        this.#parseRootFileManifest(i, result.package.manifest[i]);
        this.#validateManifest(i);
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

  #validateRequiredMetadata(index) {
    let m = this.epub.metadata[index];

    for (const prop in m) {
      let e;
      switch (prop) {
        case "identifier":
          if (m[prop][0] == "identifier metadata MISSING") {
            e = prop;
          }
          break;
        case "title":
          if (m[prop].primary == "title metadata MISSING") {
            e = prop;
          }
          break;
        case "language":
          if (m[prop].primary == "language metadata MISSING") {
            e = prop;
          }
          break;
        case "dcterms_modified":
          if (!this.epub.isLegacy) {
            if (m[prop].endsWith("MISSING")) {
              e = prop;
            }
          }
          break;
      }

      if (e) {
        this.emit(
          "error",
          new RequiredEpubMetadataMissingError("missing required metadata", {
            required: e,
          })
        );
      }
    }
  }

  #parseRootFileManifest(index, manifest) {
    this.epub.manifest[index] = parseRootFileManifest(manifest);
  }

  #validateManifest(index) {
    let m = this.epub.manifest[index];

    if (m.length == 0) {
      this.emit(
        "error",
        new EmptyManifestError("No items were parsed from manifest")
      );
    }

    if (m.filter((obj) => obj.id == "ncx").length == 0) {
      this.emit(
        "error",
        new NoNcxError("Could not parse table of contents from manifest", {
          legacy: this.epub.isLegacy,
        })
      );
    }
  }
  #parseRootFileSpine() {}
  #parseRootFileCollections() {}
}

module.exports = Pubsie;
