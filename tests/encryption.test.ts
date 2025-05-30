import { Pubsie } from "../pubsie";
import * as path from "path";
import * as fs from "fs";
import AdmZip from "adm-zip";

const epubPath = path.join(__dirname, "test_files", "Persia.epub");

describe("EPUB encryption handling", () => {
  // clean up temporary files after each test
  afterEach(() => {
    try {
      const tempEpubPath = path.join(
        __dirname,
        "test_files",
        "encrypted_test.epub",
      );
      if (fs.existsSync(tempEpubPath)) {
        fs.unlinkSync(tempEpubPath);
      }
    } catch (err) {
      console.error("cleanup failed:", err);
    }
  });

  it("should parse an epub without encryption.xml", async () => {
    // standard epub without encryption.xml should parse successfully
    const pub = new Pubsie(epubPath);
    await expect(pub.parse()).resolves.not.toThrow();
  });

  it("should parse an epub with encryption.xml", async () => {
    // create a copy of the test epub and add encryption.xml to it
    const encryptedEpubPath = path.join(
      __dirname,
      "test_files",
      "encrypted_test.epub",
    );

    // copy the original epub
    fs.copyFileSync(epubPath, encryptedEpubPath);

    // add encryption.xml to it
    const zip = new AdmZip(encryptedEpubPath);
    zip.addFile(
      "META-INF/encryption.xml",
      Buffer.from(
        '<?xml version="1.0"?><encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container"></encryption>',
      ),
    );
    zip.writeZip(encryptedEpubPath);

    const pub = new Pubsie(encryptedEpubPath);
    await expect(pub.parse()).resolves.not.toThrow();
  });
});
