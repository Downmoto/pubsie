const path = require("path");
const fs = require("fs");
const pubsie = require("../pubsie.js");

const epub_folder = path.join(__dirname, "./data/");
const out_folder = path.join(__dirname, "./out/");

function getRandomEpub() {
  let files = fs
    .readdirSync(epub_folder)
    .filter((file) => file.endsWith(".epub"));

  return files[~~(Math.random() * files.length)];
}

function getPubsie() {
  return new pubsie(epub_folder + getRandomEpub());
}

module.exports = {
  getRandomEpub,
  getPubsie,
  epub_folder,
  out_folder
};
