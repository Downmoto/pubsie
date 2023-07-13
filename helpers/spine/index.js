function parseRootFileSpine(spine) {
  let obj = {};
  if (spine.$) {
    (obj.id = spine.$.id), (obj.toc = spine.$.toc);
    obj["page-progression-direction"] = spine.$["page-progression-direction"];
  }

  obj.itemrefs = [];

  if (spine.itemref) {
    for (let index = 0; index < spine.itemref.length; index++) {
      const ref = spine.itemref[index].$;

      obj.itemrefs.push({
        id: ref["id"],
        idref: ref["idref"],
        linear: ref["linear"],
        properties: ref["properties"],
      });
    }
  }

  return obj;
}

module.exports = { parseRootFileSpine };
