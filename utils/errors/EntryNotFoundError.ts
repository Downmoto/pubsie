export default class EntryNotFoundError extends Error {
  entryName?: string;

  constructor(message?: string, entryName?: string) {
    const errorMessage = entryName
      ? `Entry not found: ${entryName}`
      : message || "Entry not found";

    super(errorMessage);
    this.name = "EntryNotFound";
    this.entryName = entryName;
    Object.setPrototypeOf(this, EntryNotFoundError.prototype);
  }
}
