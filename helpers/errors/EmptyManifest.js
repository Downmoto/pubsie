const _Error = require("./_error.js");

class EmptyManifestError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "EmptyManifestError";
  }
}

module.exports = EmptyManifestError;
