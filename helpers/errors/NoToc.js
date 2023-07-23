const _Error = require("./_error.js");

class NoTocError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "NoTocError";
  }
}

module.exports = NoTocError;
