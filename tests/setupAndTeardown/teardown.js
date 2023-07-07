const path = require("path");
const fs = require("fs");

const TEARDOWN_DATA_FILEPATH = path.join(__dirname, "../data/cached_data");
const TEARDOWN_OUT_DIRECTORY = path.join(__dirname, "../out/");

function teardown() {
  let dirs = [TEARDOWN_DATA_FILEPATH, TEARDOWN_OUT_DIRECTORY];

  dirs.forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

    console.log("### Teardown complete ###");

}

teardown();
