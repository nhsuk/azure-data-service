const moment = require('moment');

function fileVersionFilter(outputFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-(\\d{8}).*-${version}.json`);
  return (file) => {
    const match = regex.exec(file.name);
    if (match && match[1]) {
      const date = moment(match[1], 'YYYYMMDD');
      return date.isBefore(oldestDate);
    }
    return false;
  };
}

module.exports = fileVersionFilter;
