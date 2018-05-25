const moment = require('moment');

function createExpiredDataFilter(outputFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-(\\d{8})-${version}.json`);
  return (file) => {
    const match = regex.exec(file.name);
    if (match && match[1]) {
      const date = moment(match[1], 'YYYYMMDD');
      return date.isBefore(oldestDate);
    }
    return false;
  };
}
function createExpiredSummaryFilter(outputFile, summaryFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-${summaryFile}-(\\d{8})-${version}.json`);
  return (file) => {
    const match = regex.exec(file.name);
    if (match && match[1]) {
      const date = moment(match[1], 'YYYYMMDD');
      return date.isBefore(oldestDate);
    }
    return false;
  };
}

function createExpiredIdListFilter(outputFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-seed-ids-(\\d{8}).json`);
  return (file) => {
    const match = regex.exec(file.name);
    if (match && match[1]) {
      const date = moment(match[1], 'YYYYMMDD');
      return date.isBefore(oldestDate);
    }
    return false;
  };
}

module.exports = {
  createExpiredDataFilter,
  createExpiredIdListFilter,
  createExpiredSummaryFilter,
};
