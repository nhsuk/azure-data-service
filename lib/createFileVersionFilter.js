function fileVersionFilter(outputFile, version) {
  const regex = new RegExp(`^${outputFile}-\\d{8}.*-${version}.json`);
  return file => file.name.match(regex);
}

module.exports = fileVersionFilter;
