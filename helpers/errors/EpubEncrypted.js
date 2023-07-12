const _Error = require("./_error.js");

class EpubEncryptedError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "EpubEncryptedError";
  }
}

module.exports = EpubEncryptedError;
