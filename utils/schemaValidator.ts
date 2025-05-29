export interface SchemaNode {
  name: string;
  usage: string;
  attr?: Array<{
    name: string;
    usage: string;
    value?: string;
    type?: string;
  }>;
  children?: SchemaNode[];
}

interface ValidationError {
  path: string;
  message: string;
}

export function validateElements(
  element: any,
  schema: SchemaNode,
  path: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const currentPath = path ? `${path}.${schema.name}` : schema.name;

  // Check if element exists when required
  if (schema.usage === "1" && !element) {
    errors.push({
      path: currentPath,
      message: `Required element '${schema.name}' is missing`,
    });
    return errors;
  }

  // Validate attributes
  if (schema.attr) {
    const attributes = element.$ || {};

    for (const attrSchema of schema.attr) {
      const attrValue = attributes[attrSchema.name];

      if (attrSchema.usage === "1" && !attrValue) {
        errors.push({
          path: `${currentPath}@${attrSchema.name}`,
          message: `Required attribute '${attrSchema.name}' is missing`,
        });
      }

      if (attrSchema.value && attrValue !== attrSchema.value) {
        errors.push({
          path: `${currentPath}@${attrSchema.name}`,
          message: `Attribute '${attrSchema.name}' must have value '${attrSchema.value}', got '${attrValue}'`,
        });
      }
    }
  }

  // Validate children
  if (schema.children) {
    for (const childSchema of schema.children) {
      const childElements = element[childSchema.name];

      if (childSchema.usage === "1") {
        // Exactly one required
        if (!childElements || childElements.length === 0) {
          errors.push({
            path: `${currentPath}.${childSchema.name}`,
            message: `Required child element '${childSchema.name}' is missing`,
          });
        } else if (childElements.length > 1) {
          errors.push({
            path: `${currentPath}.${childSchema.name}`,
            message: `Element '${childSchema.name}' should appear exactly once, found ${childElements.length}`,
          });
        } else {
          // Validate the single child
          errors.push(
            ...validateElements(childElements[0], childSchema, currentPath),
          );
        }
      } else if (childSchema.usage === "1+") {
        // One or more required
        if (!childElements || childElements.length === 0) {
          errors.push({
            path: `${currentPath}.${childSchema.name}`,
            message: `At least one '${childSchema.name}' element is required`,
          });
        } else {
          // Validate each child
          childElements.forEach((child: any, index: number) => {
            errors.push(
              ...validateElements(
                child,
                childSchema,
                `${currentPath}[${index}]`,
              ),
            );
          });
        }
      } else if (childSchema.usage === "0+" || childSchema.usage === "0-1") {
        // Optional elements
        if (childElements && childElements.length > 0) {
          if (childSchema.usage === "0-1" && childElements.length > 1) {
            errors.push({
              path: `${currentPath}.${childSchema.name}`,
              message: `Element '${childSchema.name}' should appear at most once, found ${childElements.length}`,
            });
          }

          // Validate existing children
          childElements.forEach((child: any, index: number) => {
            errors.push(
              ...validateElements(
                child,
                childSchema,
                `${currentPath}[${index}]`,
              ),
            );
          });
        }
      }
    }
  }

  return errors;
}
