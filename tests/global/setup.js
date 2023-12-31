const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const path = require("path");
const fs = require("fs");

const pubsie = require(path.join(__dirname, "../../pubsie.js"));
const { getRandomEpub } = require("../helper.js")

// CHANGE THIS TO TEST OTHER EPUBs
const SETUP_BASE_FILEPATH = getRandomEpub();

const SETUP_DATA_FILEPATH = path.join(__dirname, "../data/");
const SETUP_OUT_DIRECTORY = path.join(__dirname, "../out/");

function buildDirectories() {
  let dirs = [
    SETUP_OUT_DIRECTORY,
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
}

module.exports = function (globalConfig, projectConfig) {
  buildDirectories();

  const zip = new AdmZip(SETUP_DATA_FILEPATH + SETUP_BASE_FILEPATH);

  const contentOpfEntry = zip.getEntry("OEBPS/content.opf");
  const contentOpfData = contentOpfEntry.getData().toString("utf8");

  const parser = new xml2js.Parser();
  parser.parseString(contentOpfData, (err, result) => {
    if (err) throw new Error(err);

    let metadata = result.package.metadata[0];
    let manifest = result.package.manifest[0];
    let spine = result.package.spine[0];

    delete manifest['item']
    delete spine['itemref']

    delete metadata["dc:identifier"];
    delete metadata["dc:language"];
    delete metadata["meta"].filter(
      (meta) => meta.$.property == "dcterms:modified"
    );

    metadata["dc:title"] = ["WRONG TITLE - WRONG TITLE"];

    const BUILDER = new xml2js.Builder();
    const updatedContentOpfData = BUILDER.buildObject(result);

    zip.updateFile(
      "OEBPS/content.opf",
      Buffer.from(updatedContentOpfData),
      "utf8"
    );

    zip.writeZip(SETUP_OUT_DIRECTORY + "DIRTY.epub");
  });

  console.log("\n### Setup complete ###");
};
