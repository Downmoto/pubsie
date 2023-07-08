const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const path = require("path");
const fs = require("fs");

const pubsie = require(path.join(__dirname, "../../pubsie.js"));

// CHANGE THIS TO TEST OTHER EPUBs
const SETUP_BASE_FILEPATH = "moby.epub";

const SETUP_DATA_FILEPATH = path.join(__dirname, "../data/");
const SETUP_OUT_DIRECTORY = path.join(__dirname, "../out/");

function buildCache() {
  let filenames = fs.readdirSync(SETUP_DATA_FILEPATH);

  filenames.forEach((file) => {
    let epub = new pubsie(
      SETUP_DATA_FILEPATH.concat(file),
      SETUP_OUT_DIRECTORY
    );

    epub.parse();
    epub.buildCache(SETUP_OUT_DIRECTORY.concat(`cached_data/${file}`));
  });
}

function buildDirectories() {
  let dirs = [
    SETUP_OUT_DIRECTORY,
    path.join(SETUP_OUT_DIRECTORY, "cached_data/"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
}

module.exports = function (globalConfig, projectConfig) {
  buildDirectories();
  buildCache();

  const zip = new AdmZip(SETUP_DATA_FILEPATH + SETUP_BASE_FILEPATH);

  const contentOpfEntry = zip.getEntry("OEBPS/content.opf");
  const contentOpfData = contentOpfEntry.getData().toString("utf8");

  const parser = new xml2js.Parser();
  parser.parseString(contentOpfData, (err, result) => {
    if (err) throw new Error(err);

    let metadata = result.package.metadata[0];

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

    zip.writeZip(SETUP_OUT_DIRECTORY + SETUP_BASE_FILEPATH);

    console.log("\n### Setup complete ###");
  });
};
