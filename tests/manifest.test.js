const { getPubsie, out_folder } = require("./helper.js");
const pubsie = require("../pubsie.js");

describe("manifest test cases", () => {
  it("should parse manifest items from root file(s)", () => {
    let pub = getPubsie();
    pub.parse();

    let randomIndex =
      pub.epub.manifest[0][~~(Math.random() * pub.epub.manifest[0].length)];

    let expected_objects = {
      fallback: expect.toBeOneOf([expect.any(String), undefined]),
      href: expect.any(String),
      id: expect.any(String),
      mediaType: expect.any(String),
      mediaOverlay: expect.toBeOneOf([expect.any(String), undefined]),
      properties: expect.toBeOneOf([expect.any(String), undefined]),
    };

    expect(randomIndex).toMatchObject(expected_objects);
  });
});

describe("manifest error test cases", () => {
  it("should listen for error event and call mock callback", () => {
    let mockCb = jest.fn((err) => err.data.name);
    let pub = new pubsie(out_folder + "DIRTY.epub");

    pub.on("error", mockCb);
    pub.parse();

    let m = mockCb.mock.results.filter((obj) => obj.value == "NoNcxError");

    expect(mockCb).toHaveBeenCalled();
    expect(m[0]).toEqual({ type: "return", value: "NoNcxError" });

    m = mockCb.mock.results.filter((obj) => obj.value == "EmptyManifestError");
    expect(m[0]).toEqual({ type: "return", value: "EmptyManifestError" });
  });
});
