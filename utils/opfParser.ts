export interface Opf {}

export default async function parseOpf(content: Buffer): Promise<undefined> {
  let xml = content.toString("utf-8");
}
