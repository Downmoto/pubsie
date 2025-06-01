import { Pubsie } from "../pubsie";
import * as path from "path";
import * as fs from "fs";
import AdmZip from "adm-zip";

const epubPath = path.join(__dirname, "test_files", "Persia.epub");
const mocksDir = path.join(__dirname, "mocks");
const containerMocksDir = path.join(mocksDir, "container");

describe("Spoofed container.xml tests", () => {
  afterEach(() => {
    try {
      const tempEpubPath = path.join(__dirname, "test_files", "temp_test.epub");
      if (fs.existsSync(tempEpubPath)) {
        fs.unlinkSync(tempEpubPath);
      }
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  });

  it("should throw error for container.xml with different path", async () => {
    const mockPath = path.join(containerMocksDir, "container.xml");
    const tempEpubPath = createSpoofedEpub(mockPath);

    let pub = new Pubsie(tempEpubPath);
    await expect(pub.parse()).rejects.toThrow();
  });

  it("should throw error for container.xml with multiple rootfiles", async () => {
    const mockPath = path.join(
      containerMocksDir,
      "container_multiple_rootfiles.xml",
    );
    const tempEpubPath = createSpoofedEpub(mockPath);

    let pub = new Pubsie(tempEpubPath);
    await expect(pub.parse()).rejects.toThrow();
  });

  it("should throw error for container.xml with incorrect mime type", async () => {
    const mockPath = path.join(containerMocksDir, "container_wrong_mime.xml");
    const tempEpubPath = createSpoofedEpub(mockPath);

    let pub = new Pubsie(tempEpubPath);
    await expect(pub.parse()).rejects.toThrow();
  });

  it("should handle a container.xml with links", async () => {
    const mockPath = path.join(containerMocksDir, "container_with_links.xml");
    const tempEpubPath = createSpoofedEpub(mockPath);

    let pub = new Pubsie(tempEpubPath);
    await expect(pub.parse()).resolves.not.toThrow();
  });

  it("should handle a comprehensive container.xml with multiple rootfiles and links", async () => {
    const mockPath = path.join(containerMocksDir, "container_complete.xml");
    const tempEpubPath = createSpoofedEpub(mockPath);

    let pub = new Pubsie(tempEpubPath);
    await expect(pub.parse()).resolves.not.toThrow();
  });

  it("should handle a container.xml with a link missing the media-type attribute", async () => {
    const mockPath = path.join(
      containerMocksDir,
      "container_missing_mediatype.xml",
    );
    const tempEpubPath = createSpoofedEpub(mockPath);

    let pub = new Pubsie(tempEpubPath);
    await expect(pub.parse()).resolves.not.toThrow();
  });
});

function createSpoofedEpub(mockContainerPath: string): string {
  const originalEpub = fs.readFileSync(epubPath);
  const tempEpubPath = path.join(__dirname, "test_files", "temp_test.epub");
  fs.writeFileSync(tempEpubPath, originalEpub);

  // Load the temp EPUB and replace the container.xml
  const zip = new AdmZip(tempEpubPath);
  const mockContainer = fs.readFileSync(mockContainerPath);

  zip.updateFile("META-INF/container.xml", mockContainer);
  zip.writeZip(tempEpubPath);

  return tempEpubPath;
}
