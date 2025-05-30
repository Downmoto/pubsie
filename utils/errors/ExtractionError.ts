export default class ExtractionError extends Error {
  entryName?: string;

  constructor(message?: string, entryName?: string) {
    const errorMessage = entryName
      ? `failed to extract content: ${entryName}`
      : message || "failed to extract content";

    super(errorMessage);
    this.name = "ExtractionError";
    this.entryName = entryName;
    Object.setPrototypeOf(this, ExtractionError.prototype);
  }
}
