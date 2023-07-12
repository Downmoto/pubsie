function parseRootFileManifest(manifest) {
  const items = manifest.item;

  let e = [];

  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i].$;

      e.push({
        fallback: item["fallback"],
        href: item["href"],
        id: item["id"],
        mediaType: item["media-type"],
        mediaOverlay: item["media-overlay"],
        properties: item["properties"],
      });
    }
  }

  return e;
}

module.exports = { parseRootFileManifest };
