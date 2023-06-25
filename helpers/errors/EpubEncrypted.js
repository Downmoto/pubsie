class EpubEncryptedError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "EpubEncryptedError";
  }
}

module.exports = EpubEncryptedError