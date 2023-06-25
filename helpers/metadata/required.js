const { RequiredEpubMetadataMissingError } = require("../errors");

function parseRootFileRequiredMetadata(metadata, options) {
  return {
    identifier: parseIdentifier(metadata["dc:identifier"]),
    title: parseTitle(metadata["dc:title"]),
    language: parseLanguage(metadata["dc:language"], options.isLegacy),
    dcterms_modified: ParseDctermsModified(metadata["meta"], options.isLegacy),
  };
}

function parseIdentifier(metadata) {
  let e = [];
  metadata.forEach((tag) => {
    let dci = {
      id: tag.$.id,
      identifier: tag._,
    };
    e.push(dci);
  });

  if (e == 0) {
    throw new RequiredEpubMetadataMissingError(
      "Epub is missing dc:identifier metadata"
    );
  }

  return e;
}

function parseTitle(metadata) {
  let e = { primary: "", additional: [] };
  for (let i = 0; i < metadata.length; i++) {
    let title = metadata[i];
    if (title.$) {
      title = {
        title: title._,
        dir: title.$.dir,
        id: title.$.id,
        'xml:lang': title.$['xml:lang']
      }
    }

    if (i == 0) {
      e.primary = title;
    } else {
      e.push(title);
    }
  }

  if (metadata.length == 0) {
    throw new RequiredEpubMetadataMissingError(
      "Epub is missing dc:title metadata"
    );
  }

  return e;
}

function parseLanguage(metadata, isLegacy) {
  let e = { primary: "", additional: [] };
  for (let i = 0; i < metadata.length; i++) {
    let language = metadata[i];
    if (isLegacy) language = language._;

    if (i == 0) {
      e.primary = language;
    } else {
      e.additional.push(language);
    }
  }

  if (metadata.length == 0) {
    throw new RequiredEpubMetadataMissingError(
      "Epub is missing dc:language metadata"
    );
  }

  return e;
}

function ParseDctermsModified(metadata, isLegacy) {
  let e;
  metadata.forEach((meta) => {
    if (meta.$.property == "dcterms:modified") {
      e = meta._;
    }
  });

  if (!e && !isLegacy) {
    throw new RequiredEpubMetadataMissingError(
      "Epub is missing dcterms_modified (last modified date) metadata"
    );
  }
  return e;
}

module.exports = parseRootFileRequiredMetadata;
