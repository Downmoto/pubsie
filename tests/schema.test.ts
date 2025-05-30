import { validateElements } from "../utils/schemaValidator";

describe("schema validation", () => {
  // basic validation tests
  describe("basic validation", () => {
    it("should validate a simple required element that exists", () => {
      const schema = {
        name: "test",
        usage: "1",
      };

      const element = { test: "value" };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0);
    });

    it("should return error for missing required element", () => {
      const schema = {
        name: "test",
        usage: "1",
      };

      const element = null;

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("Required element");
    });
  });

  // attribute validation tests
  describe("attribute validation", () => {
    it("should validate required attributes", () => {
      const schema = {
        name: "root",
        usage: "1",
        attr: [{ name: "version", usage: "1" }],
      };

      const element = {
        $: {
          version: "1.0",
        },
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0);
    });

    it("should return error for missing required attribute", () => {
      const schema = {
        name: "root",
        usage: "1",
        attr: [{ name: "version", usage: "1" }],
      };

      const element = {
        $: {},
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("Required attribute");
    });

    it("should validate attribute value constraints", () => {
      const schema = {
        name: "root",
        usage: "1",
        attr: [{ name: "version", usage: "1", value: "1.0" }],
      };

      const element = {
        $: {
          version: "2.0",
        },
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("must have value");
    });
  });

  // child validation tests
  describe("child element validation", () => {
    it("should validate exactly one required child element", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "1",
          },
        ],
      };

      const element = {
        child: [{ name: "child-value" }],
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0);
    });

    it("should return error for missing required child element", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "1",
          },
        ],
      };

      const element = {};

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("missing");
    });

    it("should return error for too many child elements when exactly one is required", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "1",
          },
        ],
      };

      const element = {
        child: [{ name: "child1" }, { name: "child2" }],
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("exactly once");
    });
  });

  // complex nested validation tests
  describe("complex nested validation", () => {
    it("should validate a complex nested structure", () => {
      const schema = {
        name: "container",
        usage: "1",
        attr: [{ name: "version", usage: "1", value: "1.0" }],
        children: [
          {
            name: "rootfiles",
            usage: "1",
            children: [
              {
                name: "rootfile",
                usage: "1+",
                attr: [
                  { name: "full-path", usage: "1" },
                  {
                    name: "media-type",
                    usage: "1",
                    value: "application/oebps-package+xml",
                  },
                ],
              },
            ],
          },
        ],
      };

      const element = {
        $: { version: "1.0" },
        rootfiles: [
          {
            rootfile: [
              {
                $: {
                  "full-path": "OEBPS/content.opf",
                  "media-type": "application/oebps-package+xml",
                },
              },
            ],
          },
        ],
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0);
    });

    it("should validate a structure with multiple optional children", () => {
      const schema = {
        name: "container",
        usage: "1",
        children: [
          {
            name: "required",
            usage: "1",
          },
          {
            name: "optional",
            usage: "0-1",
          },
          {
            name: "multipleitems",
            usage: "0+",
          },
        ],
      };

      const element = {
        required: [{ value: "test" }],
        optional: [{ value: "optional" }],
        multipleitems: [{ value: "item1" }, { value: "item2" }],
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0);
    });

    it("should validate children with one-or-more cardinality", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "1+",
          },
        ],
      };

      const element = {
        child: [{ value: "child1" }, { value: "child2" }, { value: "child3" }],
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0);
    });

    it("should return error for too many occurrences of 0-1 element", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "0-1",
          },
        ],
      };

      const element = {
        child: [{ value: "child1" }, { value: "child2" }],
      };

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("at most once");
    });
  });

  // usage pattern tests
  describe("usage pattern validation", () => {
    it("should handle '1+' usage pattern", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "1+",
          },
        ],
      };

      const element = {};

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("At least one");
    });

    it("should handle optional '0+' usage pattern", () => {
      const schema = {
        name: "parent",
        usage: "1",
        children: [
          {
            name: "child",
            usage: "0+",
          },
        ],
      };

      const element = {};

      const errors = validateElements(element, schema, "");
      expect(errors).toHaveLength(0); // no errors as child is optional
    });
  });

  // real-world container.xml validation
  describe("container.xml validation", () => {
    it("should validate against a standard container.xml schema", () => {
      const containerSchema = {
        name: "container",
        usage: "1",
        attr: [{ name: "version", usage: "1", value: "1.0" }],
        children: [
          {
            name: "rootfiles",
            usage: "1",
            children: [
              {
                name: "rootfile",
                usage: "1+",
                attr: [
                  { name: "full-path", usage: "1" },
                  {
                    name: "media-type",
                    usage: "1",
                    value: "application/oebps-package+xml",
                  },
                ],
              },
            ],
          },
          {
            name: "links",
            usage: "0+",
            children: [
              {
                name: "link",
                usage: "1+",
                attr: [
                  { name: "href", usage: "1" },
                  { name: "rel", usage: "1" },
                  { name: "media-type", usage: "0-1" },
                ],
              },
            ],
          },
        ],
      };

      // valid container.xml with rootfiles and links
      const validContainer = {
        $: { version: "1.0" },
        rootfiles: [
          {
            rootfile: [
              {
                $: {
                  "full-path": "OEBPS/content.opf",
                  "media-type": "application/oebps-package+xml",
                },
              },
            ],
          },
        ],
        links: [
          {
            link: [
              {
                $: {
                  href: "metadata.xml",
                  rel: "metadata",
                  "media-type": "application/xml",
                },
              },
            ],
          },
        ],
      };

      const errors = validateElements(validContainer, containerSchema, "");
      expect(errors).toHaveLength(0);
    });

    it("should detect missing required media-type in container.xml", () => {
      const containerSchema = {
        name: "container",
        usage: "1",
        attr: [{ name: "version", usage: "1", value: "1.0" }],
        children: [
          {
            name: "rootfiles",
            usage: "1",
            children: [
              {
                name: "rootfile",
                usage: "1+",
                attr: [
                  { name: "full-path", usage: "1" },
                  {
                    name: "media-type",
                    usage: "1",
                    value: "application/oebps-package+xml",
                  },
                ],
              },
            ],
          },
        ],
      };

      // invalid container.xml missing media-type
      const invalidContainer = {
        $: { version: "1.0" },
        rootfiles: [
          {
            rootfile: [
              {
                $: {
                  "full-path": "OEBPS/content.opf",
                  // media-type is missing
                },
              },
            ],
          },
        ],
      };

      const errors = validateElements(invalidContainer, containerSchema, "");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain("Required attribute");
    });
  });
});
