const _Error = require("./_error.js");

class IncorrectMimeTypeError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "IncorrectMimeTypeError";
  }
}

module.exports = IncorrectMimeTypeError;
