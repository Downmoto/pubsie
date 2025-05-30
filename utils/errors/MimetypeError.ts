export default class MimetypeError extends Error {
  actualMimetype?: string;
  expectedMimetype?: string;

  constructor(message?: string, actualMimetype?: string, expectedMimetype?: string) {
    const errorMessage = message || "invalid mimetype";

    super(errorMessage);
    this.name = "MimetypeError";
    this.actualMimetype = actualMimetype;
    this.expectedMimetype = expectedMimetype;
    Object.setPrototypeOf(this, MimetypeError.prototype);
  }
}
