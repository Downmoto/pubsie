const _Error = require("./_error.js");

class NoNcxError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "NoNcxError";
  }
}

module.exports = NoNcxError;
