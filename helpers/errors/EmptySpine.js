const _Error = require("./_error.js");

class EmptySpineError extends _Error {
  constructor(message, data = {}) {
    super(message, data);
    this.data.name = "EmptySpineError";
  }
}

module.exports = EmptySpineError;
