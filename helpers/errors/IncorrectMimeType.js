class IncorrectMimeTypeError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "IncorrectMimeTypeError";
  }
}

module.exports = IncorrectMimeTypeError