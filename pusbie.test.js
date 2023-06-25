// TODO: Possible test suite for .epub related Errors
const {
  IncorrectMimeTypeError,
  NoMimeTypeFileError,
  EpubEncryptedError,
  RequiredEpubMetadataMissing,
} = require("./helpers/errors/pubsie.error.js");
const pubsie = require("./pubsie.js");
const fs = require("fs");

// build test data directories
beforeAll(() => {
  let dirs = ["./data/test_data/cached_data/", "./data/test_out"];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
});

describe("raw data test", () => {
  let pub = [];
  beforeAll(() => {
    const test_data = "./data/test_data/";
    const output = "./data/test_out/";

    let filenames = fs.readdirSync(test_data);
    filenames.forEach((file) => {
      if (!fs.lstatSync(test_data.concat(file)).isDirectory()) {
        let epub = new pubsie(test_data.concat(file), output.concat(file));
        epub.parse();
        epub.buildCache(test_data.concat(`cached_data/${file}`));

        pub.push(epub);
      }
    });
  });
  it("should do nothing", () => {});
});

describe("cached data tests", () => {
  let pub = [];
  beforeAll(() => {
    const test_data = "./data/test_data/cached_data/";
    const output = "./data/test_out/";

    let filenames = fs.readdirSync(test_data);
    filenames.forEach((file) => {
      let epub = new pubsie(test_data.concat(file), output.concat(file));
      epub.parse();

      pub.push(epub);
    });
  });
  it("should do nothing", () => {});
});
