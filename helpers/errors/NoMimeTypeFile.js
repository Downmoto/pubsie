class NoMimeTypeFileError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "NoMimeTypeFileError";
  }
}

module.exports = NoMimeTypeFileError