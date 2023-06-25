// "contributor",
//   "creator",
//   "coverage",
//   "date",
//   "description",
//   "format",
//   "publisher",
//   "relation",
//   "rights",
//   "source",
//   "subject",
//   "type";

function parseRootFileOptionalMetadata(metadata, options) {
  return {
    unparsed: {
      link: parseLink(metadata["link"]),
    },
    creator: parseContributor(metadata["dc:creator"]),
    contributor: parseContributor(metadata["dc:contributor"]),
    date: parseDate(metadata["dc:date"], options.isLegacy),
  };
}

function parseLink(metadata) {
  let e = [];
  if (metadata) {
    metadata.forEach((link) => {
      e.push(link);
    });
  }
  return e;
}

function parseContributor(metadata) {
  let e = [];
  if (metadata) {
    metadata.forEach((c) => {
      e.push(c._);
    });
    return e;
  }
}

function parseDate(metadata, isLegacy) {
  let e = []
  if (metadata) {
    metadata.forEach(date => {
      e.push(isLegacy ? date._ : date)
    })
  }
  console.log(e)
  return e;
}

module.exports = {
  parseRootFileOptionalMetadata,
};
