class RequiredEpubMetadataMissingError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = "RequiredEpubMetadataMissing";
  }
}

module.exports = RequiredEpubMetadataMissingError
