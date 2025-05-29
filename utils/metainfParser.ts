import { parseString } from "xml2js";
import * as fs from "fs";
import * as path from "path";
import { validateElements } from "./schemaValidator";

const CONTAINER_SCHEMA_PATH = path.join(__dirname, "./schemas/container.schema.json");

function containerSchemaValidate(buffer: Buffer) {
  const xml = buffer.toString("utf-8");
  parseString(xml, (err, result) => {
    if (err) {
      throw new Error("Failed to parse XML: " + err.message);
    }

    const schemaRaw = fs.readFileSync(CONTAINER_SCHEMA_PATH, "utf-8");
    const schema = JSON.parse(schemaRaw)
    const containerElement = result.container

    let errors = validateElements(containerElement, schema.root, "")

    if (errors.length > 0) {
      console.error("Validation errors:");
      errors.forEach((error) => {
        console.error(`  ${error.path}: ${error.message}`);
      });
      throw new Error(
        `XML validation failed with ${errors.length} error(s)`,
      );
    }

  });
}

export default function parseContainer(content: Buffer) {
  containerSchemaValidate(content);
}
