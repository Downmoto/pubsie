const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const path = require('path')

const epubFilePath = path.join(__dirname, '../data/moby.epub')

// Read the EPUB file
const zip = new AdmZip(epubFilePath);

// Read the content.opf file from the EPUB
const contentOpfEntry = zip.getEntry("OEBPS/content.opf");
const contentOpfData = contentOpfEntry.getData().toString("utf8");

console.log(contentOpfData)

// // Parse the content.opf XML
const parser = new xml2js.Parser();
parser.parseString(contentOpfData, (err, result) => {
  if (err) {
    console.error("Error parsing content.opf XML:", err);
    return;
  }

  // Update the metadata
  const metadata = result.package.metadata[0];

  // Update specific metadata fields
  metadata["dc:title"] = [updatedMetadata.title];
  metadata["dc:creator"] = [{ _: updatedMetadata.author, $: { opf: "role" } }];

  // Convert the modified XML back to string
  const builder = new xml2js.Builder();
  const updatedContentOpfData = builder.buildObject(result);

  // Update the content.opf file in the EPUB
  zip.updateFile("content.opf", Buffer.from(updatedContentOpfData, "utf8"));

  // Save the modified EPUB
  const outputFilePath = "/path/to/save/modified.epub";
  zip.writeZip(outputFilePath);

  console.log("EPUB metadata updated and saved to:", outputFilePath);
});
