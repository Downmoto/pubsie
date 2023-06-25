const { RequiredEpubMetadataMissing } = require("../errors/pubsie.error.js");

function parseRootFileRequiredMetadata(metadata, options) {
  return {
    identifier: parseIdentifier(metadata),
    title: parseTitle(metadata),
    language: parseLanguage(metadata, options.isLegacy),
    dcterms_modified: ParseDctermsModified(metadata, options.isLegacy),
    unparsed: {
      meta: [],
    },
  };
}

function parseIdentifier(metadata) {
  let e = [];
  metadata["dc:identifier"].forEach((tag) => {
    let dci = {
      id: tag.$.id,
      identifier: tag._,
    };
    e.push(dci);
  });

  if (e == 0) {
    throw new RequiredEpubMetadataMissing(
      "Epub is missing dc:identifier metadata"
    );
  }

  return e;
}

function parseTitle(metadata) {
  let e = { primary: "", additional: [] };
  for (let i = 0; i < metadata["dc:title"].length; i++) {
    const title = metadata["dc:title"][i];

    if (i == 0) {
      e.primary = title;
    } else {
      e.push(title);
    }
  }

  if (metadata["dc:title"].length == 0) {
    throw new RequiredEpubMetadataMissing("Epub is missing dc:title metadata");
  }

  return e;
}

function parseLanguage(metadata, isLegacy) {
  let e = { primary: "", additional: [] };
  for (let i = 0; i < metadata["dc:language"].length; i++) {
    let language = metadata["dc:language"][i];
    if (isLegacy) language = language._;

    if (i == 0) {
      e.primary = language;
    } else {
      e.additional.push(language);
    }
  }

  if (metadata["dc:language"].length == 0) {
    throw new RequiredEpubMetadataMissing(
      "Epub is missing dc:language metadata"
    );
  }

  return e;
}

function ParseDctermsModified(metadata, isLegacy) {
  let e;
  metadata["meta"].forEach((meta) => {
    if (meta.$.property == "dcterms:modified") {
      e = meta._;
    }
  });

  if (!e && !isLegacy) {
    throw new RequiredEpubMetadataMissing(
      "Epub is missing dcterms_modified (last modified date) metadata"
    );
  }
  return e;
}

module.exports = {
  parseRootFileRequiredMetadata,
};
