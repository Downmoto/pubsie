class IncorrectMimeTypeError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "IncorrectMimeTypeError";
  }
}

class NoMimeTypeFileError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "NoMimeTypeFileError";
  }
}

class EpubEncryptedError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = "EpubEncryptedError"
  }
}

module.exports = {
  IncorrectMimeTypeError: IncorrectMimeTypeError,
  NoMimeTypeFileError: NoMimeTypeFileError,
  EpubEncryptedError: EpubEncryptedError
};
