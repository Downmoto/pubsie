function endsWithAny(acc, str) {
  return acc.some((ext) => {
    return str.endsWith(ext);
  });
};


module.exports = {
    endsWithAny
}
