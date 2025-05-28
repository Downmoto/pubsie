import { Pubsie } from "../pubsie";
import * as path from "path";
import * as fs from "fs";

const epubPath = path.join(__dirname, "test_files", "Persia.epub");
// test_password.zip has a single entry called mimetype
// the contents are the epub mimetype
const zipWithPasswordPath = path.join(
  __dirname,
  "test_files",
  "test_password.zip",
);

describe("Pubsie", () => {
  it("should open a file with a valid mimetype", () => {
    expect(() => new Pubsie(epubPath)).not.toThrow();
  });

  it("should throw if file argument is missing", () => {
    // @ts-expect-error
    expect(() => new Pubsie()).toThrow("Pubsie requires file arg");
  });

  it("should throw if mimetype file is missing", () => {
    // Create a zip without mimetype for this test
    const AdmZip = require("adm-zip");
    const tmpZipPath = path.join(__dirname, "test_files", "no_mimetype.zip");
    const zip = new AdmZip();
    zip.addFile("somefile.txt", Buffer.from("test"));
    zip.writeZip(tmpZipPath);

    expect(() => new Pubsie(tmpZipPath)).toThrow(
      "No mimetype file found in archive",
    );

    fs.unlinkSync(tmpZipPath);
  });

  it("should throw if mimetype is invalid", () => {
    // Create a zip with wrong mimetype
    const AdmZip = require("adm-zip");
    const tmpZipPath = path.join(__dirname, "test_files", "bad_mimetype.zip");
    const zip = new AdmZip();
    zip.addFile("mimetype", Buffer.from("not-an-epub"));
    zip.writeZip(tmpZipPath);

    expect(() => new Pubsie(tmpZipPath)).toThrow();

    fs.unlinkSync(tmpZipPath);
  });

  it("should open a password-protected zip if password is correct", () => {
    expect(() => new Pubsie(zipWithPasswordPath, "12345")).not.toThrow();
  });

  it("should throw if password is incorrect for password-protected zip", () => {
    expect(() => new Pubsie(zipWithPasswordPath, "wrong-password")).toThrow();
  });
});
