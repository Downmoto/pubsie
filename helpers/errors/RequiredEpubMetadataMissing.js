const _Error = require("./_error.js");

class RequiredEpubMetadataMissingError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "RequiredEpubMetadataMissingError";
  }
}

module.exports = RequiredEpubMetadataMissingError;
