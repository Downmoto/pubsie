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
import { parseString } from "xml2js";

const MIMETYPE: string = "application/epub+zip";

export class Pubsie {
  #file: string;
  #password: string | undefined;
  #entries!: AdmZip.IZipEntry[];
  #zip!: AdmZip;

  constructor(pathToEpub: string, epubPassword?: string) {
    this.#password = epubPassword;
    this.#file = pathToEpub;
    if (!this.#file) {
      throw new Error("Pubsie requires file arg");
    }

    this.#openFile();
    this.#validateMimetype();
  }

  #findEntry(entryName: string): AdmZip.IZipEntry | undefined {
    return this.#entries.find((e) => e.entryName === entryName);
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

    if (!mimetypeFile) {
      throw new Error("No mimetype file found in archive");
    }

    const mimetype = this.#extractContent(mimetypeFile);
    if (mimetype.toString("utf-8") !== MIMETYPE) {
      throw new Error("Invalid mimetype in EPUB archive");
    }
  }

  #openFile() {
    this.#zip = new AdmZip(this.#file);
    this.#entries = this.#zip.getEntries();
  }
}
