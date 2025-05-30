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

const MIMETYPE: string = "application/epub+zip";

interface Epub {
  container?: Container;
}

/**
 * pubsie main class for parsing epub files
 */
export class Pubsie {
  #file: string;
  #password: string | undefined;
  #entries!: AdmZip.IZipEntry[];
  #zip!: AdmZip;
  #epub: Epub;

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
      // if the error is Entry not found, continue parsing function,
      // if the error is something else, throw it
      if (
        !(
          err instanceof Error &&
          err.message === `Entry not found: ${meta_inf}encryption.xml`
        )
      ) {
        throw err;
      }
    }

    let content = this.#extractContent(
      this.#findEntry(meta_inf + "container.xml"),
    );

    if (content) {
      this.#epub.container = await parseContainer(content);
      // the remaining documents are non-normative and will not be parsed
    }
    return this.#epub;
  }

  #findEntry(entryName: string): AdmZip.IZipEntry {
    const entry = this.#entries.find((e) => e.entryName === entryName);

    if (!entry) {
      throw new Error(`Entry not found: ${entryName}`);
    }
    return entry;
  }

  #extractContent(entry: AdmZip.IZipEntry): Buffer {
    const result = this.#password
      ? this.#zip.readFile(entry, this.#password)
      : this.#zip.readFile(entry);

    if (!result)
      throw new Error(
        "Failed to extract content: entry not found or unreadable",
      );

    return result;
  }

  #validateMimetype() {
    const mimetypeFile = this.#findEntry("mimetype");

    const mimetype = this.#extractContent(mimetypeFile);
    if (mimetype.toString("utf-8") !== MIMETYPE) {
      throw new Error("Invalid mimetype in EPUB archive");
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
