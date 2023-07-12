function parseRootFileManifest(manifest) {
  const items = manifest.item;

  let obj = {
    id: (manifest.$ === undefined) ? undefined : manifest.$.id,
    items: []
  };

  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i].$;

      obj.items.push({
        fallback: item["fallback"],
        href: item["href"],
        id: item["id"],
        mediaType: item["media-type"],
        mediaOverlay: item["media-overlay"],
        properties: item["properties"],
      });
    }
  }


  return obj;
}

module.exports = { parseRootFileManifest };
