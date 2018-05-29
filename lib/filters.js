const moment = require('moment');
const libConfig = require('./config');

function dateExpired(regex, file, oldestDate) {
  const match = regex.exec(file.name);
  if (match && match[1]) {
    const date = moment(match[1], libConfig.dateFormat);
    return date.isBefore(oldestDate);
  }
  return false;
}

function createExpiredDataFilter(outputFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-(\\d{8})-${version}.json`);
  return file => dateExpired(regex, file, oldestDate);
}

function createExpiredSummaryFilter(outputFile, summaryFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-${summaryFile}-(\\d{8})-${version}.json`);
  return file => dateExpired(regex, file, oldestDate);
}

function createExpiredIdListFilter(outputFile, version, oldestDate) {
  const regex = new RegExp(`^${outputFile}-seed-ids-(\\d{8}).json`);
  return file => dateExpired(regex, file, oldestDate);
}

function createFileVersionFilter(outputFile, version) {
  const regex = new RegExp(`^${outputFile}-\\d{8}.*-${version}.json`);
  return file => file.name.match(regex);
}

function createIdListFilter(seedIdFile) {
  return file => file.name.startsWith(`${seedIdFile}-`);
}

function createSummaryFileFilter(outputFile, summaryFile) {
  return file => file.name.startsWith(`${outputFile}-${summaryFile}`);
}

module.exports = {
  createExpiredDataFilter,
  createExpiredIdListFilter,
  createExpiredSummaryFilter,
  createFileVersionFilter,
  createIdListFilter,
  createSummaryFileFilter,
};
