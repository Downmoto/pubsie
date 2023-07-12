const _Error = require("./_error.js");

class NoMimeTypeFileError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "NoMimeTypeFileError";
  }
}

module.exports = NoMimeTypeFileError;
