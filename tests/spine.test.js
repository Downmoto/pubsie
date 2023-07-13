const { getPubsie, out_folder } = require("./helper.js");
const pubsie = require("../pubsie.js");

describe("spine test cases", () => {
  it("should parse spine items from root file(s)", () => {
    let pub = getPubsie();
    pub.parse();

    let randomIndex =
      pub.epub.spine[0].itemrefs[
        ~~(Math.random() * pub.epub.spine[0].itemrefs.length)
      ];

    let expected_objects = {
      id: expect.toBeOneOf([expect.any(String), undefined]),
      idref: expect.any(String),
      linear: expect.toBeOneOf([expect.any(String), undefined]),
      properties: expect.toBeOneOf([expect.any(String), undefined]),
    };

    expect(randomIndex).toMatchObject(expected_objects);
  });
});

describe("spine error test cases", () => {
  it("should listen for error event and call mock callback", () => {
    let mockCb = jest.fn((err) => err.data.name);
    let pub = new pubsie(out_folder + "DIRTY.epub");

    pub.on("error", mockCb);
    pub.parse();

    let m = mockCb.mock.results.filter((obj) => obj.value == "NoNcxError");

    expect(mockCb).toHaveBeenCalled();
    expect(m[0]).toEqual({ type: "return", value: "NoNcxError" });

    m = mockCb.mock.results.filter((obj) => obj.value == "EmptySpineError");
    expect(m[0]).toEqual({ type: "return", value: "EmptySpineError" });
  });
});
