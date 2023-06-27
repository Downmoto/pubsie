function parseRootFileOptionalMetadata(metadata, options) {
  return {
    creator: parseContributor(metadata["dc:creator"]),
    contributor: parseContributor(metadata["dc:contributor"]),
    date: parseDate(metadata["dc:date"], options.isLegacy),
    subject: parseSubject(metadata["dc:subject"]),
    type: parseType(metadata["dc:type"]),
    coverage: parseRemainingOptionals(metadata["dc:coverage"], "coverage"),
    desc: parseRemainingOptionals(metadata["dc:description"], "description"),
    source: parseRemainingOptionals(metadata["dc:source"], "source"),
    format: parseRemainingOptionals(metadata["dc:format"], "format"),
    publisher: parseRemainingOptionals(metadata["dc:publisher"], "publisher"),
    relation: parseRemainingOptionals(metadata["dc:relation"], "relation"),
    rights: parseRemainingOptionals(metadata["dc:rights"], "rights"),
    meta: parseMeta(metadata["meta"]),
    unparsed: {
      link: parseLink(metadata["link"]),
    },
  };
}

// possible TODO: parse links
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
      e.push({ name: c._, attrs: c.$ });
    });
    return e;
  }
}

function parseDate(metadata, isLegacy) {
  let e = [];
  if (metadata) {
    metadata.forEach((date) => {
      e.push(isLegacy ? { date: date._, event: date.$["opf:event"] } : date);
    });
  }
  return e;
}

function parseSubject(metadata) {
  let e = [];
  if (metadata) {
    metadata.forEach((subject) => {
      let s = subject;
      if (s.$) {
        s = {
          id: subject.$.id,
          subject: subject._,
        };
      }
      e.push(s);
    });
  }

  return e;
}

function parseType(metadata) {
  if (metadata) {
    return metadata;
  }
}

function parseRemainingOptionals(metadata, key) {
  let e = [];
  if (metadata) {
    metadata.forEach((n) => {
      let x = n;
      if (x.$) {
        x = {
          dir: n.$.dir,
          id: n.$.id,
          "xml:lang": n.$["xml:lang"],
        };
        x[key] = n._;
      }
      e.push(x);
    });
  }
  return e;
}

function parseMeta(metadata) {
  let e = {};
  metadata.forEach((meta) => {
    e[`${meta._ ?? meta.$.property ?? meta.$.name}`] = meta.$;
  });
  return e;
}

module.exports = parseRootFileOptionalMetadata;
