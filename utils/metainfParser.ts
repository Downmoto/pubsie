import { parseStringPromise } from "xml2js";
import * as fs from "fs";
import * as path from "path";
import { validateElements } from "./schemaValidator";

const CONTAINER_SCHEMA_PATH = path.join(
  __dirname,
  "./schemas/container.schema.json",
);

export interface Container {
  version: number;
  rootfiles: Rootfile[];
  links?: Link[];
}

interface Rootfile {
  fullPath: string;
  mediaType: string;
}

interface Link {
  href: string;
  mediaType?: string;
  rel: string;
}

function containerSchemaValidate(xml: any) {
  const schemaRaw = fs.readFileSync(CONTAINER_SCHEMA_PATH, "utf-8");
  const schema = JSON.parse(schemaRaw);
  const containerElement = xml.container;

  let errors = validateElements(containerElement, schema.root, "");

  if (errors.length > 0) {
    console.error("Validation errors:");
    errors.forEach((error) => {
      console.error(`  ${error.path}: ${error.message}`);
    });
    throw new Error(`XML validation failed with ${errors.length} error(s)`);
  }
}

export default async function parseContainer(
  content: Buffer,
): Promise<Container> {
  let xml = content.toString("utf-8");

  try {
    const result = await parseStringPromise(xml);
    containerSchemaValidate(result);

    let root = result.container;
    const container: Container = {
      version: root.$.version,
      rootfiles: root.rootfiles[0].rootfile.map((rf: any) => ({
        fullPath: rf.$["full-path"],
        mediaType: rf.$["media-type"],
      })),
      links: root.links
        ? root.links[0].link.map((link: any) => ({
            href: link.$.href,
            mediaType: link.$["media-type"] || undefined,
            rel: link.$.rel,
          }))
        : undefined,
    };

    return container;
  } catch (err: any) {
    throw new Error(`Failed to parse container.xml: ${err.message}`);
  }
}
