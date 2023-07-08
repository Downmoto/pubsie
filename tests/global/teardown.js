const path = require("path");
const fs = require("fs");

const TEARDOWN_DATA_FILEPATH = path.join(__dirname, "../data/cached_data");
const TEARDOWN_OUT_DIRECTORY = path.join(__dirname, "../out/");

module.exports = function (globalConfig, projectConfig) {
  let dirs = [TEARDOWN_DATA_FILEPATH, TEARDOWN_OUT_DIRECTORY];

  if (projectConfig.globals.TEARDOWN) {
    dirs.forEach((dir) => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    console.log(`### Teardown complete ###`);
  } else {
    console.log("### Teardown did not occur ###");
    console.log("change jest global variable TEARDOWN to true (package.json)");
  }
};
