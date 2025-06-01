/**
 * Pubsie package
 * @author Arad Fadaei
 * @see https://github.com/Downmoto/pubsie
 *
 * @license
 * Copyright (c) 2025 Arad Fadaei.
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

import AdmZip from "adm-zip";
import parseContainer, { Container } from "./utils/metainfParser";
import EntryNotFoundError from "./utils/errors/EntryNotFoundError";
import ExtractionError from "./utils/errors/ExtractionError";
import MimetypeError from "./utils/errors/MimetypeError";

const MIMETYPE: string = "application/epub+zip";

interface Epub {
  container?: Container;
}

class Entry {
  #entry: AdmZip.IZipEntry;
  public name: string;

  constructor(entry: AdmZip.IZipEntry) {
    this.#entry = entry;
    this.name = entry.entryName;
  }

  read(password: string) {}

  raw() {
    return this.#entry;
  }
}

/**
 * pubsie main class for parsing epub files
 */
export class Pubsie {
  #file: string;
  #password: string | undefined;
  #entries!: AdmZip.IZipEntry[];
  #zip!: AdmZip;
  #epub!: Epub;

  constructor(pathToEpub: string, epubPassword?: string) {
    this.#password = epubPassword;
    this.#file = pathToEpub;
    this.#epub = {};

    this.#openFile();
    this.#validateMimetype();
  }

  async parse(): Promise<Epub> {
    const meta_inf = "META-INF/";

    // check if epub is encrypted, if encrypted throw error and stop parsing
    try {
      this.#findEntry(meta_inf + "encryption.xml");
    } catch (err: any) {
      if (!(err instanceof EntryNotFoundError)) {
        throw err;
      }
    }

    let content = this.#extractContent(
      this.#findEntry(meta_inf + "container.xml"),
    );

    if (content) {
      this.#epub.container = await parseContainer(content);
    }

    let pathToOpf = this.#getOpfRootfile();
    content = this.#extractContent(this.#findEntry(pathToOpf?.fullPath));

    return this.#epub;
  }

  #findEntry(entryName: string): AdmZip.IZipEntry {
    const entry = this.#entries.find((e) => e.entryName === entryName);

    if (!entry) {
      throw new EntryNotFoundError("Entry not found: ", entryName);
    }
    return entry;
  }

  #extractContent(entry: AdmZip.IZipEntry): Buffer {
    const result = this.#password
      ? this.#zip.readFile(entry, this.#password)
      : this.#zip.readFile(entry);

    if (!result)
      throw new ExtractionError(
        "entry not found or unreadable",
        entry.entryName,
      );

    return result;
  }

  #getOpfRootfile() {
    let rootfiles = this.#epub.container?.rootfiles;
    const expectedMediaType = "application/oebps-package+xml";

    if (rootfiles) {
      let rootfile = rootfiles.find((rf) => {
        return rf.mediaType === expectedMediaType;
      });

      if (rootfile) {
        return rootfile;
      }
    }

    // console.log(rootfiles)
    throw new MimetypeError(
      "container has no rootfile with required mimetype",
      undefined,
      expectedMediaType,
    );
  }

  #validateMimetype() {
    const mimetypeFile = this.#findEntry("mimetype");

    const mimetype = this.#extractContent(mimetypeFile);
    const actualMimetype = mimetype.toString("utf-8");
    if (actualMimetype !== MIMETYPE) {
      throw new MimetypeError(
        "invalid mimetype in epub archive",
        actualMimetype,
        MIMETYPE,
      );
    }
  }

  #openFile() {
    if (!this.#file) {
      throw new Error("Pubsie requires file arg");
    }

    this.#zip = new AdmZip(this.#file);
    this.#entries = this.#zip.getEntries();
  }
}
